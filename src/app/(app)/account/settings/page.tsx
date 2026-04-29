import React, {ReactElement} from 'react';
import {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('account.page.settings.title')} | ${t('messages.common.base_title')}`,
  };
}

export default async function AccountSettingsPage(): Promise<ReactElement> {
  const t = await getTranslations();

  return (
    <AppsSimpleContainer
      title={t('account.page.settings.title')}
      hasMaxWidth
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
