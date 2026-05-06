'use client';

import React, {ReactElement} from 'react';
import {useFormik} from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import {MailList, newMailList} from '@/types/models/MailList';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {createMailList, updateMailList} from '@/shared/helpers/api/mailListApiHelper';
import {useTranslations} from 'next-intl';
import SkeletonWrapper from '@/@oimmei/components/SkeletonWrapper';
import {DetailResult} from '@Oimmei-Digital-Boutique/crema-components';
import {useSnackbar} from 'notistack';

const MailListForm = (
  {
    mailList,
    editing,
    loading = false,
    onOperationCompleted,
    onCancel,
  }: {
    mailList: MailList | null;
    editing: boolean;
    loading?: boolean;
    onOperationCompleted: () => void;
    onCancel?: () => void;
  },
): ReactElement | null => {
  const t = useTranslations();
  const {performAsyncCall} = useAsyncCallHelper2Actions();
  const {enqueueSnackbar} = useSnackbar();

  const validationSchema = yup.object({
    name: yup.string().required(t('maillist.error.name.required')),
    description: yup.string().nullable(),
    firma_html: yup.string().nullable(),
    mailer_dsn_override: yup.string().nullable(),
    permetti_disiscrizione: yup.boolean().required(),
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
            <TextField
              name="firma_html"
              fullWidth
              multiline
              rows={5}
              label={t('maillist.field.firma_html')}
              value={values.firma_html ?? ''}
              onChange={(e) => setValues(v => ({...v, firma_html: e.target.value || null}))}
              error={!!errors.firma_html}
              helperText={errors.firma_html as string}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
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
          </SkeletonWrapper>
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
