import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {CAMPAIGN_CRUD_NEW, CAMPAIGN_TEMPLATES} from '@/shared/constants/AppRoutes';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ArticleIcon from '@mui/icons-material/Article';
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
        <Box sx={{display: 'flex', gap: 1}}>
          <Button
            component={Link}
            variant="outlined"
            href={CAMPAIGN_TEMPLATES}
            startIcon={<ArticleIcon/>}
          >
            {t('template.btn.library')}
          </Button>
          <Button component={Link} variant="contained" href={CAMPAIGN_CRUD_NEW}>
            {t('btn.create')}
          </Button>
        </Box>
      }
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
