import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import {CAMPAIGN_TEMPLATES} from '@/shared/constants/AppRoutes';
import Box from '@mui/material/Box';
import ArticleIcon from '@mui/icons-material/Article';
import LinkButton from '@/components/common/LinkButton';
import NewCampaignButton from './NewCampaignButton';
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
          <LinkButton
            variant="outlined"
            href={CAMPAIGN_TEMPLATES}
            startIcon={<ArticleIcon/>}
          >
            {t('template.btn.library')}
          </LinkButton>
          <NewCampaignButton/>
        </Box>
      }
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
