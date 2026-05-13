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
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import UnsubscribeIcon from '@mui/icons-material/Unsubscribe';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
  getCampaignRecipients,
  getCampaignRecipientsCsv,
} from '@/shared/helpers/api/statisticsApiHelper';
import {getCampaign} from '@/shared/helpers/api/campaignApiHelper';
import {CampaignStats, TimelinePoint, LinkStats, CampaignRecipient} from '@/types/models/Statistics';
import {Campaign} from '@/types/models/Campaign';

interface RecipientsResult {
  items: CampaignRecipient[];
  currentPage: number;
  itemCount: number;
  itemsPerPage: number;
}

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

type RecipientStatusFilter = 'sent' | 'opened' | 'clicked' | 'unsubscribed';

const statusChipColor = (
  status: string,
): 'default' | 'primary' | 'success' | 'secondary' | 'error' => {
  switch (status) {
    case 'sent': return 'primary';
    case 'opened': return 'success';
    case 'clicked': return 'secondary';
    case 'failed':
    case 'bounced': return 'error';
    default: return 'default';
  }
};

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

  const [recipientStatus, setRecipientStatus] = useState<RecipientStatusFilter | undefined>(undefined);
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipients, setRecipients] = useState<RecipientsResult | null>(null);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [exportingCsv, setExportingCsv] = useState(false);

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

  useEffect(() => {
    setLoadingRecipients(true);
    getCampaignRecipients({id: campaignId, page: recipientPage, perPage: 50, status: recipientStatus})
      .then(result => setRecipients(result as unknown as RecipientsResult))
      .catch(console.error)
      .finally(() => setLoadingRecipients(false));
  }, [campaignId, recipientPage, recipientStatus]);

  const handleExportCsv = (): void => {
    setExportingCsv(true);
    getCampaignRecipientsCsv(campaignId, recipientStatus)
      .catch(console.error)
      .finally(() => setExportingCsv(false));
  };

  const fmt = (n: number | null | undefined): string =>
    n == null ? '—' : n.toLocaleString('it-IT');
  const fmtPct = (n: number | null | undefined): string =>
    n == null ? '—' : `${n.toFixed(2)}%`;
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

      {/* Recipients */}
      <SectionTitle>{t('stats.recipients')}</SectionTitle>
      <Box sx={{mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between'}}>
        <ToggleButtonGroup
          value={recipientStatus ?? ''}
          exclusive
          size="small"
          onChange={(_, v: string | null) => {
            const next = v && v !== '' ? v as RecipientStatusFilter : undefined;
            setRecipientStatus(next);
            setRecipientPage(1);
          }}
        >
          <ToggleButton value="">{t('stats.recipients_filter_all')}</ToggleButton>
          <ToggleButton value="sent">{t('stats.recipients_filter_sent')}</ToggleButton>
          <ToggleButton value="opened">{t('stats.recipients_filter_opened')}</ToggleButton>
          <ToggleButton value="clicked">{t('stats.recipients_filter_clicked')}</ToggleButton>
          <ToggleButton value="unsubscribed">{t('stats.recipients_filter_unsubscribed')}</ToggleButton>
        </ToggleButtonGroup>
        <Button
          variant="outlined"
          size="small"
          startIcon={exportingCsv ? <CircularProgress size={14}/> : <FileDownloadIcon/>}
          onClick={handleExportCsv}
          disabled={exportingCsv}
        >
          {t('stats.recipients_export_csv')}
        </Button>
      </Box>
      {loadingRecipients ? (
        <Skeleton variant="rectangular" height={260} sx={{borderRadius: 1}}/>
      ) : !recipients || recipients.items.length === 0 ? (
        <Typography color="text.secondary" sx={{py: 2}}>
          {t('stats.recipients_no_data')}
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('stats.recipients_col_email')}</TableCell>
                <TableCell>{t('stats.recipients_col_name')}</TableCell>
                <TableCell>{t('stats.recipients_col_list')}</TableCell>
                <TableCell>{t('stats.recipients_col_status')}</TableCell>
                <TableCell>{t('stats.recipients_col_opened')}</TableCell>
                <TableCell align="right">{t('stats.recipients_col_open_count')}</TableCell>
                <TableCell>{t('stats.recipients_col_clicked')}</TableCell>
                <TableCell align="right">{t('stats.recipients_col_click_count')}</TableCell>
                <TableCell>{t('stats.recipients_col_unsubscribed')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recipients.items.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{maxWidth: 200}}>
                    <Typography variant="body2" noWrap>{r.email}</Typography>
                  </TableCell>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>
                    {[r.contact_cognome, r.contact_nome].filter(Boolean).join(' ') || '—'}
                  </TableCell>
                  <TableCell sx={{maxWidth: 140}}>
                    <Typography variant="body2" noWrap>{r.mail_list_name ?? '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={r.status} color={statusChipColor(r.status)} size="small"/>
                  </TableCell>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>
                    {r.opened ? fmtDate(r.opened_at) : <CancelIcon fontSize="small" color="disabled"/>}
                  </TableCell>
                  <TableCell align="right">{r.open_count}</TableCell>
                  <TableCell>
                    {r.clicked
                      ? <CheckCircleIcon fontSize="small" color="success"/>
                      : <CancelIcon fontSize="small" color="disabled"/>}
                  </TableCell>
                  <TableCell align="right">{r.click_count}</TableCell>
                  <TableCell>
                    {r.unsubscribed
                      ? <CheckCircleIcon fontSize="small" color="error"/>
                      : <CancelIcon fontSize="small" color="disabled"/>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={recipients.itemCount}
            page={recipients.currentPage - 1}
            rowsPerPage={recipients.itemsPerPage}
            rowsPerPageOptions={[50]}
            onPageChange={(_, p) => setRecipientPage(p + 1)}
          />
        </TableContainer>
      )}
    </Box>
  );
};

export default CampaignStatsContent;
