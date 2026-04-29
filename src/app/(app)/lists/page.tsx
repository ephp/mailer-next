import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {MAIL_LIST_CRUD_NEW} from '@/shared/constants/AppRoutes';
import Button from '@mui/material/Button';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('maillist.page.index.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function MailListIndexPage(): ReactElement {
  const t = useTranslations('maillist');

  return (
    <AppsSimpleContainer
      title={t('page.index.title')}
      actionWrapper={
        <Button component={Link} variant="contained" href={MAIL_LIST_CRUD_NEW}>
          {t('btn.create')}
        </Button>
      }
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
