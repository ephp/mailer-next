'use client';

import React, {ReactElement, useEffect} from 'react';
import {useAuthUser} from '@/@oimmei/utility/AuthHooks';
import {useRouter} from 'next/navigation';
import AppLoader from '@/@oimmei/core/AppLoader';
import {SIGNIN} from '@/shared/constants/AppRoutes';

export default function (
  {children}: { children: React.ReactNode },
): ReactElement {
  const {user, isLoading, isInitialized} = useAuthUser();

  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user && !isLoading) {
      router.push(SIGNIN);
    }
  }, [isInitialized, user, isLoading, router]);

  if (!user || isLoading) {
    return (
      <AppLoader/>
    );
  }

  return (
    <>{children}</>
  );
}
