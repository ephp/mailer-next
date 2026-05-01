'use client';

import React, {ReactElement, useEffect} from 'react';
import {Account} from '@/types/models/Account';
import AccountForm from '@/components/account/AccountForm';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {getAccount} from '@/shared/helpers/api/accountApiHelper';
import {useSnackbar} from 'notistack';
import {useTranslations} from 'next-intl';

const AccountSettingsContent = (): ReactElement | null => {
  const t = useTranslations();
  const {enqueueSnackbar} = useSnackbar();

  const {
    result: accountResult,
    loading: accountLoading,
    perform: fetchAccount,
  } = useAsyncLoader(getAccount, false);

  useEffect(() => {
    fetchAccount().catch(() => {
      enqueueSnackbar({
        message: t('messages.common.error.unknown'),
        variant: 'error',
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const account: Account | null = accountResult?.item ?? null;

  const onSaved = () => {
    enqueueSnackbar({
      message: t('account.success.updated'),
      variant: 'success',
    });
    fetchAccount().catch(console.error);
  };

  return (
    <AccountForm
      account={account}
      editing={account !== null}
      loading={accountLoading}
      forMyAccount
      onOperationCompleted={onSaved}
    />
  );
};

export default AccountSettingsContent;
