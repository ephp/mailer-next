import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {CAMPAIGN_CRUD_LIST} from '@/shared/constants/AppRoutes';
import LinkButton from '@/components/common/LinkButton';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t('campaign.page.stats.title')} | ${t('messages.common.base_title')}`,
  };
}

export default async function CampaignStatsPage({params}: {params: Promise<{id: string}>}): Promise<ReactElement> {
  const t = await getTranslations('campaign');
  const {id} = await params;

  return (
    <AppsSimpleContainer
      title={t('page.stats.title')}
      actionWrapper={
        <LinkButton href={CAMPAIGN_CRUD_LIST} startIcon={<ArrowBackIcon/>}>
          {t('btn.back_to_list')}
        </LinkButton>
      }
    >
      <Content campaignId={Number(id)}/>
    </AppsSimpleContainer>
  );
}
