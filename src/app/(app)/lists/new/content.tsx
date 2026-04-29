'use client';

import React, {ReactElement} from "react";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {useRouter} from 'next/navigation';
import {newMailList} from '@/types/models/MailList';
import {MAIL_LIST_CRUD_LIST} from '@/shared/constants/AppRoutes';
import MailListForm from '@/components/maillist/MailListForm';

const MailListNewContent = (): ReactElement | null => {
  const router = useRouter();

  const onOperationCompleted = (): void => {
    router.push(generatePathStorage(MAIL_LIST_CRUD_LIST));
  };

  return (
    <MailListForm
      mailList={newMailList}
      editing={false}
      onOperationCompleted={onOperationCompleted}
    />
  );
};

export default MailListNewContent;
