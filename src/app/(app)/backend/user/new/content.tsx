'use client';

import React, {ReactElement} from "react";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import Alert from "@mui/material/Alert";
import {useRouter} from 'next/navigation';
import {newUser} from '@/types/models/User';
import {USER_CRUD_LIST} from '@/shared/constants/AppRoutes';
import UserForm from '@/components/user/UserForm';
import {useTranslations} from 'next-intl';

const UserCrudNewContent = (): ReactElement | null => {
  const t = useTranslations('security');

  const router = useRouter();

  const onOperationCompleted = (): void => {
    router.push(
      generatePathStorage(
        USER_CRUD_LIST,
      ),
    );
  };

  return (
    <>
      <Alert
        severity="info"
        sx={{
          mb: 5,
        }}
      >
        {t("user.messages.first_login_instructions")}
      </Alert>

      <UserForm
        user={newUser}
        editing={false}
        onOperationCompleted={onOperationCompleted}
      />
    </>
  );
};

export default UserCrudNewContent;
