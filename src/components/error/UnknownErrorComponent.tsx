'use client';

import React, {ReactElement} from 'react';
import {useTranslations} from 'next-intl';
import ErrorWrapper from '@/components/error/ErrorWrapper';
import Link from 'next/link';
import {initialUrl} from '@/shared/constants/AppConst';
import Button from '@mui/material/Button';
import Icon500 from '@/assets/icon/Icon500';

/**
 * Full error page for an unknown/500 error.
 */
export default (): ReactElement | null => {
  const t = useTranslations();

  return (
    <ErrorWrapper
      title={t('error.500.title')}
      description={t('error.500.description')}
      logo={
        <Icon500/>
      }
    >
      <Button
        component={Link}
        variant="contained"
        color="primary"
        href={initialUrl}
        sx={{
          fontSize: 16,
          textTransform: 'none',
        }}
      >
        {t('messages.btn.go_back_home')}
      </Button>
    </ErrorWrapper>
  );
}
