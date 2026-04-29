import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import {CAMPAIGN_CRUD_LIST} from '@/shared/constants/AppRoutes';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('campaign.page.new.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function CampaignNewPage(): ReactElement {
  const t = useTranslations('campaign');

  return (
    <AppsSimpleContainer
      title={[
        {label: t('page.index.title'), path: CAMPAIGN_CRUD_LIST},
        t('page.new.title'),
      ]}
      hasMaxWidth
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
