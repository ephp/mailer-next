import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {CAMPAIGN_CRUD_NEW} from '@/shared/constants/AppRoutes';
import Button from '@mui/material/Button';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('campaign.page.index.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function CampaignIndexPage(): ReactElement {
  const t = useTranslations('campaign');

  return (
    <AppsSimpleContainer
      title={t('page.index.title')}
      actionWrapper={
        <Button component={Link} variant="contained" href={CAMPAIGN_CRUD_NEW}>
          {t('btn.create')}
        </Button>
      }
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
