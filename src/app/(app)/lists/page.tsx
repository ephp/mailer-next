import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import CreateMailListButton from '@/components/maillist/CreateMailListButton';
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
      actionWrapper={<CreateMailListButton/>}
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
