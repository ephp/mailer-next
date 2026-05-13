'use client';

import React, {ReactElement, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ControlledDataGridProps,
  NextControlledDataGrid,
  FilterComponentProps,
  generatePathStorage,
} from '@Oimmei-Digital-Boutique/crema-components';
import Box from '@mui/material/Box';
import AppSearchBar2 from '../../../@oimmei/core/AppSearchBar2';
import Dialog from '@mui/material/Dialog';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
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
  duplicateCampaign,
  getCampaignsPaginated,
  getSendingStatus,
} from '@/shared/helpers/api/campaignApiHelper';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {useTranslations} from 'next-intl';
import GridActionsLinkCellItem from '@/@oimmei/components/Mui/GridActionsLinkCellItem';
import SendingProgressModal from '@/components/campaign/SendingProgressModal';
import {SendingStatus} from '@/types/models/CampaignEmail';

const SENDING_POLL_INTERVAL_MS = 10000;

const statusColor: Record<CampaignStatus, 'warning' | 'info' | 'success' | 'error'> = {
  draft: 'warning',
  scheduled: 'info',
  sending: 'info',
  sent: 'success',
  failed: 'error',
};

const sendingChipSx = {
  '@keyframes sending-pulse': {
    '0%': {opacity: 1},
    '50%': {opacity: 0.55},
    '100%': {opacity: 1},
  },
  animation: 'sending-pulse 1.5s ease-in-out infinite',
};

const defaultParameters = {
  sortBy: 'created_at' as keyof Campaign,
  filters: {} as CampaignListFilter,
};

const CampaignFilterComponent = (
  {filterValues, onFilterChanged}: FilterComponentProps<CampaignListFilter>,
) => {
  const t = useTranslations('campaign');
  const tm = useTranslations('messages');

  const handleStatusChange = (_: React.MouseEvent, value: string | null) => {
    const status = value && value !== '' ? value as CampaignStatus : undefined;
    onFilterChanged({status});
  };

  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, marginBottom: 2, flexWrap: 'wrap'}}>
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
      <AppSearchBar2
        value={filterValues.fts ?? ''}
        onChange={(e) => onFilterChanged({fts: e.target.value})}
        placeholder={tm('common.placeholders.search')}
      />
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
  const [sendingStatuses, setSendingStatuses] = useState<Record<number, SendingStatus>>({});
  const [progressModalId, setProgressModalId] = useState<number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sendingIds = campaigns?.items?.filter(c => c.status === 'sending').map(c => c.id) ?? [];

    if (pollingRef.current !== null) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (sendingIds.length === 0) return;

    const fetchStatuses = async () => {
      for (const id of sendingIds) {
        try {
          const result = await getSendingStatus(id);
          if (result.item) {
            setSendingStatuses(prev => ({...prev, [id]: result.item!}));
          }
        } catch {
          // ignore network errors, retry on next poll
        }
      }
    };

    void fetchStatuses();
    pollingRef.current = setInterval(() => { void fetchStatuses(); }, SENDING_POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current !== null) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [campaigns]);

  const handleDuplicate = useCallback((id: number, fromTemplate: boolean) => {
    // Templates use createCampaign({fromTemplateId}) to spawn a new draft
    // from the template; regular campaigns use duplicateCampaign which
    // clones every field plus mail-list associations.
    const call = fromTemplate
      ? createCampaign({fromTemplateId: id})
      : duplicateCampaign(id);
    performAsyncCall(call)
      .then((res) => {
        if (res?.item?.id) {
          enqueueSnackbar({message: t('campaign.success.duplicated'), variant: 'success'});
          router.push(generatePathStorage(WIZARD_STEP_1, {id: res.item.id.toString()}));
        }
      })
      .catch(console.error);
  }, [performAsyncCall, router, enqueueSnackbar, t]);

  const handleRowClick = useCallback((row: Campaign) => {
    if (row.status === 'sending') {
      setProgressModalId(row.id);
    } else if (row.status === 'sent') {
      router.push(generatePathStorage(CAMPAIGN_STATS, {id: row.id.toString()}));
    }
  }, [router]);

  const getRowClassName = useCallback(({row}: {row: Campaign}) =>
    row.status === 'sending' || row.status === 'sent' ? 'row-clickable' : '',
  []);

  const columns = useMemo<GridColDef<Campaign>[]>(
    () => {
      const statusLabels: Record<CampaignStatus, string> = {
        draft: t('campaign.status.draft'),
        scheduled: t('campaign.status.scheduled'),
        sending: t('campaign.status.sending'),
        sent: t('campaign.status.sent'),
        failed: t('campaign.status.failed'),
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
          width: 140,
          sortable: false,
          renderCell: ({row}) => (
            row.status === 'sending' ? (
              <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', gap: 0.5}}>
                <Chip
                  label={statusLabels[row.status]}
                  size="small"
                  color={statusColor[row.status]}
                  sx={sendingChipSx}
                />
                <LinearProgress
                  variant={sendingStatuses[row.id] !== undefined ? 'determinate' : 'indeterminate'}
                  value={sendingStatuses[row.id]?.percent_complete ?? 0}
                  sx={{height: 3, borderRadius: 2}}
                />
              </Box>
            ) : (
              <Chip
                label={statusLabels[row.status]}
                size="small"
                color={statusColor[row.status]}
              />
            )
          ),
        },
        {
          field: 'stats_sent',
          headerName: t('campaign.field.stats_sent'),
          width: 90,
          sortable: false,
          align: 'right',
          headerAlign: 'right',
          renderCell: ({row}) => row.stats_sent ?? '—',
        },
        {
          field: 'stats_unique_opens',
          headerName: t('campaign.field.stats_unique_opens'),
          width: 90,
          sortable: false,
          align: 'right',
          headerAlign: 'right',
          renderCell: ({row}) => row.stats_unique_opens ?? '—',
        },
        {
          field: 'stats_unique_clicks',
          headerName: t('campaign.field.stats_unique_clicks'),
          width: 90,
          sortable: false,
          align: 'right',
          headerAlign: 'right',
          renderCell: ({row}) => row.stats_unique_clicks ?? '—',
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
              onClick={() => handleDuplicate(row.id, row.template)}
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
    [t, handleDuplicate, sendingStatuses],
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
        onRowClick={({row}) => handleRowClick(row)}
        getRowClassName={getRowClassName}
        sx={{
          '& .MuiDataGrid-row.row-clickable': {cursor: 'pointer'},
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

      {progressModalId !== null && (
        <SendingProgressModal
          campaignId={progressModalId}
          open={progressModalId !== null}
          onClose={() => setProgressModalId(null)}
        />
      )}
    </>
  );
};

export default CampaignContent;
