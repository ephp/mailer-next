'use client';

import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Link from 'next/link';
import CampaignIcon from '@mui/icons-material/Campaign';
import ListIcon from '@mui/icons-material/List';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EmailIcon from '@mui/icons-material/Email';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {useTranslations} from 'next-intl';
import {
  getAccountStats,
  getAccountMonthly,
  getCampaignStats as getDetailedCampaignStats,
  getMailListStats,
} from '@/shared/helpers/api/statisticsApiHelper';
import {getCampaigns} from '@/shared/helpers/api/campaignApiHelper';
import {getMailLists} from '@/shared/helpers/api/mailListApiHelper';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {
  AccountStats,
  AccountMonthlyPoint,
  CampaignStats as StatsCampaignStats,
  MailListStats,
} from '@/types/models/Statistics';
import {Campaign} from '@/types/models/Campaign';
import {MailList} from '@/types/models/MailList';

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
const fmtPct = (n: number, decimals = 1): string => `${n.toFixed(decimals)}%`;

const formatMonth = (yyyyMM: string): string => {
  const [year, month] = yyyyMM.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('it-IT', {
    month: 'short',
    year: '2-digit',
  });
};

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

const AccountStatsContent = (): ReactElement => {
  const t = useTranslations('statistics');

  const {result: statsResult, loading: statsLoading, perform: performStats} = useAsyncLoader(getAccountStats, false);
  const getMonthlyWrapper = useCallback(() => getAccountMonthly(12), []);
  const {result: monthlyResult, loading: monthlyLoading, perform: performMonthly} = useAsyncLoader(getMonthlyWrapper, false);

  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [campaignStatsMap, setCampaignStatsMap] = useState<Record<number, StatsCampaignStats>>({});
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  const [mailLists, setMailLists] = useState<MailList[]>([]);
  const [listStatsMap, setListStatsMap] = useState<Record<number, MailListStats>>({});
  const [listsLoading, setListsLoading] = useState(true);

  useEffect(() => {
    performStats().catch(console.error);
    performMonthly().catch(console.error);

    getCampaigns({page: 1, perPage: 10, filter: {sort: 'sentAt', direction: 'desc', template: false}})
      .then(async (res) => {
        const campaigns = res.items ?? [];
        setRecentCampaigns(campaigns);
        if (campaigns.length > 0) {
          const results = await Promise.all(
            campaigns.map(c => getDetailedCampaignStats(c.id).catch(() => null)),
          );
          const map: Record<number, StatsCampaignStats> = {};
          campaigns.forEach((c, i) => {
            const s = results[i];
            if (s?.item) map[c.id] = s.item;
          });
          setCampaignStatsMap(map);
        }
      })
      .catch(console.error)
      .finally(() => setCampaignsLoading(false));

    getMailLists({page: 1, perPage: 10, sortBy: 'name' as keyof MailList, sortDirection: 'asc'})
      .then(async (res) => {
        const lists = res.items ?? [];
        setMailLists(lists);
        if (lists.length > 0) {
          const results = await Promise.all(
            lists.map(l => getMailListStats({id: l.id}).catch(() => null)),
          );
          const map: Record<number, MailListStats> = {};
          lists.forEach((l, i) => {
            const s = results[i];
            if (s?.item) map[l.id] = s.item;
          });
          setListStatsMap(map);
        }
      })
      .catch(console.error)
      .finally(() => setListsLoading(false));
  }, [performStats, performMonthly]);

  const stats: AccountStats | null = statsResult?.item ?? null;
  const monthlyData: AccountMonthlyPoint[] = monthlyResult ?? [];
  const isStatsLoading = statsLoading || stats === null;

  const bounceRate = stats && stats.total_sent > 0
    ? (stats.total_bounced / stats.total_sent * 100)
    : 0;

  const emailsSentLabel = t('chart.emails_sent');
  const uniqueOpensLabel = t('chart.unique_opens');
  const uniqueClicksLabel = t('chart.unique_clicks');

  const chartData = monthlyData.map(p => ({
    month: formatMonth(p.month),
    [emailsSentLabel]: p.emails_sent,
    [uniqueOpensLabel]: p.unique_opens,
    [uniqueClicksLabel]: p.unique_clicks,
  }));

  return (
    <Box>
      {/* ── KPI principali ── */}
      <SectionTitle>{t('section.kpi')}</SectionTitle>
      {isStatsLoading ? (
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
              label={t('field.emails_sent')}
              value={fmt(stats!.total_sent)}
              icon={<EmailIcon fontSize="small"/>}
              color="#1565c0"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.avg_open_rate')}
              value={fmtPct(stats!.open_rate, 1)}
              icon={<VisibilityIcon fontSize="small"/>}
              color="#2e7d32"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.avg_click_rate')}
              value={fmtPct(stats!.click_rate, 1)}
              icon={<TouchAppIcon fontSize="small"/>}
              color="#6a1b9a"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.bounce_rate')}
              value={fmtPct(bounceRate, 3)}
              icon={<ErrorOutlineIcon fontSize="small"/>}
              color="#c62828"
            />
          </Grid>
        </Grid>
      )}

      {/* ── Panoramica ── */}
      <SectionTitle>{t('section.overview')}</SectionTitle>
      {isStatsLoading ? (
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
              label={t('field.total_campaigns')}
              value={fmt(stats!.total_campaigns)}
              icon={<CampaignIcon fontSize="small"/>}
              color="#1565c0"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.total_lists')}
              value={fmt(stats!.total_lists)}
              icon={<ListIcon fontSize="small"/>}
              color="#0277bd"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.total_contacts')}
              value={fmt(stats!.total_contacts)}
              icon={<PeopleIcon fontSize="small"/>}
              color="#00695c"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.total_subscribed')}
              value={fmt(stats!.total_subscribed)}
              icon={<PersonIcon fontSize="small"/>}
              color="#2e7d32"
            />
          </Grid>
        </Grid>
      )}

      {/* ── Consegna ── */}
      <SectionTitle>{t('section.delivery')}</SectionTitle>
      {isStatsLoading ? (
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
              label={t('field.total_sent')}
              value={fmt(stats!.total_sent)}
              icon={<DoneAllIcon fontSize="small"/>}
              color="#2e7d32"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.total_pending')}
              value={fmt(stats!.total_pending)}
              icon={<EmailIcon fontSize="small"/>}
              color="#ed6c02"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.total_failed')}
              value={fmt(stats!.total_failed)}
              icon={<ErrorOutlineIcon fontSize="small"/>}
              color="#d32f2f"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <StatCard
              label={t('field.total_bounced')}
              value={fmt(stats!.total_bounced)}
              icon={<ErrorOutlineIcon fontSize="small"/>}
              color="#c62828"
            />
          </Grid>
        </Grid>
      )}

      {/* ── Engagement ── */}
      <SectionTitle>{t('section.engagement')}</SectionTitle>
      {isStatsLoading ? (
        <Grid container spacing={2} sx={{mb: 3}}>
          {Array.from({length: 3}).map((_, i) => (
            <Grid size={{xs: 12, sm: 6, md: 4}} key={i}>
              <Skeleton variant="rectangular" height={110} sx={{borderRadius: 1}}/>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} sx={{mb: 3}}>
          <Grid size={{xs: 12, sm: 6, md: 4}}>
            <StatCard
              label={t('field.total_opens')}
              value={fmt(stats!.total_opens)}
              icon={<VisibilityIcon fontSize="small"/>}
              color="#1565c0"
              subtitle={`${t('field.open_rate')}: ${fmtPct(stats!.open_rate)}`}
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 4}}>
            <StatCard
              label={t('field.total_clicks')}
              value={fmt(stats!.total_clicks)}
              icon={<TouchAppIcon fontSize="small"/>}
              color="#6a1b9a"
              subtitle={`${t('field.click_rate')}: ${fmtPct(stats!.click_rate)}`}
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6, md: 4}}>
            <StatCard
              label={t('field.total_unsubscribes')}
              value={fmt(stats!.total_unsubscribes)}
              icon={<UnsubscribeIcon fontSize="small"/>}
              color="#b71c1c"
              subtitle={`${t('field.unsubscribe_rate')}: ${fmtPct(stats!.unsubscribe_rate)}`}
            />
          </Grid>
        </Grid>
      )}

      {/* ── Andamento mensile ── */}
      <SectionTitle>{t('section.monthly_trend')}</SectionTitle>
      {monthlyLoading ? (
        <Skeleton variant="rectangular" height={300} sx={{borderRadius: 1, mb: 3}}/>
      ) : (
        <Card variant="outlined" sx={{mb: 3, p: 2}}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{top: 8, right: 24, left: 0, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="month" tick={{fontSize: 12}}/>
              <YAxis tick={{fontSize: 12}}/>
              <Tooltip/>
              <Legend/>
              <Line
                type="monotone"
                dataKey={emailsSentLabel}
                stroke="#1565c0"
                strokeWidth={2}
                dot={false}
                activeDot={{r: 4}}
              />
              <Line
                type="monotone"
                dataKey={uniqueOpensLabel}
                stroke="#2e7d32"
                strokeWidth={2}
                dot={false}
                activeDot={{r: 4}}
              />
              <Line
                type="monotone"
                dataKey={uniqueClicksLabel}
                stroke="#6a1b9a"
                strokeWidth={2}
                dot={false}
                activeDot={{r: 4}}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Ultime campagne ── */}
      <SectionTitle>{t('section.recent_campaigns')}</SectionTitle>
      {campaignsLoading ? (
        <Skeleton variant="rectangular" height={220} sx={{borderRadius: 1, mb: 3}}/>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{mb: 3}}>
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
              {recentCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{color: 'text.secondary', py: 3}}>
                    {t('table.no_campaigns')}
                  </TableCell>
                </TableRow>
              ) : (
                recentCampaigns.map((campaign) => {
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

      {/* ── Salute liste ── */}
      <SectionTitle>{t('section.list_health')}</SectionTitle>
      {listsLoading ? (
        <Skeleton variant="rectangular" height={200} sx={{borderRadius: 1}}/>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight: 600}}>{t('table.list_name')}</TableCell>
                <TableCell sx={{fontWeight: 600}} align="right">{t('table.contacts')}</TableCell>
                <TableCell sx={{fontWeight: 600}} align="right">{t('table.bounce_pct')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mailLists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{color: 'text.secondary', py: 3}}>
                    {t('table.no_lists')}
                  </TableCell>
                </TableRow>
              ) : (
                mailLists.map((list) => {
                  const ls = listStatsMap[list.id];
                  const listBounceRate = ls && ls.total_sent > 0
                    ? (ls.total_bounced / ls.total_sent * 100)
                    : 0;
                  const isHighBounce = listBounceRate > 5;
                  return (
                    <TableRow key={list.id} hover>
                      <TableCell>
                        <Typography variant="body2">{list.name}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{fmt(list.contact_count)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        {ls ? (
                          <Chip
                            label={fmtPct(listBounceRate, 2)}
                            size="small"
                            color={isHighBounce ? 'error' : 'default'}
                            variant={isHighBounce ? 'filled' : 'outlined'}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
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

export default AccountStatsContent;
