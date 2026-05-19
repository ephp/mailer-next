'use client';

import React, {ReactElement, useEffect, useRef, useState} from 'react';
import {useFormik} from 'formik';
import * as yup from 'yup';
import {resolveMediaUrl} from '@/shared/constants/AppConst';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BusinessIcon from '@mui/icons-material/Business';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import {Account, newAccount, SmtpDiagnosticResult, SmtpTestResult} from '@/types/models/Account';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {createAccount, updateAccount, updateAccountById, regenerateApiKey, diagnoseSMTP, uploadAccountLogo, testSmtp, sendTestEmail} from '@/shared/helpers/api/accountApiHelper';

type AccountFormValues = Account & { smtp_password: string | null };
import {useTranslations} from 'next-intl';
import SkeletonWrapper from '@/@oimmei/components/SkeletonWrapper';
import RichHtmlEditor from '@/components/editor/RichHtmlEditor';
import FormHelperText from '@mui/material/FormHelperText';
import {DetailResult} from '@Oimmei-Digital-Boutique/crema-components';
import {useSnackbar} from 'notistack';

const SMTP_ENCRYPTION_OPTIONS = [
  {value: 'tls', labelKey: 'account.smtp.encryption.tls'},
  {value: 'ssl', labelKey: 'account.smtp.encryption.ssl'},
  {value: 'none', labelKey: 'account.smtp.encryption.none'},
];

const AccountForm = (
  {
    account,
    editing,
    loading = false,
    forMyAccount = false,
    onOperationCompleted,
  }: {
    account: Account | null;
    editing: boolean;
    loading?: boolean;
    /** When true, uses the /api/v1/account endpoint instead of the admin endpoint. */
    forMyAccount?: boolean;
    onOperationCompleted: () => void;
  },
): ReactElement | null => {
  const t = useTranslations();
  const {performAsyncCall} = useAsyncCallHelper2Actions();
  const {enqueueSnackbar} = useSnackbar();
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<SmtpDiagnosticResult | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [smtpMode, setSmtpMode] = useState<'dsn' | 'fields'>('fields');
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<SmtpTestResult | null>(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState('');
  const [showTestEmailInput, setShowTestEmailInput] = useState(false);

  useEffect(() => {
    if (account?.mailer_dsn) setSmtpMode('dsn');
  }, [account?.mailer_dsn]);

  const validationSchema = yup.object({
    ragione_sociale: yup.string().required(t('account.error.ragione_sociale.required')),
    email_contatto: yup.string().required(t('account.error.email_contatto.required')).email(t('account.error.email_contatto.invalid')),
    mail_from: yup.string().required(t('account.error.mail_from.required')).email(t('account.error.mail_from.invalid')),
    mail_from_name: yup.string().required(t('account.error.mail_from_name.required')),
    partita_iva: yup.string().nullable(),
    indirizzo: yup.string().nullable(),
    smtp_host: yup.string().nullable(),
    smtp_port: yup.number().nullable().min(1).max(65535),
    smtp_user: yup.string().nullable(),
    smtp_password: yup.string().nullable(),
    smtp_encryption: yup.string().nullable().oneOf(['tls', 'ssl', 'none', null, '']),
  });

  const {
    values,
    setValues,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFormik<AccountFormValues>({
    validateOnBlur: true,
    validationSchema,
    initialValues: {...(account ?? newAccount), smtp_password: null},
    enableReinitialize: true,
    onSubmit: async (data, {setSubmitting}) => {
      let operationCompleted = false;
      setSubmitting(true);
      try {
        let promise: Promise<DetailResult<Account>>;
        if (!editing) {
          promise = createAccount({entity: {...data}});
        } else if (forMyAccount) {
          promise = updateAccount({
            ragione_sociale: data.ragione_sociale,
            email_contatto: data.email_contatto,
            mail_from: data.mail_from,
            mail_from_name: data.mail_from_name,
            partita_iva: data.partita_iva,
            indirizzo: data.indirizzo,
            mailer_dsn: data.mailer_dsn,
            smtp_host: data.smtp_host,
            smtp_port: data.smtp_port,
            smtp_user: data.smtp_user,
            smtp_password: data.smtp_password,
            smtp_encryption: data.smtp_encryption,
            api_rate_limit: data.api_rate_limit,
            privacy_policy: data.privacy_policy,
          });
        } else {
          promise = updateAccountById({entity: {...data}});
        }
        await performAsyncCall(promise);
        operationCompleted = true;
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
      if (operationCompleted) {
        onOperationCompleted();
      }
    },
  });

  const handleCopyApiKey = () => {
    if (values.api_key) {
      navigator.clipboard.writeText(values.api_key).then(() => {
        enqueueSnackbar({message: t('account.success.api_key_copied'), variant: 'success'});
      });
    }
  };

  const handleDiagnose = async () => {
    setDiagnosing(true);
    setDiagnosticResult(null);
    try {
      const result = await performAsyncCall(diagnoseSMTP());
      if (result?.item) {
        setDiagnosticResult(result.item);
      }
    } catch {
      // error handled by performAsyncCall
    } finally {
      setDiagnosing(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    if (!forMyAccount) return;
    setRegenerating(true);
    try {
      const result = await performAsyncCall(regenerateApiKey());
      if (result?.item) {
        await setValues(v => ({...v, api_key: result.item!.api_key}));
        enqueueSnackbar({message: t('account.success.api_key_regenerated'), variant: 'success'});
      }
    } catch {
      // error handled by performAsyncCall
    } finally {
      setRegenerating(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      await performAsyncCall(uploadAccountLogo(file));
      enqueueSnackbar({message: t('account.success.logo_uploaded'), variant: 'success'});
      onOperationCompleted();
    } catch {
      // error handled by performAsyncCall
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleTestSmtp = async () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      let result: SmtpTestResult;
      if (smtpMode === 'dsn') {
        result = await testSmtp({dsn: values.mailer_dsn ?? ''});
      } else {
        result = await testSmtp({
          smtpHost: values.smtp_host ?? '',
          smtpPort: values.smtp_port ?? 587,
        });
      }
      setSmtpTestResult(result);
    } catch {
      setSmtpTestResult({success: false, error: 'Errore di rete'});
    } finally {
      setSmtpTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTo) return;
    setSendingTestEmail(true);
    try {
      await performAsyncCall(sendTestEmail(testEmailTo));
      enqueueSnackbar({message: t('account.success.test_email_sent'), variant: 'success'});
      setShowTestEmailInput(false);
      setTestEmailTo('');
    } catch {
      // error handled by performAsyncCall
    } finally {
      setSendingTestEmail(false);
    }
  };

  const wrapping = account === null;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
      <Grid container spacing={4}>
        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="ragione_sociale"
              fullWidth
              required
              label={t('account.field.ragione_sociale')}
              value={values.ragione_sociale}
              onChange={(e) => setValues(v => ({...v, ragione_sociale: e.target.value}))}
              error={!!errors.ragione_sociale}
              helperText={errors.ragione_sociale}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="email_contatto"
              fullWidth
              required
              type="email"
              label={t('account.field.email_contatto')}
              value={values.email_contatto}
              onChange={(e) => setValues(v => ({...v, email_contatto: e.target.value}))}
              error={!!errors.email_contatto}
              helperText={errors.email_contatto as string}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="mail_from"
              fullWidth
              required
              type="email"
              label={t('account.field.mail_from')}
              value={values.mail_from}
              onChange={(e) => setValues(v => ({...v, mail_from: e.target.value}))}
              error={!!errors.mail_from}
              helperText={(errors.mail_from as string) ?? t('account.help.mail_from')}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="mail_from_name"
              fullWidth
              required
              label={t('account.field.mail_from_name')}
              value={values.mail_from_name}
              onChange={(e) => setValues(v => ({...v, mail_from_name: e.target.value}))}
              error={!!errors.mail_from_name}
              helperText={(errors.mail_from_name as string) ?? t('account.help.mail_from_name')}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="partita_iva"
              fullWidth
              label={t('account.field.partita_iva')}
              value={values.partita_iva ?? ''}
              onChange={(e) => setValues(v => ({...v, partita_iva: e.target.value || null}))}
              error={!!errors.partita_iva}
              helperText={errors.partita_iva as string}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="indirizzo"
              fullWidth
              multiline
              minRows={2}
              label={t('account.field.indirizzo')}
              value={values.indirizzo ?? ''}
              onChange={(e) => setValues(v => ({...v, indirizzo: e.target.value || null}))}
              error={!!errors.indirizzo}
              helperText={errors.indirizzo as string}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={12}>
          <Box sx={{fontWeight: 600, mt: 2, mb: 1}}>
            {t('account.section.privacy')}
          </Box>
        </Grid>
        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <RichHtmlEditor
              label={t('account.field.privacy_policy')}
              value={values.privacy_policy ?? ''}
              onChange={(html) => setValues(v => ({...v, privacy_policy: html || null}))}
              minHeight={220}
            />
            <FormHelperText>{t('account.help.privacy_policy')}</FormHelperText>
          </SkeletonWrapper>
        </Grid>

        {forMyAccount && (
          <>
            <Grid size={12}>
              <Box sx={{fontWeight: 600, mt: 2, mb: 1}}>
                {t('account.section.logo')}
              </Box>
            </Grid>
            <Grid size={12}>
              <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
                <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                  {values.logo ? (
                    <Box
                      component="img"
                      src={resolveMediaUrl(values.logo.url) ?? ''}
                      alt={t('account.field.logo')}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'contain',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 0.5,
                        bgcolor: 'background.paper',
                      }}
                    />
                  ) : (
                    <Box sx={{
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed',
                      borderColor: 'grey.400',
                      borderRadius: 1,
                      bgcolor: 'grey.50',
                    }}>
                      <BusinessIcon sx={{fontSize: 36, color: 'grey.400'}} />
                    </Box>
                  )}
                  <Box>
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      style={{display: 'none'}}
                      onChange={handleLogoUpload}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={logoUploading || account === null}
                      startIcon={logoUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    >
                      {values.logo ? t('account.btn.change_logo') : t('account.btn.upload_logo')}
                    </Button>
                    {values.logo && (
                      <Box sx={{mt: 0.5, fontSize: '0.75em', color: 'text.secondary'}}>
                        {values.logo.filename}
                      </Box>
                    )}
                  </Box>
                </Box>
              </SkeletonWrapper>
            </Grid>
          </>
        )}

        <Grid size={12}>
          <Box sx={{fontWeight: 600, mt: 2, mb: 1}}>
            {t('account.section.smtp')}
          </Box>
        </Grid>

        {forMyAccount && (
          <Grid size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={smtpMode === 'dsn'}
                  onChange={(e) => {
                    setSmtpMode(e.target.checked ? 'dsn' : 'fields');
                    setSmtpTestResult(null);
                  }}
                />
              }
              label={smtpMode === 'dsn' ? t('account.smtp.mode.dsn') : t('account.smtp.mode.fields')}
            />
          </Grid>
        )}

        {smtpMode === 'dsn' && (
          <Grid size={12}>
            <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
              <TextField
                name="mailer_dsn"
                fullWidth
                label={t('account.field.mailer_dsn')}
                value={values.mailer_dsn ?? ''}
                onChange={(e) => {
                  setValues(v => ({...v, mailer_dsn: e.target.value || null}));
                  setSmtpTestResult(null);
                }}
                slotProps={{inputLabel: {shrink: true}}}
              />
            </SkeletonWrapper>
          </Grid>
        )}

        {smtpMode === 'fields' && (
          <>
            <Grid size={{xs: 12, md: 6}}>
              <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
                <TextField
                  name="smtp_host"
                  fullWidth
                  label={t('account.field.smtp_host')}
                  value={values.smtp_host ?? ''}
                  onChange={(e) => {
                    setValues(v => ({...v, smtp_host: e.target.value || null}));
                    setSmtpTestResult(null);
                  }}
                  error={!!errors.smtp_host}
                  helperText={errors.smtp_host as string}
                  slotProps={{inputLabel: {shrink: true}}}
                />
              </SkeletonWrapper>
            </Grid>

            <Grid size={{xs: 12, md: 6}}>
              <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
                <TextField
                  name="smtp_port"
                  fullWidth
                  type="number"
                  label={t('account.field.smtp_port')}
                  value={values.smtp_port ?? ''}
                  onChange={(e) => {
                    setValues(v => ({
                      ...v,
                      smtp_port: e.target.value ? parseInt(e.target.value, 10) : null,
                    }));
                    setSmtpTestResult(null);
                  }}
                  error={!!errors.smtp_port}
                  helperText={errors.smtp_port as string}
                  slotProps={{inputLabel: {shrink: true}}}
                />
              </SkeletonWrapper>
            </Grid>

            <Grid size={{xs: 12, md: 6}}>
              <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
                <TextField
                  name="smtp_user"
                  fullWidth
                  label={t('account.field.smtp_user')}
                  value={values.smtp_user ?? ''}
                  onChange={(e) => setValues(v => ({...v, smtp_user: e.target.value || null}))}
                  error={!!errors.smtp_user}
                  helperText={errors.smtp_user as string}
                  slotProps={{inputLabel: {shrink: true}}}
                />
              </SkeletonWrapper>
            </Grid>

            <Grid size={{xs: 12, md: 6}}>
              <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
                <TextField
                  name="smtp_password"
                  fullWidth
                  type="password"
                  label={t('account.field.smtp_password')}
                  value={values.smtp_password ?? ''}
                  onChange={(e) => setValues(v => ({...v, smtp_password: e.target.value || null}))}
                  error={!!errors.smtp_password}
                  helperText={errors.smtp_password as string}
                  slotProps={{inputLabel: {shrink: true}}}
                />
              </SkeletonWrapper>
            </Grid>

            <Grid size={{xs: 12, md: 6}}>
              <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
                <TextField
                  name="smtp_encryption"
                  fullWidth
                  select
                  label={t('account.field.smtp_encryption')}
                  value={values.smtp_encryption ?? ''}
                  onChange={(e) => setValues(v => ({
                    ...v,
                    smtp_encryption: (e.target.value as Account['smtp_encryption']) || null,
                  }))}
                  error={!!errors.smtp_encryption}
                  helperText={errors.smtp_encryption as string}
                  slotProps={{inputLabel: {shrink: true}}}
                >
                  <MenuItem value="">{t('messages.common.placeholders.select')}</MenuItem>
                  {SMTP_ENCRYPTION_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </MenuItem>
                  ))}
                </TextField>
              </SkeletonWrapper>
            </Grid>
          </>
        )}

        {forMyAccount && editing && (
          <>
            <Grid size={12}>
              <Alert
                severity={
                  smtpTestResult === null ? 'warning' :
                  smtpTestResult.success ? 'success' : 'error'
                }
                icon={
                  smtpTestResult === null ? undefined :
                  smtpTestResult.success ? <CheckCircleIcon /> : <CancelIcon />
                }
              >
                {smtpTestResult === null
                  ? t('account.smtp.status.not_tested')
                  : smtpTestResult.success
                    ? t('account.smtp.status.ok')
                    : t('account.smtp.status.error', {error: smtpTestResult.error ?? ''})
                }
              </Alert>
            </Grid>

            <Grid size={12}>
              <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center'}}>
                <Button
                  variant="outlined"
                  onClick={handleTestSmtp}
                  disabled={smtpTesting || account === null}
                  startIcon={smtpTesting ? <CircularProgress size={16} /> : undefined}
                >
                  {t('account.btn.test_smtp')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowTestEmailInput(v => !v)}
                  startIcon={<EmailIcon />}
                  disabled={account === null}
                >
                  {t('account.btn.send_test_email')}
                </Button>
              </Box>
            </Grid>

            {showTestEmailInput && (
              <Grid size={12}>
                <Box sx={{display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
                  <TextField
                    type="email"
                    label={t('account.field.test_email_to')}
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    size="small"
                    sx={{flexGrow: 1, maxWidth: 400}}
                    slotProps={{inputLabel: {shrink: true}}}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendTestEmail}
                    disabled={sendingTestEmail || !testEmailTo}
                    startIcon={sendingTestEmail ? <CircularProgress size={16} /> : <SendIcon />}
                  >
                    {t('account.btn.send')}
                  </Button>
                </Box>
              </Grid>
            )}
          </>
        )}

        {editing && (
          <>
            <Grid size={12}>
              <Box sx={{fontWeight: 600, mt: 2, mb: 1}}>
                {t('account.section.api')}
              </Box>
            </Grid>
            <Grid size={12}>
              <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                  <TextField
                    fullWidth
                    label={t('account.field.api_key')}
                    value={values.api_key}
                    slotProps={{
                      input: {readOnly: true},
                      inputLabel: {shrink: true},
                    }}
                  />
                  <Tooltip title={t('account.btn.copy_api_key')}>
                    <IconButton onClick={handleCopyApiKey} size="large">
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  {forMyAccount && (
                    <Tooltip title={t('account.btn.regenerate_api_key')}>
                      <IconButton onClick={() => setConfirmRegenerateOpen(true)} disabled={regenerating} size="large">
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </SkeletonWrapper>
            </Grid>
            {forMyAccount && (
              <Grid size={{xs: 12, md: 4}}>
                <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
                  <TextField
                    name="api_rate_limit"
                    fullWidth
                    type="number"
                    label={t('account.field.api_rate_limit')}
                    helperText={t('account.help.api_rate_limit')}
                    value={values.api_rate_limit}
                    onChange={(e) => setValues(v => ({...v, api_rate_limit: parseInt(e.target.value, 10) || 1}))}
                    slotProps={{
                      input: {inputProps: {min: 1, max: 1000}},
                      inputLabel: {shrink: true},
                    }}
                  />
                </SkeletonWrapper>
              </Grid>
            )}
          </>
        )}

        {editing && forMyAccount && (
          <>
            <Grid size={12}>
              <Box sx={{fontWeight: 600, mt: 2, mb: 1}}>
                {t('account.section.diagnostic')}
              </Box>
            </Grid>
            <Grid size={12}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
                <Button
                  variant="outlined"
                  onClick={handleDiagnose}
                  disabled={diagnosing || account === null}
                  startIcon={diagnosing ? <CircularProgress size={16} /> : undefined}
                >
                  {t('account.btn.diagnose')}
                </Button>
              </Box>
            </Grid>

            {diagnosticResult !== null && (
              <Grid size={12}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                  <Alert
                    severity={diagnosticResult.smtp.connected ? 'success' : 'error'}
                    icon={diagnosticResult.smtp.connected ? <CheckCircleIcon /> : <CancelIcon />}
                  >
                    <Box sx={{fontWeight: 600, mb: 0.5}}>{t('account.diagnostic.smtp.title')}</Box>
                    {diagnosticResult.smtp.host === null
                      ? t('account.diagnostic.smtp.not_configured')
                      : diagnosticResult.smtp.connected
                        ? t('account.diagnostic.smtp.connected', {host: diagnosticResult.smtp.host, port: diagnosticResult.smtp.port})
                        : t('account.diagnostic.smtp.failed', {host: diagnosticResult.smtp.host, port: diagnosticResult.smtp.port})
                    }
                    {diagnosticResult.smtp.error && !diagnosticResult.smtp.connected && diagnosticResult.smtp.host !== null && (
                      <Box sx={{mt: 0.5, fontSize: '0.85em', opacity: 0.8}}>{diagnosticResult.smtp.error}</Box>
                    )}
                  </Alert>

                  <Box>
                    <Box sx={{fontWeight: 600, mb: 1}}>{t('account.diagnostic.dns.title')}</Box>
                    {diagnosticResult.dns.domain === null ? (
                      <Alert severity="warning">{t('account.diagnostic.dns.domain_unknown')}</Alert>
                    ) : (
                      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <Box sx={{fontSize: '0.85em', color: 'text.secondary'}}>
                          {t('account.diagnostic.dns.domain', {domain: diagnosticResult.dns.domain})}
                        </Box>
                        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                          <Chip
                            label={t('account.diagnostic.dns.spf')}
                            color={diagnosticResult.dns.spf.found ? 'success' : 'error'}
                            icon={diagnosticResult.dns.spf.found ? <CheckCircleIcon /> : <CancelIcon />}
                            size="small"
                          />
                          <Chip
                            label={
                              diagnosticResult.dns.dkim.found && diagnosticResult.dns.dkim.selector
                                ? t('account.diagnostic.dns.dkim', {selector: diagnosticResult.dns.dkim.selector})
                                : t('account.diagnostic.dns.dkim_not_found')
                            }
                            color={diagnosticResult.dns.dkim.found ? 'success' : 'error'}
                            icon={diagnosticResult.dns.dkim.found ? <CheckCircleIcon /> : <CancelIcon />}
                            size="small"
                          />
                          <Chip
                            label={t('account.diagnostic.dns.dmarc')}
                            color={diagnosticResult.dns.dmarc.found ? 'success' : 'error'}
                            icon={diagnosticResult.dns.dmarc.found ? <CheckCircleIcon /> : <CancelIcon />}
                            size="small"
                          />
                        </Box>
                        {diagnosticResult.dns.spf.record && (
                          <Box sx={{fontSize: '0.75em', fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, wordBreak: 'break-all'}}>
                            SPF: {diagnosticResult.dns.spf.record}
                          </Box>
                        )}
                        {diagnosticResult.dns.dkim.record && (
                          <Box sx={{fontSize: '0.75em', fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, wordBreak: 'break-all'}}>
                            DKIM ({diagnosticResult.dns.dkim.selector}): {diagnosticResult.dns.dkim.record}
                          </Box>
                        )}
                        {diagnosticResult.dns.dmarc.record && (
                          <Box sx={{fontSize: '0.75em', fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, wordBreak: 'break-all'}}>
                            DMARC: {diagnosticResult.dns.dmarc.record}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
          </>
        )}

        <Grid mt={4} size={12}>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: '10px', mb: 3}}>
            <Button
              sx={{minWidth: 100}}
              color="primary"
              variant="contained"
              type="submit"
              disabled={isSubmitting || account === null}
            >
              {t('messages.btn.save')}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={confirmRegenerateOpen} onClose={() => setConfirmRegenerateOpen(false)}>
        <DialogTitle>{t('account.dialog.regenerate_api_key.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('account.dialog.regenerate_api_key.message')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRegenerateOpen(false)}>
            {t('messages.btn.cancel')}
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => {
              setConfirmRegenerateOpen(false);
              handleRegenerateApiKey();
            }}
          >
            {t('account.btn.regenerate_anyway')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountForm;
