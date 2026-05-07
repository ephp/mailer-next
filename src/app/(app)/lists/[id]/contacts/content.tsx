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
import {useParams} from 'next/navigation';
import {Contact, ContactListFilter} from '@/types/models/Contact';
import {MAIL_LIST_CONTACTS_EDIT} from '@/shared/constants/AppRoutes';
import AppSearchBar2 from '../../../../../@oimmei/core/AppSearchBar2';
import {useSnackbar} from 'notistack';
import {
  deleteContact,
  getContactList,
  subscribeContact,
  unsubscribeContact,
} from '@/shared/helpers/api/contactApiHelper';
import {MAIL_LIST_CONTACTS_NEW, MAIL_LIST_CONTACTS_IMPORT, TAXONOMY_CATEGORIES} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {useTranslations} from 'next-intl';
import GridActionsLinkCellItem from '@/@oimmei/components/Mui/GridActionsLinkCellItem';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const defaultSortField = "email";

const defaultParameters = {
  sortBy: defaultSortField as keyof Contact,
  filters: {fts: ""},
};

const ContactFilterComponent = (
  {filterValues, onFilterChanged}: FilterComponentProps<ContactListFilter>,
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

const ContactContent = (): ReactElement => {
  const t = useTranslations();
  const {enqueueSnackbar} = useSnackbar();
  const {performAsyncCall} = useAsyncCallHelper2Actions();
  const {id: idParam} = useParams<{id: string}>();
  const listId = parseInt(idParam);

  const {
    result: contacts,
    setResult: setContacts,
    loading: contactsLoading,
    perform: fetchContactList,
  } = useAsyncLoader(getContactList, true);

  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const columns = useMemo<GridColDef<Contact>[]>(
    () => ([
      {
        field: "email",
        headerName: t("contact.field.email"),
        flex: 1,
      },
      {
        field: "nome",
        headerName: t("contact.field.nome"),
        flex: 1,
      },
      {
        field: "cognome",
        headerName: t("contact.field.cognome"),
        flex: 1,
      },
      {
        field: "iscritto",
        headerName: t("contact.field.iscritto"),
        width: 100,
        renderCell: (params) => params.row.iscritto
          ? <CheckIcon titleAccess={t("contact.iscritto.yes")}/>
          : <ClearIcon titleAccess={t("contact.iscritto.no")}/>,
      },
      {
        field: "bounce_count",
        headerName: t("contact.field.bounce_count"),
        width: 100,
        sortable: false,
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: t("messages.col.actions"),
        getActions: ({row}) => {
          const actions: React.ReactElement[] = [
            <GridActionsLinkCellItem
              key="edit"
              label={t("messages.btn.edit")}
              component={Link}
              href={generatePathStorage(MAIL_LIST_CONTACTS_EDIT, {id: idParam, contactId: row.id.toString()})}
              showInMenu
            />,
          ];

          if (row.iscritto) {
            actions.push(
              <GridActionsCellItem
                key="unsubscribe"
                label={t("contact.btn.unsubscribe")}
                onClick={() => {
                  performAsyncCall(unsubscribeContact({listId, id: row.id}))
                    .then((result) => {
                      if (result.item) {
                        setContacts(prev => prev !== null ? {
                          ...prev,
                          items: prev.items?.map(c => c.id === result.item!.id ? {...result.item!} : c) ?? prev.items,
                        } : prev);
                      }
                    })
                    .catch(console.error);
                }}
                showInMenu
              />,
            );
          } else {
            actions.push(
              <GridActionsCellItem
                key="subscribe"
                label={t("contact.btn.subscribe")}
                onClick={() => {
                  performAsyncCall(subscribeContact({listId, id: row.id}))
                    .then((result) => {
                      if (result.item) {
                        setContacts(prev => prev !== null ? {
                          ...prev,
                          items: prev.items?.map(c => c.id === result.item!.id ? {...result.item!} : c) ?? prev.items,
                        } : prev);
                      }
                    })
                    .catch(console.error);
                }}
                showInMenu
              />,
            );
          }

          actions.push(
            <GridActionsCellItem
              key="delete"
              label={t("messages.btn.delete")}
              onClick={() => setDeletingContact({...row})}
              showInMenu
            />,
          );

          return actions;
        },
      },
    ]),
    [t, listId, idParam, performAsyncCall, setContacts],
  );

  const onParametersChanged =
    useCallback<ControlledDataGridProps<Contact, ContactListFilter, void>["onInit"]>(
      (parameters) => {
        fetchContactList({...parameters, listId}).catch((error) => console.error(error));
      },
      [fetchContactList, listId],
    );

  const closeDeleteModal = () => setDeletingContact(null);

  const confirmDelete = (contact: Contact) => {
    performAsyncCall(deleteContact({listId, id: contact.id}))
      .then(() => {
        setContacts(prev => prev !== null ? {
          ...prev,
          items: prev.items?.filter(c => c.id !== contact.id) ?? prev.items,
        } : prev);
        enqueueSnackbar({message: t("contact.success.deleted"), variant: 'success'});
      })
      .catch(console.error);
    closeDeleteModal();
  };

  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2}}>
        <Button
          component={Link}
          variant="text"
          href={generatePathStorage(TAXONOMY_CATEGORIES, {id: idParam})}
        >
          {t('contact.btn.taxonomies')}
        </Button>
        <Button
          component={Link}
          variant="outlined"
          href={generatePathStorage(MAIL_LIST_CONTACTS_IMPORT, {id: idParam})}
        >
          {t('contact.btn.import')}
        </Button>
        <Button
          component={Link}
          variant="contained"
          href={generatePathStorage(MAIL_LIST_CONTACTS_NEW, {id: idParam})}
        >
          {t('contact.btn.create')}
        </Button>
      </Box>

      <NextControlledDataGrid<Contact, ContactListFilter,
        React.ComponentProps<typeof ContactFilterComponent>>
        filterWrapper={ContactFilterComponent}
        defaultParameters={defaultParameters}
        columns={columns}
        rows={contacts?.items ?? []}
        rowCount={contacts?.pagination?.item_count ?? 0}
        onInit={onParametersChanged}
        onParametersChanged={onParametersChanged}
        error={contacts?.error}
        loading={contactsLoading}
        slotProps={{
          loadingOverlay: {variant: 'skeleton', noRowsVariant: 'skeleton'},
        }}
        noPadding
      />

      <Dialog
        open={deletingContact !== null}
        onClose={closeDeleteModal}
        aria-labelledby="delete-contact-dialog-title"
      >
        <DialogTitle id="delete-contact-dialog-title">
          {deletingContact !== null && t("contact.message.delete.title", {email: deletingContact.email})}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("contact.message.delete.description")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal}>{t("messages.btn.cancel")}</Button>
          <Button onClick={() => confirmDelete(deletingContact as Contact)} autoFocus color="error">
            {t("messages.btn.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContactContent;
