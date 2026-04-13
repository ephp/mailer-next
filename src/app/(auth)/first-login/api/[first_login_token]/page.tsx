import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import FirstLoginContent from './content';
import AuthWrapper from '@/components/auth/AuthWrapper';

/**
 * Metadata configuration in Next.js 15.
 *
 * @link https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('security.page.first_login.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function FirstLogin(): ReactElement {
  return (
    <AuthWrapper>
      <FirstLoginContent/>
    </AuthWrapper>
  );
}
