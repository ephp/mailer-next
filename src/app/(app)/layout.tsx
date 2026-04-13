import React, {ReactElement} from 'react';
import DefaultLayout from '@/@oimmei/core/AppLayout/DefaultLayout';
import AppGuard from './guard';

/**
 * Base layout for every app page the user needs to be authenticated for.
 */
export default function (
  {children}: { children: React.ReactNode },
): ReactElement {
  return (
    <AppGuard>
      <DefaultLayout>
        {children}
      </DefaultLayout>
    </AppGuard>
  );
}
