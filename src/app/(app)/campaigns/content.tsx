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
import {GridActionsCellItem, GridColDef} from '@mui/x-data-grid';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Campaign, CampaignListFilter} from '@/types/models/Campaign';
import {CAMPAIGN_CRUD_EDIT, CAMPAIGN_STATS, CAMPAIGN_TEMPLATES} from '@/shared/constants/AppRoutes';
import AppSearchBar2 from '../../../@oimmei/core/AppSearchBar2';
import {useSnackbar} from 'notistack';
import {deleteCampaign, duplicateCampaign, getCampaignList} from '@/shared/helpers/api/campaignApiHelper';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {useTranslations} from 'next-intl';
import GridActionsLinkCellItem from '@/@oimmei/components/Mui/GridActionsLinkCellItem';
import GroupIcon from '@mui/icons-material/Group';

const defaultSortField = 'id';

const defaultParameters = {
  sortBy: defaultSortField as keyof Campaign,
  filters: {fts: ''},
};

const CampaignFilterComponent = (
  {filterValues, onFilterChanged}: FilterComponentProps<CampaignListFilter>,
) => {
  const t = useTranslations('messages');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: 1,
        marginBottom: 2,
      }}
    >
      <AppSearchBar2
        value={filterValues.fts}
        onChange={(e) => onFilterChanged({fts: e.target.value})}
        placeholder={t('common.placeholders.search')}
      />
    </Box>
  );
};

const CampaignContent = (): ReactElement => {
  const t = useTranslations();
  const {enqueueSnackbar} = useSnackbar();
  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const {
    result: campaigns,
    setResult: setCampaigns,
    loading: campaignsLoading,
    perform: fetchCampaignList,
  } = useAsyncLoader(getCampaignList, true);

  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const router = useRouter();

  const columns = useMemo<GridColDef<Campaign>[]>(
    () => ([
      {
        field: 'email_subject',
        headerName: t('campaign.field.email_subject'),
        flex: 2,
      },
      {
        field: 'name',
        headerName: t('campaign.field.name'),
        flex: 1,
      },
      {
        field: 'recipient_count',
        headerName: t('campaign.field.recipient_count'),
        width: 130,
        sortable: false,
        renderCell: ({row}) => (
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
            <GroupIcon fontSize="small" color="action"/>
            {row.recipient_count}
          </Box>
        ),
      },
      {
        field: 'draft',
        headerName: t('campaign.field.draft'),
        width: 100,
        renderCell: ({row}) => row.draft
          ? <Chip label={t('campaign.status.draft')} size="small" color="warning"/>
          : <Chip label={t('campaign.status.ready')} size="small" color="success"/>,
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: t('messages.col.actions'),
        getActions: ({row}) => [
          <GridActionsLinkCellItem
            key="stats"
            label={t('campaign.btn.view_stats')}
            component={Link}
            href={generatePathStorage(CAMPAIGN_STATS, {id: row.id.toString()})}
            showInMenu
          />,
          <GridActionsLinkCellItem
            key="edit"
            label={t('messages.btn.edit')}
            component={Link}
            href={generatePathStorage(CAMPAIGN_CRUD_EDIT, {id: row.id.toString()})}
            showInMenu
          />,
          <GridActionsCellItem
            key="duplicate"
            label={t('campaign.btn.duplicate')}
            onClick={() => handleDuplicate(row.id)}
            showInMenu
          />,
          <GridActionsCellItem
            key="delete"
            label={t('messages.btn.delete')}
            onClick={() => setDeletingCampaign({...row})}
            showInMenu
          />,
        ],
      },
    ]),
    [t],
  );

  const onParametersChanged =
    useCallback<ControlledDataGridProps<Campaign, CampaignListFilter, void>['onInit']>(
      (parameters) => {
        fetchCampaignList({...parameters}).catch(console.error);
      },
      [fetchCampaignList],
    );

  const handleDuplicate = useCallback((id: number) => {
    performAsyncCall(duplicateCampaign({id}))
      .then((res) => {
        if (res?.item?.id) {
          enqueueSnackbar({message: t('campaign.success.duplicated'), variant: 'success'});
          router.push(generatePathStorage(CAMPAIGN_CRUD_EDIT, {id: res.item.id.toString()}));
        }
      })
      .catch(console.error);
  }, [performAsyncCall, router, enqueueSnackbar, t]);

  const closeDeleteModal = () => setDeletingCampaign(null);

  const confirmDelete = (campaign: Campaign) => {
    performAsyncCall(deleteCampaign({id: campaign.id}))
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
