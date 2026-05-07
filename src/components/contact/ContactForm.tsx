'use client';

import React, {ReactElement, useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import {Contact, newContact} from '@/types/models/Contact';
import {TaxonomyCategory} from '@/types/models/TaxonomyCategory';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {createContact, updateContact} from '@/shared/helpers/api/contactApiHelper';
import {
  getContactTaxonomy,
  getTaxonomyCategoryList,
  syncContactTaxonomy,
} from '@/shared/helpers/api/taxonomyApiHelper';
import {useTranslations} from 'next-intl';
import SkeletonWrapper from '@/@oimmei/components/SkeletonWrapper';
import {DetailResult} from '@Oimmei-Digital-Boutique/crema-components';
import TaxonomyFields from '@/components/contact/TaxonomyFields';

const ContactForm = (
  {
    contact,
    listId,
    editing,
    loading = false,
    onOperationCompleted,
  }: {
    contact: Contact | null;
    listId: number;
    editing: boolean;
    loading?: boolean;
    onOperationCompleted: () => void;
  },
): ReactElement | null => {
  const t = useTranslations();
  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [selectedTermIds, setSelectedTermIds] = useState<number[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  // Load the categories of the list (always)
  useEffect(() => {
    getTaxonomyCategoryList({listId})
      .then((res) => setCategories(res.item ?? []))
      .catch(console.error);
  }, [listId]);

  // In edit mode, load the term ids already linked to the contact
  useEffect(() => {
    if (!editing || !contact?.id) {
      setTaxonomyLoading(false);
      return;
    }
    setTaxonomyLoading(true);
    getContactTaxonomy({listId, contactId: contact.id})
      .then((res) => setSelectedTermIds(res.item?.term_ids ?? []))
      .catch(console.error)
      .finally(() => setTaxonomyLoading(false));
  }, [editing, listId, contact?.id]);

  const validationSchema = yup.object({
    email: yup.string().email(t('contact.error.email.email')).required(t('contact.error.email.required')),
    nome: yup.string().nullable(),
    cognome: yup.string().nullable(),
    telefono: yup.string().nullable(),
    iscritto: yup.boolean().required(),
  });

  const {
    values,
    setValues,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFormik<Contact>({
    validateOnBlur: true,
    validationSchema,
    initialValues: contact ?? newContact,
    enableReinitialize: true,
    onSubmit: async (data, {setSubmitting}) => {
      let operationCompleted = false;
      setSubmitting(true);
      try {
        const promise: Promise<DetailResult<Contact>> = editing
          ? updateContact({listId, entity: {...data}})
          : createContact({listId, entity: {...data}});
        const saved = await performAsyncCall(promise);

        const savedContactId = saved?.item?.id;
        if (savedContactId) {
          await performAsyncCall(syncContactTaxonomy({
            listId,
            contactId: savedContactId,
            termIds: selectedTermIds,
          }));
        }
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

  const wrapping = contact === null;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
      <Grid container spacing={4}>
        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="email"
              fullWidth
              required
              label={t('contact.field.email')}
              value={values.email}
              onChange={(e) => setValues(v => ({...v, email: e.target.value}))}
              error={!!errors.email}
              helperText={errors.email}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="nome"
              fullWidth
              label={t('contact.field.nome')}
              value={values.nome ?? ''}
              onChange={(e) => setValues(v => ({...v, nome: e.target.value || null}))}
              error={!!errors.nome}
              helperText={errors.nome as string}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="cognome"
              fullWidth
              label={t('contact.field.cognome')}
              value={values.cognome ?? ''}
              onChange={(e) => setValues(v => ({...v, cognome: e.target.value || null}))}
              error={!!errors.cognome}
              helperText={errors.cognome as string}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <TextField
              name="telefono"
              fullWidth
              label={t('contact.field.telefono')}
              value={values.telefono ?? ''}
              onChange={(e) => setValues(v => ({...v, telefono: e.target.value || null}))}
              error={!!errors.telefono}
              helperText={errors.telefono as string}
              slotProps={{inputLabel: {shrink: true}}}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
            <FormControlLabel
              control={
                <Switch
                  checked={values.iscritto}
                  onChange={(e) => setValues(v => ({...v, iscritto: e.target.checked}))}
                />
              }
              label={t('contact.field.iscritto')}
            />
          </SkeletonWrapper>
        </Grid>

        {categories.length > 0 && (
          <Grid size={12}>
            <Box sx={{fontWeight: 600, mt: 2, mb: 1}}>
              {t('contact.section.taxonomies')}
            </Box>
            <TaxonomyFields
              categories={categories}
              selectedTermIds={selectedTermIds}
              onChange={setSelectedTermIds}
              loading={taxonomyLoading}
            />
          </Grid>
        )}

        <Grid mt={4} size={12}>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: '10px', mb: 3}}>
            <Button
              sx={{minWidth: 100}}
              color="primary"
              variant="contained"
              type="submit"
              disabled={isSubmitting || contact === null}
            >
              {t('messages.btn.save')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactForm;
