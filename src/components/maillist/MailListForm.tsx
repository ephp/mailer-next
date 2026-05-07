'use client';

import React, {ReactElement, useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import {MailList, newMailList} from '@/types/models/MailList';
import {Account} from '@/types/models/Account';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {createMailList, updateMailList} from '@/shared/helpers/api/mailListApiHelper';
import {useTranslations} from 'next-intl';
import SkeletonWrapper from '@/@oimmei/components/SkeletonWrapper';
import {DetailResult} from '@Oimmei-Digital-Boutique/crema-components';
import {useSnackbar} from 'notistack';
import RichHtmlEditor from '@/components/editor/RichHtmlEditor';

const SMTP_ENCRYPTION_OPTIONS = [
  {value: 'tls', labelKey: 'account.smtp.encryption.tls'},
  {value: 'ssl', labelKey: 'account.smtp.encryption.ssl'},
  {value: 'none', labelKey: 'account.smtp.encryption.none'},
];

const MailListForm = (
  {
    mailList,
    account,
    editing,
    loading = false,
    onOperationCompleted,
    onCancel,
  }: {
    mailList: MailList | null;
    account: Account | null;
    editing: boolean;
    loading?: boolean;
    onOperationCompleted: () => void;
    onCancel?: () => void;
  },
): ReactElement | null => {
  const t = useTranslations();
  const {performAsyncCall} = useAsyncCallHelper2Actions();
  const {enqueueSnackbar} = useSnackbar();
  const [smtpMode, setSmtpMode] = useState<'dsn' | 'fields'>('fields');

  useEffect(() => {
    if (mailList?.mailer_dsn_override) setSmtpMode('dsn');
    else setSmtpMode('fields');
  }, [mailList?.mailer_dsn_override]);

  const validationSchema = yup.object({
    name: yup.string().required(t('maillist.error.name.required')),
    description: yup.string().nullable(),
    firma_html: yup.string().nullable(),
    use_custom_dsn: yup.boolean().required(),
    mailer_dsn_override: yup.string().nullable(),
    smtp_host: yup.string().nullable(),
    smtp_port: yup.number().nullable().min(1).max(65535),
    smtp_user: yup.string().nullable(),
    smtp_password: yup.string().nullable(),
    smtp_encryption: yup.string().nullable().oneOf(['tls', 'ssl', 'none', null, '']),
    mail_from: yup.string().nullable().when('use_custom_dsn', {
      is: true,
      then: (s) => s.email(t('account.error.mail_from.invalid')),
    }),
    mail_from_name: yup.string().nullable(),
    permetti_disiscrizione: yup.boolean().required(),
    unsubscribe_text: yup.string().nullable(),
  });

  const {
    values,
    setValues,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFormik<MailList>({
    validateOnBlur: true,
    validationSchema,
    initialValues: mailList ?? newMailList,
    enableReinitialize: true,
    onSubmit: async (data, {setSubmitting}) => {
      let operationCompleted = false;
      setSubmitting(true);
      try {
        let promise: Promise<DetailResult<MailList>>;
        if (!editing) {
          promise = createMailList({entity: {...data}});
        } else {
          promise = updateMailList({entity: {...data}});
        }
        await performAsyncCall(promise);
        enqueueSnackbar(t(editing ? 'maillist.success.updated' : 'maillist.success.created'), {variant: 'success'});
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

  const wrapping = mailList === null;
  const accountDsnPreview = account?.mailer_dsn
    ?? (account?.smtp_host ? `smtp://${account.smtp_user ?? ''}@${account.smtp_host}:${account.smtp_port ?? 587}` : '');

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
      <Grid container spacing={4}>
        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="name"
              fullWidth
              required
              label={t('maillist.field.name')}
              value={values.name}
              onChange={(e) => setValues(v => ({...v, name: e.target.value}))}
              error={!!errors.name}
              helperText={errors.name}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="description"
              fullWidth
              multiline
              rows={3}
              label={t('maillist.field.description')}
              value={values.description ?? ''}
              onChange={(e) => setValues(v => ({...v, description: e.target.value || null}))}
              error={!!errors.description}
              helperText={errors.description as string}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <RichHtmlEditor
              label={t('maillist.field.firma_html')}
              value={values.firma_html ?? ''}
              onChange={(html) => setValues(v => ({...v, firma_html: html || null}))}
              minHeight={220}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={12}>
          <Box sx={{fontWeight: 600, mt: 2, mb: 1}}>
            {t('maillist.section.smtp')}
          </Box>
        </Grid>

        <Grid size={12}>
          <FormControlLabel
            control={
              <Switch
                checked={values.use_custom_dsn}
                onChange={(e) => setValues(v => ({...v, use_custom_dsn: e.target.checked}))}
              />
            }
            label={t('maillist.field.use_custom_dsn')}
          />
        </Grid>

        {!values.use_custom_dsn && (
          <>
            <Grid size={12}>
              <Alert severity="info">{t('maillist.smtp.using_account_default')}</Alert>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <TextField
                fullWidth
                label={t('maillist.field.mail_from_default')}
                value={account?.mail_from ?? ''}
                slotProps={{input: {readOnly: true}, inputLabel: {shrink: true}}}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <TextField
                fullWidth
                label={t('maillist.field.mail_from_name_default')}
                value={account?.mail_from_name ?? ''}
                slotProps={{input: {readOnly: true}, inputLabel: {shrink: true}}}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label={t('maillist.field.dsn_default')}
                value={accountDsnPreview}
                slotProps={{input: {readOnly: true}, inputLabel: {shrink: true}}}
              />
            </Grid>
          </>
        )}

        {values.use_custom_dsn && (
          <>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={smtpMode === 'dsn'}
                    onChange={(e) => setSmtpMode(e.target.checked ? 'dsn' : 'fields')}
                  />
                }
                label={smtpMode === 'dsn' ? t('account.smtp.mode.dsn') : t('account.smtp.mode.fields')}
              />
            </Grid>

            {smtpMode === 'dsn' && (
              <Grid size={12}>
                <TextField
                  name="mailer_dsn_override"
                  fullWidth
                  label={t('maillist.field.mailer_dsn_override')}
                  value={values.mailer_dsn_override ?? ''}
                  onChange={(e) => setValues(v => ({...v, mailer_dsn_override: e.target.value || null}))}
                  error={!!errors.mailer_dsn_override}
                  helperText={errors.mailer_dsn_override as string}
                  slotProps={{inputLabel: {shrink: true}}}
                />
              </Grid>
            )}

            {smtpMode === 'fields' && (
              <>
                <Grid size={{xs: 12, md: 6}}>
                  <TextField
                    name="smtp_host"
                    fullWidth
                    label={t('account.field.smtp_host')}
                    value={values.smtp_host ?? ''}
                    onChange={(e) => setValues(v => ({...v, smtp_host: e.target.value || null}))}
                    error={!!errors.smtp_host}
                    helperText={errors.smtp_host as string}
                    slotProps={{inputLabel: {shrink: true}}}
                  />
                </Grid>

                <Grid size={{xs: 12, md: 6}}>
                  <TextField
                    name="smtp_port"
                    fullWidth
                    type="number"
                    label={t('account.field.smtp_port')}
                    value={values.smtp_port ?? ''}
                    onChange={(e) => setValues(v => ({
                      ...v,
                      smtp_port: e.target.value ? parseInt(e.target.value, 10) : null,
                    }))}
                    error={!!errors.smtp_port}
                    helperText={errors.smtp_port as string}
                    slotProps={{inputLabel: {shrink: true}}}
                  />
                </Grid>

                <Grid size={{xs: 12, md: 6}}>
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
                </Grid>

                <Grid size={{xs: 12, md: 6}}>
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
                </Grid>

                <Grid size={{xs: 12, md: 6}}>
                  <TextField
                    name="smtp_encryption"
                    fullWidth
                    select
                    label={t('account.field.smtp_encryption')}
                    value={values.smtp_encryption ?? ''}
                    onChange={(e) => setValues(v => ({
                      ...v,
                      smtp_encryption: (e.target.value as MailList['smtp_encryption']) || null,
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
                </Grid>
              </>
            )}

            <Grid size={{xs: 12, md: 6}}>
              <TextField
                name="mail_from"
                fullWidth
                type="email"
                label={t('maillist.field.mail_from')}
                value={values.mail_from ?? ''}
                onChange={(e) => setValues(v => ({...v, mail_from: e.target.value || null}))}
                error={!!errors.mail_from}
                helperText={(errors.mail_from as string) ?? t('maillist.help.mail_from', {default: account?.mail_from ?? ''})}
                slotProps={{inputLabel: {shrink: true}}}
              />
            </Grid>

            <Grid size={{xs: 12, md: 6}}>
              <TextField
                name="mail_from_name"
                fullWidth
                label={t('maillist.field.mail_from_name')}
                value={values.mail_from_name ?? ''}
                onChange={(e) => setValues(v => ({...v, mail_from_name: e.target.value || null}))}
                error={!!errors.mail_from_name}
                helperText={(errors.mail_from_name as string) ?? t('maillist.help.mail_from_name', {default: account?.mail_from_name ?? ''})}
                slotProps={{inputLabel: {shrink: true}}}
              />
            </Grid>
          </>
        )}

        <Grid size={12}>
          <Box sx={{fontWeight: 600, mt: 2, mb: 1}}>
            {t('maillist.section.unsubscribe')}
          </Box>
        </Grid>

        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <FormControlLabel
              control={
                <Switch
                  checked={values.permetti_disiscrizione}
                  onChange={(e) => setValues(v => ({...v, permetti_disiscrizione: e.target.checked}))}
                />
              }
              label={t('maillist.field.permetti_disiscrizione')}
            />
          </SkeletonWrapper>
        </Grid>

        {values.permetti_disiscrizione && (
          <Grid size={12}>
            <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
              <TextField
                name="unsubscribe_text"
                fullWidth
                multiline
                rows={3}
                label={t('maillist.field.unsubscribe_text')}
                value={values.unsubscribe_text ?? ''}
                onChange={(e) => setValues(v => ({...v, unsubscribe_text: e.target.value || null}))}
                error={!!errors.unsubscribe_text}
                helperText={errors.unsubscribe_text as string}
                slotProps={{inputLabel: {shrink: true}}}
              />
            </SkeletonWrapper>
          </Grid>
        )}

        <Grid mt={4} size={12}>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: '10px', mb: 3}}>
            {onCancel && (
              <Button
                sx={{minWidth: 100}}
                color="inherit"
                variant="outlined"
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t('messages.btn.cancel')}
              </Button>
            )}
            <Button
              sx={{minWidth: 100}}
              color="primary"
              variant="contained"
              type="submit"
              disabled={isSubmitting || mailList === null}
            >
              {t('messages.btn.save')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MailListForm;
