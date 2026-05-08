'use client';

import React, {ReactElement, useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Link from 'next/link';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {useTranslations} from 'next-intl';
import {
  getMailListStats,
  getCampaignStats as getDetailedCampaignStats,
} from '@/shared/helpers/api/statisticsApiHelper';
import {getCampaigns} from '@/shared/helpers/api/campaignApiHelper';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {MailListStats, CampaignStats as StatsCampaignStats} from '@/types/models/Statistics';
import {Campaign} from '@/types/models/Campaign';

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
  <Box sx={{mb: 2, mt: 3}}>
    <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
      {children}
    </Typography>
    <Divider/>
  </Box>
);

const fmt = (n: number): string => n.toLocaleString('it-IT');
const fmtPct = (n: number): string => `${n.toFixed(1)}%`;

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

interface Props {
  listId: number;
}

const MailListStatsContent = ({listId}: Props): ReactElement => {
  const t = useTranslations('statistics');

  const {result, loading, perform} = useAsyncLoader(getMailListStats, false);

  const [listCampaigns, setListCampaigns] = useState<Campaign[]>([]);
  const [campaignStatsMap, setCampaignStatsMap] = useState<Record<number, StatsCampaignStats>>({});
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  useEffect(() => {
    perform({id: listId}).catch(console.error);

    getCampaigns({page: 1, perPage: 50, filter: {sort: 'sentAt', direction: 'desc', template: false}})
      .then(async (res) => {
        const allCampaigns = res.items ?? [];
        const filtered = allCampaigns.filter(c => c.mail_list_ids.includes(listId));
        setListCampaigns(filtered);
        if (filtered.length > 0) {
          const results = await Promise.all(
            filtered.map(c => getDetailedCampaignStats(c.id).catch(() => null)),
          );
          const map: Record<number, StatsCampaignStats> = {};
          filtered.forEach((c, i) => {
            const s = results[i];
            if (s?.item) map[c.id] = s.item;
          });
          setCampaignStatsMap(map);
        }
      })
      .catch(console.error)
      .finally(() => setCampaignsLoading(false));
  }, [listId, perform]);

  const stats: MailListStats | null = result?.item ?? null;

  return (
    <Box>
      {/* ── KPI principali ── */}
      <SectionTitle>{t('section.kpi')}</SectionTitle>
      {loading || stats === null ? (
        <Grid container spacing={2} sx={{mb: 3}}>
          {Array.from({length: 4}).map((_, i) => (
            <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
              <Skeleton variant="rectangular" height={110} sx={{borderRadius: 1}}/>
            </Grid>
          ))}
        </Grid>
      ) : (
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
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.total_unsubscribes')}
              value={fmt(stats.total_unsubscribes)}
              icon={<UnsubscribeIcon fontSize="small"/>}
              color="#b71c1c"
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
      )}

      {/* ── Crescita iscritti (placeholder) ── */}
      <SectionTitle>{t('section.subscriber_growth')}</SectionTitle>
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1,
          minHeight: 160,
        }}
      >
        <ShowChartIcon sx={{fontSize: 48, color: 'text.disabled'}}/>
        <Typography color="text.secondary" variant="body2">
          {t('chart.coming_soon')}
        </Typography>
      </Card>

      {/* ── Campagne sulla lista ── */}
      <SectionTitle>{t('section.list_campaigns')}</SectionTitle>
      {campaignsLoading ? (
        <Skeleton variant="rectangular" height={200} sx={{borderRadius: 1}}/>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight: 600}}>{t('table.campaign_name')}</TableCell>
                <TableCell sx={{fontWeight: 600}}>{t('table.sent_at')}</TableCell>
                <TableCell sx={{fontWeight: 600}} align="right">{t('table.open_rate')}</TableCell>
                <TableCell sx={{fontWeight: 600}} align="right">{t('table.click_rate')}</TableCell>
                <TableCell sx={{fontWeight: 600}} align="right">{t('table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{color: 'text.secondary', py: 3}}>
                    {t('table.no_list_campaigns')}
                  </TableCell>
                </TableRow>
              ) : (
                listCampaigns.map((campaign) => {
                  const cs = campaignStatsMap[campaign.id];
                  return (
                    <TableRow key={campaign.id} hover>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{maxWidth: 260}}>
                          {campaign.name ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(campaign.sent_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {cs ? fmtPct(cs.open_rate) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {cs ? fmtPct(cs.click_rate) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Link
                          href={`/campaigns/${campaign.id}/stats`}
                          style={{fontSize: 13, color: '#1565c0', textDecoration: 'none'}}
                        >
                          {t('btn.view_stats')}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MailListStatsContent;
