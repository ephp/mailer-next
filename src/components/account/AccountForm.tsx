'use client';

import React, {ReactElement} from 'react';
import {useFormik} from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import {Account, newAccount} from '@/types/models/Account';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {createAccount, updateAccount, updateMyAccount} from '@/shared/helpers/api/accountApiHelper';
import {useTranslations} from 'next-intl';
import SkeletonWrapper from '@/@oimmei/components/SkeletonWrapper';
import {DetailResult} from '@Oimmei-Digital-Boutique/crema-components';

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
    /** When true, uses the /my-account endpoint instead of the admin endpoint. */
    forMyAccount?: boolean;
    onOperationCompleted: () => void;
  },
): ReactElement | null => {
  const t = useTranslations();
  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const validationSchema = yup.object({
    ragione_sociale: yup.string().required(t('account.error.ragione_sociale.required')),
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
  } = useFormik<Account>({
    validateOnBlur: true,
    validationSchema,
    initialValues: account ?? newAccount,
    enableReinitialize: true,
    onSubmit: async (data, {setSubmitting}) => {
      let operationCompleted = false;
      setSubmitting(true);
      try {
        let promise: Promise<DetailResult<Account>>;
        if (!editing) {
          promise = createAccount({entity: {...data}});
        } else if (forMyAccount) {
          promise = updateMyAccount({entity: {...data}});
        } else {
          promise = updateAccount({entity: {...data}});
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

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="indirizzo"
              fullWidth
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
            {t('account.section.smtp')}
          </Box>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
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
              onChange={(e) => setValues(v => ({
                ...v,
                smtp_port: e.target.value ? parseInt(e.target.value, 10) : null,
              }))}
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
    </Box>
  );
};

export default AccountForm;
