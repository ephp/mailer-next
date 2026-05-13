'use client';

import React, {ReactElement, useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import {useTranslations} from 'next-intl';
import {Contact} from '@/types/models/Contact';
import {ContactBounce, getContactBounces} from '@/shared/helpers/api/contactApiHelper';

interface Props {
  listId: number;
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
}

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

const ContactBouncesDialog = ({listId, contact, open, onClose}: Props): ReactElement => {
  const t = useTranslations();
  const [items, setItems] = useState<ContactBounce[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !contact) return;
    setLoading(true);
    setItems(null);
    getContactBounces({listId, id: contact.id})
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, contact, listId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {t('contact.bounces.title')}
        {contact && (
          <Typography variant="body2" color="text.secondary">
            {contact.email}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <>
            <Skeleton variant="rectangular" height={48} sx={{mb: 1}} />
            <Skeleton variant="rectangular" height={48} sx={{mb: 1}} />
            <Skeleton variant="rectangular" height={48} />
          </>
        ) : items && items.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('contact.bounces.col_sent_at')}</TableCell>
                <TableCell>{t('contact.bounces.col_campaign')}</TableCell>
                <TableCell align="center">{t('contact.bounces.col_status')}</TableCell>
                <TableCell align="center">{t('contact.bounces.col_retry')}</TableCell>
                <TableCell>{t('contact.bounces.col_error')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>{fmtDate(b.sent_at)}</TableCell>
                  <TableCell>{b.campaign_name ?? `#${b.campaign_id}`}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={b.status}
                      color={b.status === 'bounced' ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="center">{b.retry_count}</TableCell>
                  <TableCell sx={{maxWidth: 480, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                    {b.error_message ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography color="text.secondary">{t('contact.bounces.empty')}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('messages.btn.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactBouncesDialog;
