'use client';

import React, {ReactElement, useCallback, useEffect, useState} from "react";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {useParams, useRouter} from 'next/navigation';
import {MAIL_LIST_CONTACTS} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {findContact} from '@/shared/helpers/api/contactApiHelper';
import ContactForm from '@/components/contact/ContactForm';
import {useTranslations} from 'next-intl';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '@/@oimmei/components/TabPanel';
import {a11yTabProps} from '@/@oimmei/utility/helper/TabHelper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {getContactHistory} from '@/shared/helpers/api/statisticsApiHelper';
import {ContactHistory} from '@/types/models/Statistics';

type ContactTab = 'data' | 'history';

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

const engagementChipColor = (score: number): 'success' | 'warning' | 'info' | 'error' => {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  if (score >= 20) return 'info';
  return 'error';
};

const ContactEditContent = (): ReactElement | null => {
  const t = useTranslations();
  const router = useRouter();
  const {id: idParam, contactId: contactIdParam} = useParams<{id: string; contactId: string}>();
  const listId = parseInt(idParam);
  const contactId = parseInt(contactIdParam);

  const [tab, setTab] = useState<ContactTab>('data');
  const [history, setHistory] = useState<ContactHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const {
    result: contactWrapper,
    perform: fetchContact,
    loading,
  } = useAsyncLoader(findContact, true);

  const onOperationCompleted = useCallback(() => {
    router.push(generatePathStorage(MAIL_LIST_CONTACTS, {id: idParam}));
  }, [router, idParam]);

  useEffect(() => {
    fetchContact({listId, id: contactId}).catch(console.error);
  }, [fetchContact, listId, contactId]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: ContactTab): void => {
    setTab(newValue);
    if (newValue === 'history' && !historyLoaded) {
      setLoadingHistory(true);
      getContactHistory(contactId)
        .then(setHistory)
        .catch(console.error)
        .finally(() => {
          setLoadingHistory(false);
          setHistoryLoaded(true);
        });
    }
  };

  return (
    <Box>
      <Tabs value={tab} onChange={handleTabChange} sx={{mb: 3, borderBottom: 1, borderColor: 'divider'}}>
        <Tab label={t('contact.tab.data')} value="data" {...a11yTabProps('contact-edit', 'data')} />
        <Tab label={t('contact.tab.history')} value="history" {...a11yTabProps('contact-edit', 'history')} />
      </Tabs>

      <TabPanel prefix="contact-edit" index="data" currentTab={tab}>
        <ContactForm
          contact={contactWrapper?.item ?? null}
          listId={listId}
          editing={true}
          loading={loading}
          onOperationCompleted={onOperationCompleted}
        />
      </TabPanel>

      <TabPanel prefix="contact-edit" index="history" currentTab={tab}>
        {loadingHistory ? (
          <Box>
            <Skeleton variant="rectangular" height={80} sx={{mb: 3, borderRadius: 1}} />
            <Skeleton variant="rectangular" height={200} sx={{borderRadius: 1}} />
          </Box>
        ) : history ? (
          <Box>
            {/* KPI Personali */}
            <Typography variant="h6" sx={{mb: 2, fontWeight: 600}}>
              {t('contact.history.section_kpi')}
            </Typography>
            <Grid container spacing={2} sx={{mb: 4}}>
              <Grid size={{xs: 12, sm: 4}}>
                <Box sx={{p: 2, border: 1, borderColor: 'divider', borderRadius: 1, textAlign: 'center'}}>
                  <Typography variant="body2" color="text.secondary">{t('contact.history.kpi_open_rate')}</Typography>
                  <Typography variant="h5" fontWeight={700}>{history.kpi.personal_open_rate.toFixed(2)}%</Typography>
                </Box>
              </Grid>
              <Grid size={{xs: 12, sm: 4}}>
                <Box sx={{p: 2, border: 1, borderColor: 'divider', borderRadius: 1, textAlign: 'center'}}>
                  <Typography variant="body2" color="text.secondary">{t('contact.history.kpi_click_rate')}</Typography>
                  <Typography variant="h5" fontWeight={700}>{history.kpi.personal_click_rate.toFixed(2)}%</Typography>
                </Box>
              </Grid>
              <Grid size={{xs: 12, sm: 4}}>
                <Box sx={{p: 2, border: 1, borderColor: 'divider', borderRadius: 1, textAlign: 'center'}}>
                  <Typography variant="body2" color="text.secondary">{t('contact.history.kpi_engagement')}</Typography>
                  <Chip
                    label={`${history.kpi.engagement_score.toFixed(0)} / 100`}
                    color={engagementChipColor(history.kpi.engagement_score)}
                    sx={{mt: 0.5, fontWeight: 700, fontSize: '1rem', height: 36}}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Campagne Ricevute */}
            <Typography variant="h6" sx={{mb: 2, fontWeight: 600}}>
              {t('contact.history.section_campaigns')}
            </Typography>
            {history.campaigns.length === 0 ? (
              <Typography color="text.secondary">{t('contact.history.no_campaigns')}</Typography>
            ) : (
              <Box sx={{overflowX: 'auto'}}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('contact.history.col_campaign')}</TableCell>
                      <TableCell>{t('contact.history.col_sent_at')}</TableCell>
                      <TableCell align="center">{t('contact.history.col_opened')}</TableCell>
                      <TableCell align="center">{t('contact.history.col_open_count')}</TableCell>
                      <TableCell align="center">{t('contact.history.col_clicked')}</TableCell>
                      <TableCell align="center">{t('contact.history.col_click_count')}</TableCell>
                      <TableCell>{t('contact.history.col_links')}</TableCell>
                      <TableCell align="center">{t('contact.history.col_unsubscribed')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.campaigns.map((c) => (
                      <TableRow key={c.campaign_id} hover>
                        <TableCell>{c.campaign_name ?? '—'}</TableCell>
                        <TableCell sx={{whiteSpace: 'nowrap'}}>{fmtDate(c.sent_at)}</TableCell>
                        <TableCell align="center">
                          {c.opened
                            ? <Tooltip title={fmtDate(c.opened_at)}><CheckCircleIcon fontSize="small" color="success" /></Tooltip>
                            : <CancelIcon fontSize="small" color="disabled" />
                          }
                        </TableCell>
                        <TableCell align="center">{c.open_count}</TableCell>
                        <TableCell align="center">
                          {c.clicked
                            ? <CheckCircleIcon fontSize="small" color="success" />
                            : <CancelIcon fontSize="small" color="disabled" />
                          }
                        </TableCell>
                        <TableCell align="center">{c.click_count}</TableCell>
                        <TableCell>
                          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                            {c.links_clicked.map((url) => (
                              <Tooltip key={url} title={url}>
                                <Chip
                                  label={url.length > 40 ? `${url.slice(0, 40)}…` : url}
                                  size="small"
                                  variant="outlined"
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {c.unsubscribed
                            ? <CheckCircleIcon fontSize="small" color="error" />
                            : <CancelIcon fontSize="small" color="disabled" />
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        ) : null}
      </TabPanel>
    </Box>
  );
};

export default ContactEditContent;
