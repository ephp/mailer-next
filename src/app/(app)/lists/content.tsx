'use client';

import React, {ReactElement, useCallback, useMemo, useState} from "react";
import {
  ControlledDataGridProps,
  NextControlledDataGrid,
  FilterComponentProps,
  generatePathStorage,
} from "@Oimmei-Digital-Boutique/crema-components";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Link from 'next/link';
import {MailList, MailListListFilter} from '@/types/models/MailList';
import {MAIL_LIST_CRUD_EDIT, MAIL_LIST_CONTACTS, STATISTICS_LIST} from '@/shared/constants/AppRoutes';
import AppSearchBar2 from '../../../@oimmei/core/AppSearchBar2';
import {useSnackbar} from 'notistack';
import {deleteMailList, getMailLists} from '@/shared/helpers/api/mailListApiHelper';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {useTranslations} from 'next-intl';
import GridActionsLinkCellItem from '@/@oimmei/components/Mui/GridActionsLinkCellItem';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const defaultSortField = "name";

const defaultParameters = {
  sortBy: defaultSortField as keyof MailList,
  filters: {fts: ""},
};

const MailListFilterComponent = (
  {filterValues, onFilterChanged}: FilterComponentProps<MailListListFilter>,
) => {
  const t = useTranslations('messages');

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: 'flex-end',
        alignItems: "center",
        width: 1,
        marginBottom: 2,
      }}
    >
      <AppSearchBar2
        value={filterValues.fts}
        onChange={(e) => onFilterChanged({fts: e.target.value})}
        placeholder={t("common.placeholders.search")}
      />
    </Box>
  );
};

const MailListContent = () => {
  const t = useTranslations();
  const {enqueueSnackbar} = useSnackbar();
  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const {
    result: mailLists,
    setResult: setMailLists,
    loading: mailListsLoading,
    perform: fetchMailListList,
  } = useAsyncLoader(getMailLists, true);

  const [deletingMailList, setDeletingMailList] = useState<MailList | null>(null);

  const columns = useMemo<GridColDef<MailList>[]>(
    () => ([
      {
        field: "name",
        headerName: t("maillist.field.name"),
        flex: 1,
      },
      {
        field: "description",
        headerName: t("maillist.field.description"),
        flex: 2,
        sortable: false,
      },
      {
        field: "contact_count",
        headerName: t("maillist.field.contact_count"),
        width: 120,
        sortable: false,
      },
      {
        field: "permetti_disiscrizione",
        headerName: t("maillist.field.permetti_disiscrizione"),
        width: 120,
        renderCell: (params) => params.row.permetti_disiscrizione
          ? <CheckIcon/>
          : <ClearIcon/>,
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: t("messages.col.actions"),
        getActions: ({row}) => [
          <GridActionsLinkCellItem
            key="contacts"
            label={t("maillist.btn.contacts")}
            component={Link}
            href={generatePathStorage(MAIL_LIST_CONTACTS, {id: row.id.toString()})}
            showInMenu
          />,
          <GridActionsLinkCellItem
            key="stats"
            label={t("statistics.btn.view_list_stats")}
            component={Link}
            href={generatePathStorage(STATISTICS_LIST, {id: row.id.toString()})}
            showInMenu
          />,
          <GridActionsLinkCellItem
            key="edit"
            label={t("messages.btn.edit")}
            component={Link}
            href={generatePathStorage(MAIL_LIST_CRUD_EDIT, {id: row.id.toString()})}
            showInMenu
          />,
          <GridActionsCellItem
            key="delete"
            label={t("messages.btn.delete")}
            onClick={() => setDeletingMailList({...row})}
            showInMenu
          />,
        ],
      },
    ]),
    [t],
  );

  const onParametersChanged =
    useCallback<ControlledDataGridProps<MailList, MailListListFilter, void>["onInit"]>(
      (parameters) => {
        fetchMailListList({...parameters}).catch((error) => console.error(error));
      },
      [fetchMailListList],
    );

  const closeDeleteModal = () => setDeletingMailList(null);

  const confirmDelete = (mailList: MailList) => {
    performAsyncCall(deleteMailList({id: mailList.id}))
      .then(() => {
        setMailLists(paginatedResult => paginatedResult !== null ? {
          ...paginatedResult,
          items: paginatedResult.items?.filter(item => item.id !== mailList.id) ?? paginatedResult.items,
        } : paginatedResult);
        enqueueSnackbar({message: t("maillist.success.deleted"), variant: 'success'});
      })
      .catch((error) => console.error(error));
    closeDeleteModal();
  };

  return (
    <>
      <NextControlledDataGrid<MailList, MailListListFilter,
        React.ComponentProps<typeof MailListFilterComponent>>
        filterWrapper={MailListFilterComponent}
        defaultParameters={defaultParameters}
        columns={columns}
        rows={mailLists?.items ?? []}
        rowCount={mailLists?.pagination?.item_count ?? 0}
        onInit={onParametersChanged}
        onParametersChanged={onParametersChanged}
        error={mailLists?.error}
        loading={mailListsLoading}
        slotProps={{
          loadingOverlay: {variant: 'skeleton', noRowsVariant: 'skeleton'},
        }}
        noPadding
      />

      <Dialog
        open={deletingMailList !== null}
        onClose={closeDeleteModal}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {deletingMailList !== null && t("maillist.message.delete.title", {name: deletingMailList.name})}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t("maillist.message.delete.description")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal}>{t("messages.btn.cancel")}</Button>
          <Button onClick={() => confirmDelete(deletingMailList as MailList)} autoFocus color="error">
            {t("messages.btn.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MailListContent;
