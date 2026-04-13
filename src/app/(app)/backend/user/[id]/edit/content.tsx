'use client';

import React, {ReactElement, useCallback, useEffect} from "react";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {useParams, useRouter} from 'next/navigation';
import {USER_CRUD_LIST} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {findUser} from '@/shared/helpers/api/userApiHelper';
import UserForm from '@/components/user/UserForm';

const UserFormPage = (): ReactElement | null => {
  const router = useRouter();

  const {id: idParam} = useParams<{ id: string }>();

  const {
    result: userWrapper,
    setResult: setUser,
    perform: fetchUser,
    loading,
  } = useAsyncLoader(findUser, true);

  const onOperationCompleted = useCallback(() => {
    router.push(
      generatePathStorage(
        USER_CRUD_LIST,
      ),
    );
  }, [router]);

  // Fetching the user on startup, or setting it if it's a create function.
  useEffect(() => {
    fetchUser({id: parseInt(idParam)})
      .catch((error) => console.error(error));
  }, [
    setUser,
    fetchUser,
    idParam,
  ]);

  return (
    <UserForm
      user={userWrapper?.item ?? null}
      editing={true}
      loading={loading}
      onOperationCompleted={onOperationCompleted}
    />
  );
};

export default UserFormPage;
