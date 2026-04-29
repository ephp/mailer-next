import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import {MAIL_LIST_CRUD_LIST} from '@/shared/constants/AppRoutes';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('maillist.page.edit.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function MailListEditPage(): ReactElement {
  const t = useTranslations('maillist');

  return (
    <AppsSimpleContainer
      title={[
        {label: t('page.index.title'), path: MAIL_LIST_CRUD_LIST},
        t('page.edit.title'),
      ]}
      hasMaxWidth
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
