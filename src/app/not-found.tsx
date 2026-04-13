import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import NotFoundErrorComponent from '@/components/error/NotFoundErrorComponent';
import {Metadata} from 'next';

/**
 * Metadata configuration in Next.js 15.
 *
 * @link https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('error.404.title')} | ${t('messages.common.base_title')}`,
  };
}

/**
 * @link https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default (): ReactElement | null => {
  return (
    <NotFoundErrorComponent/>
  );
};
