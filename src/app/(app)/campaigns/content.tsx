'use client';

import React, {ReactElement, useCallback, useMemo, useState} from 'react';
import {
  ControlledDataGridProps,
  NextControlledDataGrid,
  FilterComponentProps,
  generatePathStorage,
} from '@Oimmei-Digital-Boutique/crema-components';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {GridActionsCellItem, GridColDef} from '@mui/x-data-grid';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Campaign, CampaignListFilter, CampaignStatus} from '@/types/models/Campaign';
import {CAMPAIGN_STATS, WIZARD_STEP_1} from '@/shared/constants/AppRoutes';
import {useSnackbar} from 'notistack';
import {
  createCampaign,
  deleteCampaign,
  getCampaignsPaginated,
} from '@/shared/helpers/api/campaignApiHelper';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {useTranslations} from 'next-intl';
import GridActionsLinkCellItem from '@/@oimmei/components/Mui/GridActionsLinkCellItem';

const statusColor: Record<CampaignStatus, 'warning' | 'info' | 'success'> = {
  draft: 'warning',
  scheduled: 'info',
  sending: 'info',
  sent: 'success',
};

const defaultParameters = {
  sortBy: 'created_at' as keyof Campaign,
  filters: {} as CampaignListFilter,
};

const CampaignFilterComponent = (
  {filterValues, onFilterChanged}: FilterComponentProps<CampaignListFilter>,
) => {
  const t = useTranslations('campaign');

  const handleStatusChange = (_: React.MouseEvent, value: string | null) => {
    const status = value && value !== '' ? value as CampaignStatus : undefined;
    onFilterChanged({status});
  };

  return (
    <Box sx={{display: 'flex', justifyContent: 'flex-start', marginBottom: 2}}>
      <ToggleButtonGroup
        value={filterValues.status ?? ''}
        exclusive
        onChange={handleStatusChange}
        size="small"
      >
        <ToggleButton value="">{t('status.all')}</ToggleButton>
        <ToggleButton value="draft">{t('status.draft')}</ToggleButton>
        <ToggleButton value="scheduled">{t('status.scheduled')}</ToggleButton>
        <ToggleButton value="sent">{t('status.sent')}</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

const CampaignContent = (): ReactElement => {
  const t = useTranslations();
  const {enqueueSnackbar} = useSnackbar();
  const {performAsyncCall} = useAsyncCallHelper2Actions();
  const router = useRouter();

  const {
    result: campaigns,
    setResult: setCampaigns,
    loading: campaignsLoading,
    perform: fetchCampaignList,
  } = useAsyncLoader(getCampaignsPaginated, true);

  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  const handleDuplicate = useCallback((id: number) => {
    performAsyncCall(createCampaign({fromTemplateId: id}))
      .then((res) => {
        if (res?.item?.id) {
          enqueueSnackbar({message: t('campaign.success.duplicated'), variant: 'success'});
          router.push(generatePathStorage(WIZARD_STEP_1, {id: res.item.id.toString()}));
        }
      })
      .catch(console.error);
  }, [performAsyncCall, router, enqueueSnackbar, t]);

  const columns = useMemo<GridColDef<Campaign>[]>(
    () => {
      const statusLabels: Record<CampaignStatus, string> = {
        draft: t('campaign.status.draft'),
        scheduled: t('campaign.status.scheduled'),
        sending: t('campaign.status.sending'),
        sent: t('campaign.status.sent'),
      };

      return [
        {
          field: 'name',
          headerName: t('campaign.field.name'),
          flex: 2,
          renderCell: ({row}) => (
            <Box sx={{py: 0.5}}>
              <Typography variant="body2" fontWeight={500}>
                {row.name ?? row.email_subject}
              </Typography>
              {row.name && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {row.email_subject}
                </Typography>
              )}
            </Box>
          ),
        },
        {
          field: 'mail_list_ids',
          headerName: t('campaign.field.mail_list_ids'),
          width: 110,
          sortable: false,
          renderCell: ({row}) => row.mail_list_ids.length,
        },
        {
          field: 'status',
          headerName: t('campaign.field.draft'),
          width: 130,
          sortable: false,
          renderCell: ({row}) => (
            <Chip
              label={statusLabels[row.status]}
              size="small"
              color={statusColor[row.status]}
            />
          ),
        },
        {
          field: 'created_at',
          headerName: t('campaign.field.created_at'),
          width: 170,
          renderCell: ({row}) => row.created_at
            ? new Date(row.created_at).toLocaleString('it-IT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            : '—',
        },
        {
          field: 'actions',
          type: 'actions',
          headerName: t('messages.col.actions'),
          getActions: ({row}) => [
            ...(row.status === 'draft' ? [
              <GridActionsLinkCellItem
                key="edit"
                label={t('messages.btn.edit')}
                component={Link}
                href={generatePathStorage(WIZARD_STEP_1, {id: row.id.toString()})}
                showInMenu
              />,
            ] : []),
            <GridActionsLinkCellItem
              key="view"
              label={t('campaign.btn.view')}
              component={Link}
              href={generatePathStorage(CAMPAIGN_STATS, {id: row.id.toString()})}
              showInMenu
            />,
            <GridActionsCellItem
              key="duplicate"
              label={t('campaign.btn.duplicate')}
              onClick={() => handleDuplicate(row.id)}
              disabled={!row.template}
              showInMenu
            />,
            ...(row.status === 'draft' ? [
              <GridActionsCellItem
                key="delete"
                label={t('messages.btn.delete')}
                onClick={() => setDeletingCampaign({...row})}
                showInMenu
              />,
            ] : []),
          ],
        },
      ];
    },
    [t, handleDuplicate],
  );

  const onParametersChanged =
    useCallback<ControlledDataGridProps<Campaign, CampaignListFilter, void>['onInit']>(
      (parameters) => {
        fetchCampaignList({...parameters}).catch(console.error);
      },
      [fetchCampaignList],
    );

  const closeDeleteModal = () => setDeletingCampaign(null);

  const confirmDelete = (campaign: Campaign) => {
    performAsyncCall(deleteCampaign(campaign.id))
      .then(() => {
        setCampaigns(prev => prev !== null ? {
          ...prev,
          items: prev.items?.filter(c => c.id !== campaign.id) ?? prev.items,
        } : prev);
        enqueueSnackbar({message: t('campaign.success.deleted'), variant: 'success'});
      })
      .catch(console.error);
    closeDeleteModal();
  };

  return (
    <>
      <NextControlledDataGrid<Campaign, CampaignListFilter,
        React.ComponentProps<typeof CampaignFilterComponent>>
        filterWrapper={CampaignFilterComponent}
        defaultParameters={defaultParameters}
        columns={columns}
        rows={campaigns?.items ?? []}
        rowCount={campaigns?.pagination?.item_count ?? 0}
        onInit={onParametersChanged}
        onParametersChanged={onParametersChanged}
        error={campaigns?.error}
        loading={campaignsLoading}
        slotProps={{
          loadingOverlay: {variant: 'skeleton', noRowsVariant: 'skeleton'},
        }}
        noPadding
      />

      <Dialog
        open={deletingCampaign !== null}
        onClose={closeDeleteModal}
        aria-labelledby="delete-campaign-dialog-title"
      >
        <DialogTitle id="delete-campaign-dialog-title">
          {deletingCampaign !== null && t('campaign.message.delete.title', {name: deletingCampaign.email_subject})}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('campaign.message.delete.description')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal}>{t('messages.btn.cancel')}</Button>
          <Button onClick={() => confirmDelete(deletingCampaign as Campaign)} autoFocus color="error">
            {t('messages.btn.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CampaignContent;
