'use client';

import React, {ReactElement, useCallback, useEffect} from "react";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {useRouter} from 'next/navigation';
import {newMailList} from '@/types/models/MailList';
import {MAIL_LIST_CRUD_LIST} from '@/shared/constants/AppRoutes';
import MailListForm from '@/components/maillist/MailListForm';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {getAccount} from '@/shared/helpers/api/accountApiHelper';

const MailListNewContent = (): ReactElement | null => {
  const router = useRouter();

  const {result: accountWrapper, perform: fetchAccount} = useAsyncLoader(getAccount, false);

  useEffect(() => {
    fetchAccount().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOperationCompleted = useCallback((): void => {
    router.push(generatePathStorage(MAIL_LIST_CRUD_LIST));
  }, [router]);

  const onCancel = useCallback((): void => {
    router.push(generatePathStorage(MAIL_LIST_CRUD_LIST));
  }, [router]);

  return (
    <MailListForm
      mailList={newMailList}
      account={accountWrapper?.item ?? null}
      editing={false}
      onOperationCompleted={onOperationCompleted}
      onCancel={onCancel}
    />
  );
};

export default MailListNewContent;
