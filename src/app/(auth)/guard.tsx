'use client';

import React, {ReactElement, useEffect} from 'react';
import {useAuthUser} from '@/@oimmei/utility/AuthHooks';
import {useRouter} from 'next/navigation';
import AppLoader from '@/@oimmei/core/AppLoader';
import {initialUrl} from '@/shared/constants/AppConst';

export default function (
  {children}: { children: React.ReactNode },
): ReactElement {
  const {user, isLoading, isInitialized} = useAuthUser();

  const router = useRouter();

  useEffect(() => {
    if (isInitialized && user) {
      router.push(initialUrl);
    }
  }, [user, isInitialized, router]);

  if (isLoading || user) {
    return (
      <AppLoader/>
    );
  }

  return (
    <>{children}</>
  );
}
