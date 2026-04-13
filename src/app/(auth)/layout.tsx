import React, {ReactElement} from 'react';
import AuthLayout from '@/@oimmei/core/AppLayout/AuthLayout';
import AuthGuard from './guard';

/**
 * Base layout for every auth page (sign in, forgot password, etc.).
 */
export default function (
  {children}: { children: React.ReactNode },
): ReactElement {
  return (
    <AuthGuard>
      <AuthLayout>
        {children}
      </AuthLayout>
    </AuthGuard>
  );
}
