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
    title: `${t('campaign.wizard.step2.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function WizardStep2Page(): ReactElement {
  const t = useTranslations('campaign');

  return (
    <AppsSimpleContainer
      title={[
        {label: t('page.index.title'), path: CAMPAIGN_CRUD_LIST},
        t('wizard.step2.title'),
      ]}
      hasMaxWidth
    >
      <Content />
    </AppsSimpleContainer>
  );
}
