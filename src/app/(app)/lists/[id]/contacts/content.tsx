'use client';

import React, {ReactElement, useCallback, useEffect, useMemo, useState} from "react";
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
import {TaxonomyCategory} from '@/types/models/TaxonomyCategory';
import {TaxonomyTerm} from '@/types/models/TaxonomyTerm';
import {Tag} from '@/@oimmei/bundle/tag/type/model/Tag';
import {MAIL_LIST_CONTACTS_EDIT} from '@/shared/constants/AppRoutes';
import AppSearchBar2 from '../../../../../@oimmei/core/AppSearchBar2';
import {useSnackbar} from 'notistack';
import {
  deleteContact,
  getContactList,
  subscribeContact,
  unsubscribeContact,
} from '@/shared/helpers/api/contactApiHelper';
import {getTaxonomyCategoryList} from '@/shared/helpers/api/taxonomyApiHelper';
import {taxonomyTermsHelper} from '@/shared/helpers/api/taxonomyTermApiHelper';
import {MAIL_LIST_CONTACTS_NEW, MAIL_LIST_CONTACTS_IMPORT, TAXONOMY_CATEGORIES} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {useTranslations} from 'next-intl';
import GridActionsLinkCellItem from '@/@oimmei/components/Mui/GridActionsLinkCellItem';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import ContactBouncesDialog from '@/components/contact/ContactBouncesDialog';
import AutocompleteTag from '@/@oimmei/bundle/tag/component/field/AutocompleteTag';

const defaultSortField = "email";

const defaultParameters = {
  sortBy: defaultSortField as keyof Contact,
  filters: {fts: "", taxonomy_term_ids: []} as ContactListFilter,
};

interface ContactFilterExtraProps {
  categories: TaxonomyCategory[];
  termsByCategory: Record<number, TaxonomyTerm[]>;
}

const ContactFilterComponent = (
  {
    filterValues,
    onFilterChanged,
    categories,
    termsByCategory,
  }: FilterComponentProps<ContactListFilter> & ContactFilterExtraProps,
) => {
  const t = useTranslations('messages');
  const selectedIds = filterValues.taxonomy_term_ids ?? [];

  const handleCategoryChange = (categoryId: number, tags: Tag[]): void => {
    const categoryTermIds = new Set((termsByCategory[categoryId] ?? []).map(term => term.id));
    const idsFromOtherCategories = selectedIds.filter(id => !categoryTermIds.has(id));
    const idsFromThisCategory = tags.map(tag => tag.id);
    onFilterChanged({taxonomy_term_ids: [...idsFromOtherCategories, ...idsFromThisCategory]});
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: 1, mb: 2}}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: 'flex-end',
          alignItems: "center",
        }}
      >
        <AppSearchBar2
          value={filterValues.fts}
          onChange={(e) => onFilterChanged({fts: e.target.value})}
          placeholder={t("common.placeholders.search")}
        />
      </Box>

      {categories.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)'},
            gap: 2,
          }}
        >
          {categories.map((category) => {
            const helper = taxonomyTermsHelper(category.id);
            const categoryTerms = termsByCategory[category.id] ?? [];
            const selectedForCategory = categoryTerms.filter(term => selectedIds.includes(term.id));
            return (
              <AutocompleteTag<true>
                key={category.id}
                multiple
                size="small"
                label={category.name}
                value={selectedForCategory}
                fetchAllTags={helper.allTag.bind(helper)}
                onChange={(_event, newValue) => handleCategoryChange(category.id, newValue as Tag[])}
              />
            );
          })}
        </Box>
      )}
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
  const [bouncesContact, setBouncesContact] = useState<Contact | null>(null);
  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [termsByCategory, setTermsByCategory] = useState<Record<number, TaxonomyTerm[]>>({});

  useEffect(() => {
    let cancelled = false;
    getTaxonomyCategoryList({listId})
      .then(async (result) => {
        const cats = result.item ?? [];
        if (cancelled) return;
        setCategories(cats);
        const entries = await Promise.all(
          cats.map(async (cat) => {
            const r = await taxonomyTermsHelper(cat.id).allTag();
            return [cat.id, r.item ?? []] as const;
          }),
        );
        if (!cancelled) {
          setTermsByCategory(Object.fromEntries(entries));
        }
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [listId]);

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
        field: "sent_count",
        headerName: t("contact.field.sent_count"),
        width: 90,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({row}) => row.sent_count ?? 0,
      },
      {
        field: "opened_count",
        headerName: t("contact.field.opened_count"),
        width: 90,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({row}) => row.opened_count ?? 0,
      },
      {
        field: "clicked_count",
        headerName: t("contact.field.clicked_count"),
        width: 90,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({row}) => row.clicked_count ?? 0,
      },
      {
        field: "bounced_failed_count",
        headerName: t("contact.field.bounce_count"),
        width: 110,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({row}) => {
          const n = row.bounced_failed_count;
          if (!n) return 0;
          return (
            <Button
              variant="text"
              size="small"
              onClick={() => setBouncesContact(row)}
              sx={{minWidth: 0, padding: '0 6px', fontWeight: 700}}
            >
              {n}
            </Button>
          );
        },
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
    useCallback<ControlledDataGridProps<Contact, ContactListFilter, ContactFilterExtraProps>["onInit"]>(
      (parameters) => {
        fetchContactList({...parameters, listId}).catch((error) => console.error(error));
      },
      [fetchContactList, listId],
    );

  const filterExtraProps = useMemo<ContactFilterExtraProps>(() => ({
    categories,
    termsByCategory,
  }), [categories, termsByCategory]);

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
        filterWrapperAdditionalProps={filterExtraProps}
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

      <ContactBouncesDialog
        listId={listId}
        contact={bouncesContact}
        open={bouncesContact !== null}
        onClose={() => setBouncesContact(null)}
      />
    </>
  );
};

export default ContactContent;
