import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {CAMPAIGN_CRUD_LIST} from '@/shared/constants/AppRoutes';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('campaign.template.page.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function CampaignTemplatesPage(): ReactElement {
  const t = useTranslations('campaign');

  return (
    <AppsSimpleContainer
      title={t('template.page.title')}
      actionWrapper={
        <Button
          component={Link}
          variant="outlined"
          href={CAMPAIGN_CRUD_LIST}
          startIcon={<ArrowBackIcon/>}
        >
          {t('btn.back_to_list')}
        </Button>
      }
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
