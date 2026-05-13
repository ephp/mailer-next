'use client';

import React, {ReactElement, useEffect, useMemo, useState} from 'react';
import {useParams, useSearchParams} from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  getSubscribeInfo,
  submitSubscribe,
  SubscribeInfo,
  SubscribePayload,
} from '@/shared/helpers/api/subscribeApiHelper';

const SubscribePageContent = (): ReactElement => {
  const {token: tokenParam} = useParams<{token: string}>();
  const token = tokenParam ?? '';
  const search = useSearchParams();
  const presetTermIds = useMemo(() => {
    const raw = search.get('t');
    if (!raw) return new Set<number>();
    const ids = raw.split(',').map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));
    return new Set<number>(ids);
  }, [search]);

  const [info, setInfo] = useState<SubscribeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // When the QR encodes pre-selected taxonomies, the user does not get to
  // choose: those terms are applied silently and the picker stays hidden.
  const hasPresetTaxonomies = presetTermIds.size > 0;

  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [telefono, setTelefono] = useState('');
  const [selectedTermIds, setSelectedTermIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSubscribeInfo(token)
      .then((data) => {
        if (!data) {
          setNotFound(true);
          return;
        }
        setInfo(data);
        setSelectedTermIds(new Set(presetTermIds));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token, presetTermIds]);

  const toggleTerm = (id: number) => {
    setSelectedTermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!privacyAccepted) {
      setError('Per procedere devi accettare l\'informativa sulla privacy.');
      return;
    }
    setSubmitting(true);
    const payload: SubscribePayload = {
      email: email.trim(),
      nome: nome.trim() || null,
      cognome: cognome.trim() || null,
      telefono: telefono.trim() || null,
      term_ids: Array.from(selectedTermIds),
      privacy_accepted: privacyAccepted,
    };
    const result = await submitSubscribe(token, payload);
    setSubmitting(false);
    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.message ?? 'Errore durante l\'iscrizione.');
    }
  };

  return (
    <Box sx={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f4f4', p: 2}}>
      <Paper sx={{maxWidth: 520, width: '100%', p: 4}}>
        {loading ? (
          <>
            <Skeleton variant="text" height={48} sx={{mb: 1}} />
            <Skeleton variant="text" height={24} sx={{mb: 3}} />
            <Skeleton variant="rectangular" height={56} sx={{mb: 2}} />
            <Skeleton variant="rectangular" height={56} sx={{mb: 2}} />
            <Skeleton variant="rectangular" height={56} />
          </>
        ) : notFound ? (
          <Alert severity="error">Lista non trovata o link non più valido.</Alert>
        ) : success ? (
          <Box sx={{textAlign: 'center'}}>
            <Typography variant="h5" sx={{mb: 1, fontWeight: 700}}>
              Iscrizione completata
            </Typography>
            <Typography color="text.secondary">
              Grazie per esserti iscritto a {info?.list.name}.
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" sx={{mb: 0.5, fontWeight: 700}}>
              Iscriviti a {info?.list.name}
            </Typography>
            {info?.list.description && (
              <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                {info.list.description}
              </Typography>
            )}

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              sx={{mb: 2}}
            />
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              sx={{mb: 2}}
            />
            <TextField
              label="Cognome"
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              fullWidth
              sx={{mb: 2}}
            />
            <TextField
              label="Telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              fullWidth
              sx={{mb: 2}}
            />

            {!hasPresetTaxonomies && info && info.categories.length > 0 && (
              <Box sx={{mb: 3}}>
                {info.categories.map((cat) => (
                  <Box key={cat.id} sx={{mb: 2}}>
                    <Typography variant="body2" sx={{mb: 1, fontWeight: 600}}>
                      {cat.name}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {cat.terms.map((term) => {
                        const selected = selectedTermIds.has(term.id);
                        return (
                          <Chip
                            key={term.id}
                            label={term.name}
                            clickable
                            color={selected ? 'primary' : 'default'}
                            variant={selected ? 'filled' : 'outlined'}
                            onClick={() => toggleTerm(term.id)}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{mb: 2}}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Ho letto e accetto l'
                    <Link component="button" type="button" onClick={(e) => {e.preventDefault(); setPrivacyOpen(true);}}>
                      informativa sulla privacy
                    </Link>
                    .
                  </Typography>
                }
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting || !privacyAccepted}
            >
              {submitting ? 'Iscrizione in corso…' : 'Iscrivimi'}
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Informativa sulla privacy</DialogTitle>
        <DialogContent dividers>
          <Typography component="div" sx={{whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6}}>
            {info?.privacy_policy ?? ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscribePageContent;
