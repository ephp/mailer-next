'use client';

import React, {ReactElement} from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';
import {useTranslations} from 'next-intl';
import {MAIL_LIST_CRUD_NEW} from '@/shared/constants/AppRoutes';

const CreateMailListButton = (): ReactElement => {
  const t = useTranslations('maillist');
  return (
    <Button component={Link} variant="contained" href={MAIL_LIST_CRUD_NEW}>
      {t('btn.create')}
    </Button>
  );
};

export default CreateMailListButton;
