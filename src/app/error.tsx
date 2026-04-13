'use client'; // Error boundaries must be Client Components

import React, {ReactElement} from 'react';
import {useTranslations} from 'next-intl';
import UnknownErrorComponent from '@/components/error/UnknownErrorComponent';

/**
 * Base error page for all situations, managed as a symlink.
 *
 * @link https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default (): ReactElement | null => {
  const t = useTranslations();

  return (
    <>
      {/*
        Necessary as we're in a client component.

        https://github.com/vercel/next.js/issues/45620#issuecomment-1488933853
       */}
      <title>{`${t('error.500.title')} | ${
        t('messages.common.base_title')}`}</title>

      <UnknownErrorComponent/>
    </>
  );
};
