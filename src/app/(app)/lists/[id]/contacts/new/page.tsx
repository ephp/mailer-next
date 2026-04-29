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
    title: `${t('contact.page.new.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function ContactNewPage(): ReactElement {
  const t = useTranslations();

  return (
    <AppsSimpleContainer
      title={[
        {label: t('maillist.page.index.title'), path: MAIL_LIST_CRUD_LIST},
        t('contact.page.new.title'),
      ]}
      hasMaxWidth
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
