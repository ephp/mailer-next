'use client';

import React, {useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import {useTranslations} from 'next-intl';
import {getSendingStatus} from '@/shared/helpers/api/campaignApiHelper';
import {SendingStatus} from '@/types/models/CampaignEmail';

const POLL_INTERVAL_MS = 5000;

const StatBox = ({label, value}: {label: string; value: number}) => (
  <Box sx={{textAlign: 'center', p: 1}}>
    <Typography variant="h5" fontWeight="bold">{value}</Typography>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Box>
);

const SendingProgressModal = ({
  campaignId,
  open,
  onClose,
}: {
  campaignId: number;
  open: boolean;
  onClose: () => void;
}): React.ReactElement => {
  const t = useTranslations('campaign');
  const [status, setStatus] = useState<SendingStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const poll = async () => {
      try {
        const result = await getSendingStatus(campaignId);
        if (result.item) {
          setStatus(result.item);
        }
      } catch {
        // Network error — ignore, retry on next tick
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, campaignId]);

  const isComplete = status !== null && status.percent_complete === 100;
  const title = isComplete
    ? t('send.progress.title_complete')
    : t('send.progress.title');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{mb: 3}}>
          <LinearProgress
            variant="determinate"
            value={status?.percent_complete ?? 0}
            sx={{height: 8, borderRadius: 4}}
          />
          <Typography variant="caption" color="text.secondary" sx={{mt: 0.5, display: 'block', textAlign: 'right'}}>
            {status?.percent_complete ?? 0}%
          </Typography>
        </Box>

        <Grid container spacing={1} sx={{mb: 2}}>
          <Grid size={3}>
            <StatBox label={t('send.progress.sent')} value={status?.sent ?? 0} />
          </Grid>
          <Grid size={3}>
            <StatBox label={t('send.progress.pending')} value={(status?.pending ?? 0) + (status?.sending ?? 0)} />
          </Grid>
          <Grid size={3}>
            <StatBox label={t('send.progress.failed')} value={status?.failed ?? 0} />
          </Grid>
          <Grid size={3}>
            <StatBox label={t('send.progress.bounced')} value={status?.bounced ?? 0} />
          </Grid>
        </Grid>

        {!isComplete && (
          <Typography variant="body2" color="text.secondary" align="center">
            {t('send.progress.background_note')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {isComplete && (
          <Button
            component="a"
            href={`/campaigns/${campaignId}/stats`}
            variant="contained"
          >
            {t('send.progress.btn_stats')}
          </Button>
        )}
        <Button onClick={onClose}>{t('send.progress.btn_close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendingProgressModal;
