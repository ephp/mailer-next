'use client';

import React, {ReactElement, useCallback, useEffect} from "react";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {useParams, useRouter} from 'next/navigation';
import {MAIL_LIST_CRUD_LIST} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {findMailList} from '@/shared/helpers/api/mailListApiHelper';
import MailListForm from '@/components/maillist/MailListForm';

const MailListEditContent = (): ReactElement | null => {
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();

  const {
    result: mailListWrapper,
    perform: fetchMailList,
    loading,
  } = useAsyncLoader(findMailList, true);

  const onOperationCompleted = useCallback(() => {
    router.push(generatePathStorage(MAIL_LIST_CRUD_LIST));
  }, [router]);

  useEffect(() => {
    fetchMailList({id: parseInt(idParam)}).catch((error) => console.error(error));
  }, [fetchMailList, idParam]);

  return (
    <MailListForm
      mailList={mailListWrapper?.item ?? null}
      editing={true}
      loading={loading}
      onOperationCompleted={onOperationCompleted}
    />
  );
};

export default MailListEditContent;
