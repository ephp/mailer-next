'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {useTranslations} from 'next-intl';

const SendingProgressModal = ({
  campaignId: _campaignId,
  open,
  onClose,
}: {
  campaignId: number;
  open: boolean;
  onClose: () => void;
}): React.ReactElement => {
  const t = useTranslations('campaign');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('send.progress.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{display: 'flex', justifyContent: 'center', py: 3}}>
          <CircularProgress />
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          {t('send.progress.background_note')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('send.progress.btn_close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendingProgressModal;
