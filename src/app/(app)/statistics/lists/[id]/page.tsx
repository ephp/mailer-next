import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {STATISTICS} from '@/shared/constants/AppRoutes';
import LinkButton from '@/components/common/LinkButton';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t('statistics.page.list.title')} | ${t('messages.common.base_title')}`,
  };
}

export default async function StatisticsListPage({params}: {params: Promise<{id: string}>}): Promise<ReactElement> {
  const t = await getTranslations('statistics');
  const {id} = await params;

  return (
    <AppsSimpleContainer
      title={t('page.list.title')}
      actionWrapper={
        <LinkButton href={STATISTICS} startIcon={<ArrowBackIcon/>}>
          {t('btn.back_to_stats')}
        </LinkButton>
      }
    >
      <Content listId={Number(id)}/>
    </AppsSimpleContainer>
  );
}
