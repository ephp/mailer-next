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
import {User} from '@/types/models/User';
import {UserListFilter} from '@/types/models/UserCrud/UserListQuery';
import {USER_CRUD_EDIT} from '@/shared/constants/AppRoutes';
import AppSearchBar2 from '../../../../@oimmei/core/AppSearchBar2';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import {useSnackbar} from 'notistack';
import {
  disableUser,
  enableUser,
  getUserList,
  resendFirstLoginEmail,
} from '@/shared/helpers/api/userApiHelper';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {
  useAsyncCallHelper2Actions,
} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {useTranslations} from 'next-intl';
import GridActionsLinkCellItem from '@/@oimmei/components/Mui/GridActionsLinkCellItem';

const defaultSortField = "email";

const defaultParameters = {
  sortBy: defaultSortField as keyof User,
  filters: {
    fts: "",
  },
};

/**
 * Filter component.
 */
const UserListFilterComponent = (
  {
    filterValues,
    onFilterChanged,
  }: FilterComponentProps<UserListFilter>,
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
        onChange={(e) => {
          onFilterChanged({
            fts: e.target.value,
          });
        }}
        placeholder={t("common.placeholders.search")}
      />
    </Box>
  );
};

/**
 * Main component.
 */
const UserListComponent = () => {
  const t = useTranslations();

  const {enqueueSnackbar} = useSnackbar();

  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const {
    result: users,
    setResult: setUsers,
    loading: usersLoading,
    perform: fetchUserList,
  } = useAsyncLoader(getUserList, true);

  // The user being enabled or disabled, if any.
  const [
    enablingUser,
    setEnablingUser,
  ] = useState<User | null>(null);

  const columns = useMemo<GridColDef<User>[]>(
    () => ([
      {
        field: "email",
        headerName: t("security.user.field.email"),
        flex: 1,
      },
      {
        field: "role",
        headerName: t("security.user.field.role"),
        flex: 1,
        sortable: false,
        renderCell: (params) => {
          // TODO add more roles?
          if (params.row.oimmei) {
            return t("security.roles.oimmei");
          } else if (params.row.admin) {
            return t("security.roles.admin");
          } else {
            return t("security.roles.user");
          }
        },
      },
      {
        field: "enabled",
        headerName: t("security.user.field.enabled"),
        description: t("security.user.help.enabled"),
        display: 'flex',
        width: 80,
        renderCell: (params) => {
          if (params.row.enabled) {
            return (
              <CheckIcon titleAccess={t("security.user.enabled.enabled")}/>
            );
          } else {
            return (
              <ClearIcon titleAccess={t("security.user.enabled.disabled")}/>
            );
          }
        },
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: t("messages.col.actions"),
        getActions: ({row}) => {
          const result: ReactElement[] = [];

          result.push(
            <GridActionsLinkCellItem
              key={'edit'}
              label={t("messages.btn.edit")}
              component={Link}

              // This is not an error. The IDE claims it is, don't know why.
              href={generatePathStorage(
                USER_CRUD_EDIT,
                {
                  id: row.id.toString(),
                },
              )}
              showInMenu
            />,
          );

          if (row.enabled) {
            result.push(
              <GridActionsCellItem
                key={'disable'}
                label={t("messages.btn.disable")}
                onClick={() => {
                  setEnablingUser({...row});
                }}
                showInMenu
              />,
            );
          } else {
            result.push(
              <GridActionsCellItem
                key={'enable'}
                label={t("messages.btn.enable")}
                onClick={() => {
                  setEnablingUser({...row});
                }}
                showInMenu
              />,
            );
          }

          if (!row.first_login_completed) {
            result.push(
              <GridActionsCellItem
                key={'resend_first_login_email'}
                label={t("security.btn.resend_first_login_email")}
                onClick={() => {
                  performAsyncCall(resendFirstLoginEmail({id: row.id}))
                    .then(() => {
                      enqueueSnackbar({
                        message: t("security.user.success.resend_first_login_email"),
                        variant: 'success',
                      });
                    });
                }}
                showInMenu
              />,
            );
          }

          return result;
        },
      },
    ]),
    [
      enqueueSnackbar,
      performAsyncCall,
      t,
    ],
  );

  // Table callbacks.
  const onParametersChanged =
    useCallback<ControlledDataGridProps<User, UserListFilter, void>[
      "onInit"
      ]>(
      (parameters) => {
        fetchUserList({
          ...parameters,
        })
          // Doing nothing here, because the error will be displayed by the async provider.
          .catch((error) => console.error(error));
      },
      [fetchUserList],
    );

  // Enable/disable callbacks.
  const closeEnableUserModal = () => {
    setEnablingUser(null);
  };

  const enableOrDisableUser = (user: User) => {
    let promise;
    if (user.enabled) {
      promise = disableUser({id: user.id});
    } else {
      promise = enableUser({id: user.id});
    }

    performAsyncCall(promise)
      .then((updatedUser) => {
        if (updatedUser.item) {
          // Updating the list to reflect the changes.
          setUsers(paginatedResult => (paginatedResult !== null ? {
            ...paginatedResult,
            items: paginatedResult.items?.map(
              item => {
                if (item.id === updatedUser.item!.id) {
                  return {...updatedUser.item!};
                } else {
                  return {...item};
                }
              },
            ) ?? paginatedResult.items,
          } : paginatedResult));
        }
      })
      .catch((error) => console.error(error));

    closeEnableUserModal();
  };

  return (
    <>
      <NextControlledDataGrid<User, UserListFilter,
          React.ComponentProps<typeof UserListFilterComponent>>
        filterWrapper={UserListFilterComponent}
        defaultParameters={defaultParameters}
        columns={columns}
        rows={users?.items ?? []}
        rowCount={users?.pagination?.item_count ?? 0}
        onInit={onParametersChanged}
        onParametersChanged={onParametersChanged}
        error={users?.error}
        loading={usersLoading}
        slotProps={{
          loadingOverlay: {
            variant: 'skeleton',
            noRowsVariant: 'skeleton',
          },
        }}
        noPadding
      />

      <Dialog
        open={enablingUser !== null}
        onClose={closeEnableUserModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {enablingUser !== null && (
            enablingUser.enabled ?
              t(
                "security.user_crud.message.disable.title",
                {email: enablingUser.email},
              ) :
              t(
                "security.user_crud.message.enable.title",
                {email: enablingUser.email},
              )
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {enablingUser !== null && (
              enablingUser.enabled ?
                t("security.user_crud.message.disable.description") :
                t("security.user_crud.message.enable.description")
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEnableUserModal}>
            {t("messages.btn.cancel")}
          </Button>
          <Button onClick={() => enableOrDisableUser(enablingUser as User)} autoFocus>
            {t("messages.btn.ok")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserListComponent;
