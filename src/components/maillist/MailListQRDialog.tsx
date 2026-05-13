'use client';

import React, {ReactElement, useEffect, useMemo, useRef, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import {useTranslations} from 'next-intl';
import QRCode from 'react-qr-code';
import {MailList} from '@/types/models/MailList';
import {
  buildSubscribeUrl,
  getSubscribeInfo,
  SubscribeCategory,
} from '@/shared/helpers/api/subscribeApiHelper';

interface Props {
  mailList: MailList | null;
  open: boolean;
  onClose: () => void;
}

const MailListQRDialog = ({mailList, open, onClose}: Props): ReactElement => {
  const t = useTranslations();
  const [categories, setCategories] = useState<SubscribeCategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const qrWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !mailList) return;
    setLoading(true);
    setCategories(null);
    setSelected(new Set());
    // eslint-disable-next-line no-console
    console.log('[QR debug] fetching subscribe info for token:', mailList.subscribe_token);
    getSubscribeInfo(mailList.subscribe_token)
      .then((info) => {
        // eslint-disable-next-line no-console
        console.log('[QR debug] subscribe info response:', info);
        setCategories(info?.categories ?? []);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error('[QR debug] fetch failed:', e);
      })
      .finally(() => setLoading(false));
  }, [open, mailList]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = useMemo(() => {
    if (!mailList) return '';
    return buildSubscribeUrl(origin, mailList.subscribe_token, Array.from(selected));
  }, [mailList, origin, selected]);

  const toggleTerm = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const svg = qrWrapperRef.current?.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], {type: 'image/svg+xml'});
    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = dlUrl;
    a.download = `qr-${mailList?.name ?? 'list'}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(dlUrl);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t('maillist.qr.title')}
        {mailList && (
          <Typography variant="body2" color="text.secondary">
            {mailList.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 4}}>
          <Box ref={qrWrapperRef} sx={{flex: '0 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
            {url && (
              <QRCode value={url} size={220} style={{height: 'auto', maxWidth: '100%', width: 220}} />
            )}
          </Box>

          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography variant="body2" sx={{mb: 1, fontWeight: 600}}>
              {t('maillist.qr.url_label')}
            </Typography>
            <TextField
              value={url}
              fullWidth
              size="small"
              slotProps={{input: {readOnly: true}}}
              sx={{mb: 2}}
            />

            <Typography variant="body2" sx={{mb: 1, fontWeight: 600}}>
              {t('maillist.qr.taxonomies_label')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={80} />
            ) : categories && categories.length > 0 ? (
              <Box>
                {categories.map((cat) => (
                  <Box key={cat.id} sx={{mb: 2}}>
                    <Typography variant="caption" color="text.secondary">{cat.name}</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{mt: 0.5}}>
                      {cat.terms.map((term) => {
                        const sel = selected.has(term.id);
                        return (
                          <Chip
                            key={term.id}
                            label={term.name}
                            clickable
                            color={sel ? 'primary' : 'default'}
                            variant={sel ? 'filled' : 'outlined'}
                            size="small"
                            onClick={() => toggleTerm(term.id)}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">{t('maillist.qr.no_taxonomies')}</Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCopy}>{t('maillist.qr.copy_url')}</Button>
        <Button onClick={handleDownload} variant="outlined">{t('maillist.qr.download_svg')}</Button>
        <Button onClick={onClose}>{t('messages.btn.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MailListQRDialog;
