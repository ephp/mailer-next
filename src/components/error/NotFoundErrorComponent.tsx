import React, {ReactElement} from 'react';
import {useTranslations} from 'next-intl';
import ErrorWrapper from '@/components/error/ErrorWrapper';
import Link from 'next/link';
import {initialUrl} from '@/shared/constants/AppConst';
import Button from '@mui/material/Button';
import Icon404 from '@/assets/icon/Icon404';

/**
 * Full error page for a not found error.
 */
export default (): ReactElement | null => {
  const t = useTranslations();

  return (
    <ErrorWrapper
      title={t('error.404.title')}
      description={t('error.404.description')}
      logo={
        <Icon404/>
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
