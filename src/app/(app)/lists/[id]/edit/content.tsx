'use client';

import React, {ReactElement, useCallback, useEffect} from "react";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {useParams, useRouter} from 'next/navigation';
import {MAIL_LIST_CRUD_LIST} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {getMailList} from '@/shared/helpers/api/mailListApiHelper';
import {getAccount} from '@/shared/helpers/api/accountApiHelper';
import MailListForm from '@/components/maillist/MailListForm';
import {useSnackbar} from 'notistack';
import {useTranslations} from 'next-intl';

const MailListEditContent = (): ReactElement | null => {
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();
  const {enqueueSnackbar} = useSnackbar();
  const t = useTranslations();

  const {
    result: mailListWrapper,
    perform: fetchMailList,
    loading,
  } = useAsyncLoader(getMailList, true);

  const {result: accountWrapper, perform: fetchAccount} = useAsyncLoader(getAccount, false);

  const navigateToList = useCallback(() => {
    router.push(generatePathStorage(MAIL_LIST_CRUD_LIST));
  }, [router]);

  useEffect(() => {
    fetchMailList({id: parseInt(idParam)}).catch(() => {
      enqueueSnackbar(t('maillist.error.not_found'), {variant: 'error'});
      router.push(generatePathStorage(MAIL_LIST_CRUD_LIST));
    });
    fetchAccount().catch(console.error);
  }, [fetchMailList, fetchAccount, idParam, enqueueSnackbar, router, t]);

  return (
    <MailListForm
      mailList={mailListWrapper?.item ?? null}
      account={accountWrapper?.item ?? null}
      editing={true}
      loading={loading}
      onOperationCompleted={navigateToList}
      onCancel={navigateToList}
    />
  );
};

export default MailListEditContent;
