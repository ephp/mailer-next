'use client';

import React, {ReactElement, useEffect} from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EmailIcon from '@mui/icons-material/Email';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import {useTranslations} from 'next-intl';
import {getMailListStats} from '@/shared/helpers/api/statisticsApiHelper';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {MailListStats} from '@/types/models/Statistics';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactElement;
  color?: string;
  subtitle?: string;
}

const StatCard = ({label, value, icon, color = '#556cd6', subtitle}: StatCardProps): ReactElement => (
  <Card variant="outlined" sx={{height: '100%'}}>
    <CardContent>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 1}}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: `${color}22`,
            color,
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={700} sx={{color}}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitle = ({children}: SectionTitleProps): ReactElement => (
  <Box sx={{mb: 2, mt: 1}}>
    <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
      {children}
    </Typography>
    <Divider/>
  </Box>
);

interface Props {
  listId: number;
}

const MailListStatsContent = ({listId}: Props): ReactElement => {
  const t = useTranslations('statistics');

  const {result, loading, perform} = useAsyncLoader(getMailListStats, false);

  useEffect(() => {
    perform({id: listId}).catch(console.error);
  }, [listId, perform]);

  const stats: MailListStats | null = result?.item ?? null;

  if (loading || stats === null) {
    return (
      <Grid container spacing={2}>
        {Array.from({length: 9}).map((_, i) => (
          <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
            <Skeleton variant="rectangular" height={110} sx={{borderRadius: 1}}/>
          </Grid>
        ))}
      </Grid>
    );
  }

  const fmt = (n: number): string => n.toLocaleString('it-IT');
  const fmtPct = (n: number): string => `${n.toFixed(1)}%`;

  return (
    <Box>
      <SectionTitle>{t('section.contacts')}</SectionTitle>
      <Grid container spacing={2} sx={{mb: 3}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            label={t('field.total_contacts')}
            value={fmt(stats.total_contacts)}
            icon={<PeopleIcon fontSize="small"/>}
            color="#00695c"
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            label={t('field.total_subscribed')}
            value={fmt(stats.total_subscribed)}
            icon={<PersonIcon fontSize="small"/>}
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      <SectionTitle>{t('section.delivery')}</SectionTitle>
      <Grid container spacing={2} sx={{mb: 3}}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            label={t('field.total_sent')}
            value={fmt(stats.total_sent)}
            icon={<DoneAllIcon fontSize="small"/>}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            label={t('field.total_pending')}
            value={fmt(stats.total_pending)}
            icon={<EmailIcon fontSize="small"/>}
            color="#ed6c02"
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            label={t('field.total_failed')}
            value={fmt(stats.total_failed)}
            icon={<ErrorOutlineIcon fontSize="small"/>}
            color="#d32f2f"
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatCard
            label={t('field.total_bounced')}
            value={fmt(stats.total_bounced)}
            icon={<ErrorOutlineIcon fontSize="small"/>}
            color="#c62828"
          />
        </Grid>
      </Grid>

      <SectionTitle>{t('section.engagement')}</SectionTitle>
      <Grid container spacing={2}>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            label={t('field.total_opens')}
            value={fmt(stats.total_opens)}
            icon={<VisibilityIcon fontSize="small"/>}
            color="#1565c0"
            subtitle={`${t('field.open_rate')}: ${fmtPct(stats.open_rate)}`}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            label={t('field.total_clicks')}
            value={fmt(stats.total_clicks)}
            icon={<TouchAppIcon fontSize="small"/>}
            color="#6a1b9a"
            subtitle={`${t('field.click_rate')}: ${fmtPct(stats.click_rate)}`}
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 4}}>
          <StatCard
            label={t('field.total_unsubscribes')}
            value={fmt(stats.total_unsubscribes)}
            icon={<UnsubscribeIcon fontSize="small"/>}
            color="#b71c1c"
            subtitle={`${t('field.unsubscribe_rate')}: ${fmtPct(stats.unsubscribe_rate)}`}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MailListStatsContent;
