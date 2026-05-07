import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t('statistics.page.index.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function StatisticsPage(): ReactElement {
  const t = useTranslations('statistics');

  return (
    <AppsSimpleContainer title={t('page.index.title')}>
      <Content/>
    </AppsSimpleContainer>
  );
}
