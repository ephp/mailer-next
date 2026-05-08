'use client';

import React, {ReactElement, useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import {useTranslations} from 'next-intl';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getCampaignStats,
  getCampaignTimeline,
  getCampaignLinks,
} from '@/shared/helpers/api/statisticsApiHelper';
import {getCampaign} from '@/shared/helpers/api/campaignApiHelper';
import {CampaignStats, TimelinePoint, LinkStats} from '@/types/models/Statistics';
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

const SectionTitle = ({children}: {children: React.ReactNode}): ReactElement => (
  <Box sx={{mb: 2, mt: 1}}>
    <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
      {children}
    </Typography>
    <Divider/>
  </Box>
);

interface Props {
  campaignId: number;
}

const CampaignStatsContent = ({campaignId}: Props): ReactElement => {
  const t = useTranslations('campaign');

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [links, setLinks] = useState<LinkStats[] | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[] | null>(null);
  const [metric, setMetric] = useState<'opens' | 'clicks'>('opens');
  const [cumulative, setCumulative] = useState(false);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);

  useEffect(() => {
    setLoadingMain(true);
    Promise.all([
      getCampaign(campaignId),
      getCampaignStats(campaignId),
      getCampaignLinks(campaignId),
    ])
      .then(([campaignResult, statsResult, linksResult]) => {
        setCampaign(campaignResult.item ?? null);
        setStats(statsResult.item ?? null);
        setLinks(linksResult);
      })
      .catch(console.error)
      .finally(() => setLoadingMain(false));
  }, [campaignId]);

  useEffect(() => {
    setLoadingTimeline(true);
    getCampaignTimeline(campaignId, metric, 72, cumulative)
      .then(setTimeline)
      .catch(console.error)
      .finally(() => setLoadingTimeline(false));
  }, [campaignId, metric, cumulative]);

  const fmt = (n: number): string => n.toLocaleString('it-IT');
  const fmtPct = (n: number): string => `${n.toFixed(2)}%`;
  const fmtDate = (s: string | null): string => {
    if (!s) return '—';
    return new Date(s).toLocaleString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const fmtHour = (ts: string): string => {
    const d = new Date(ts);
    return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:00`;
  };

  const chartData = (timeline ?? []).map(p => ({
    hour: fmtHour(p.timestamp),
    value: p.value,
  }));

  const lineColor = metric === 'opens' ? '#1565c0' : '#6a1b9a';

  return (
    <Box>
      {/* Campaign header */}
      {loadingMain ? (
        <Box sx={{mb: 3}}>
          <Skeleton variant="text" width={320} height={36}/>
          <Skeleton variant="text" width={200} height={24}/>
        </Box>
      ) : (
        <Box sx={{mb: 3}}>
          <Typography variant="h5" fontWeight={700}>
            {campaign?.name ?? campaign?.email_subject ?? `#${campaignId}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('stats.sent_at')}: {fmtDate(campaign?.sent_at ?? null)}
          </Typography>
        </Box>
      )}

      {/* KPI Cards */}
      <SectionTitle>{t('stats.kpi')}</SectionTitle>
      {loadingMain ? (
        <Grid container spacing={2} sx={{mb: 3}}>
          {Array.from({length: 4}).map((_, i) => (
            <Grid size={{xs: 12, sm: 6, md: 3}} key={i}>
              <Skeleton variant="rectangular" height={110} sx={{borderRadius: 1}}/>
            </Grid>
          ))}
        </Grid>
      ) : stats !== null && (
        <Grid container spacing={2} sx={{mb: 3}}>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('stats.kpi_sent')}
              value={fmt(stats.sent)}
              icon={<DoneAllIcon fontSize="small"/>}
              color="#2e7d32"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('stats.kpi_open_rate')}
              value={fmtPct(stats.open_rate)}
              icon={<VisibilityIcon fontSize="small"/>}
              color="#1565c0"
              subtitle={`${t('stats.unique_opens')}: ${fmt(stats.unique_opens)}`}
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('stats.kpi_click_rate')}
              value={fmtPct(stats.click_rate)}
              icon={<TouchAppIcon fontSize="small"/>}
              color="#6a1b9a"
              subtitle={`${t('stats.unique_clicks')}: ${fmt(stats.unique_clicks)}`}
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('stats.kpi_unsubscribes')}
              value={fmt(stats.unsubscribes)}
              icon={<UnsubscribeIcon fontSize="small"/>}
              color="#b71c1c"
              subtitle={`${t('stats.unsubscribe_rate')}: ${fmtPct(stats.unsubscribe_rate)}`}
            />
          </Grid>
        </Grid>
      )}

      {/* Timeline */}
      <SectionTitle>{t('stats.timeline')}</SectionTitle>
      <Box sx={{mb: 1, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center'}}>
        <ToggleButtonGroup
          value={metric}
          exclusive
          size="small"
          onChange={(_, v: 'opens' | 'clicks' | null) => {
            if (v) setMetric(v);
          }}
        >
          <ToggleButton value="opens">{t('stats.metric_opens')}</ToggleButton>
          <ToggleButton value="clicks">{t('stats.metric_clicks')}</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={cumulative ? 'cumulative' : 'incremental'}
          exclusive
          size="small"
          onChange={(_, v: 'incremental' | 'cumulative' | null) => {
            if (v) setCumulative(v === 'cumulative');
          }}
        >
          <ToggleButton value="incremental">{t('stats.incremental')}</ToggleButton>
          <ToggleButton value="cumulative">{t('stats.cumulative')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{mb: 3}}>
        {loadingTimeline ? (
          <Skeleton variant="rectangular" height={280} sx={{borderRadius: 1}}/>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{top: 5, right: 20, left: 0, bottom: 5}}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="hour" tick={{fontSize: 11}} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize: 11}}/>
              <RechartsTooltip/>
              <Legend/>
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                dot={false}
                name={metric === 'opens' ? t('stats.metric_opens') : t('stats.metric_clicks')}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* Links table */}
      <SectionTitle>{t('stats.links')}</SectionTitle>
      {loadingMain ? (
        <Skeleton variant="rectangular" height={160} sx={{borderRadius: 1}}/>
      ) : !links || links.length === 0 ? (
        <Typography color="text.secondary" sx={{py: 2}}>
          {t('stats.no_links')}
        </Typography>
      ) : (
        <Box sx={{overflowX: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('stats.col_url')}</TableCell>
                <TableCell align="right">{t('stats.col_unique_clicks')}</TableCell>
                <TableCell align="right">{t('stats.col_total_clicks')}</TableCell>
                <TableCell align="right">{t('stats.col_click_rate')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {links.map((link, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{maxWidth: 340}}>
                    <Tooltip title={link.original_url} placement="top">
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 320,
                          display: 'block',
                        }}
                      >
                        {link.original_url}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{fmt(link.unique_clicks)}</TableCell>
                  <TableCell align="right">{fmt(link.total_clicks)}</TableCell>
                  <TableCell align="right">{fmtPct(link.click_rate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default CampaignStatsContent;
