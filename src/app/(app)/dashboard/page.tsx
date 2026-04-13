import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';

/**
 * Metadata configuration in Next.js 15.
 *
 * @link https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('messages');

  return {
    title: `${t('sidebar.dashboard')} | ${t('common.base_title')}`,
  };
}

export default function Dashboard(): ReactElement {
  return (
    <></>
  );
}
