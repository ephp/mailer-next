import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import SigninContent from './content';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Box from '@mui/material/Box';

/**
 * Metadata configuration in Next.js 15.
 *
 * @link https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('security.page.login.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function Signin(): ReactElement {
  return (
    <AuthWrapper>
      <Box sx={{width: '100%'}}>
        <SigninContent/>
      </Box>
    </AuthWrapper>
  );
};
