'use client';

import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {useParams, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {useSnackbar} from 'notistack';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {getCampaign, updateCampaign} from '@/shared/helpers/api/campaignApiHelper';
import {CAMPAIGN_CRUD_LIST, WIZARD_STEP_1, WIZARD_STEP_3} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import RichHtmlEditor from '@/components/editor/RichHtmlEditor';
import CampaignAttachmentsBlock from '@/components/campaign/CampaignAttachmentsBlock';

const AUTOSAVE_DELAY_MS = 30_000;
const PLACEHOLDERS = ['[[nome]]', '[[cognome]]', '[[email]]'];

const WizardStep2Content = (): ReactElement | null => {
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();
  const campaignId = parseInt(idParam, 10);
  const {enqueueSnackbar} = useSnackbar();
  const t = useTranslations();

  const [name, setName] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [snippet, setSnippet] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirstSaveRef = useRef(true);

  const {
    result: campaignResult,
    loading: campaignLoading,
    perform: fetchCampaign,
  } = useAsyncLoader(getCampaign, false);

  useEffect(() => {
    fetchCampaign(campaignId).catch(() => {
      enqueueSnackbar(t('campaign.error.not_found'), {variant: 'error'});
      router.push(CAMPAIGN_CRUD_LIST);
    });
  }, [fetchCampaign, campaignId, enqueueSnackbar, router, t]);

  useEffect(() => {
    const campaign = campaignResult?.item;
    if (campaign && !initialized) {
      setName(campaign.name ?? '');
      setEmailSubject(campaign.email_subject ?? '');
      setSnippet(campaign.snippet ?? '');
      setBody(campaign.body ?? '');
      setInitialized(true);
    }
  }, [campaignResult, initialized]);

  const doSave = useCallback(
    async (n: string, es: string, sn: string, b: string): Promise<void> => {
      setIsSaving(true);
      setSaved(false);
      try {
        await updateCampaign(campaignId, {
          name: n || null,
          emailSubject: es,
          snippet: sn || null,
          body: b || null,
        });
        setSaved(true);
      } catch {
        enqueueSnackbar(t('campaign.wizard.step2.save_error'), {variant: 'error'});
      } finally {
        setIsSaving(false);
      }
    },
    [campaignId, enqueueSnackbar, t],
  );

  useEffect(() => {
    if (!initialized) return;

    if (skipFirstSaveRef.current) {
      skipFirstSaveRef.current = false;
      return;
    }

    setSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      doSave(name, emailSubject, snippet, body).catch(console.error);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name, emailSubject, snippet, body, initialized, doSave]);

  const handleInsertPlaceholder = (ph: string) => {
    setBody(prev => (prev ?? '') + ph);
  };

  const handleBack = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push(generatePathStorage(WIZARD_STEP_1, {id: idParam}));
  };

  const handleContinue = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await doSave(name, emailSubject, snippet, body);
    router.push(generatePathStorage(WIZARD_STEP_3, {id: idParam}));
  };

  const steps = [
    t('campaign.wizard.step1.title'),
    t('campaign.wizard.step2.title'),
    t('campaign.wizard.step3.title'),
    t('campaign.wizard.step4.title'),
  ];

  if (campaignLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', py: 6}}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stepper activeStep={1} sx={{mb: 4}}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
        {t('campaign.wizard.step2.description')}
      </Typography>

      <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
        <TextField
          fullWidth
          label={t('campaign.field.name')}
          value={name}
          onChange={e => setName(e.target.value)}
          slotProps={{inputLabel: {shrink: true}}}
        />

        <TextField
          fullWidth
          required
          label={t('campaign.field.email_subject')}
          value={emailSubject}
          onChange={e => setEmailSubject(e.target.value)}
          slotProps={{inputLabel: {shrink: true}}}
        />

        <TextField
          fullWidth
          label={t('campaign.field.snippet')}
          value={snippet}
          onChange={e => setSnippet(e.target.value)}
          slotProps={{inputLabel: {shrink: true}}}
          helperText={t('campaign.field.snippet_helper')}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 1}}>
            {t('campaign.wizard.step2.placeholders_label')}
          </Typography>
          <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
            {PLACEHOLDERS.map(ph => (
              <Chip
                key={ph}
                label={ph}
                size="small"
                onClick={() => handleInsertPlaceholder(ph)}
                sx={{cursor: 'pointer', fontFamily: 'monospace'}}
              />
            ))}
          </Box>
        </Box>

        <RichHtmlEditor
          value={body}
          onChange={setBody}
          label={t('campaign.field.body')}
          minHeight={300}
        />

        {campaignResult?.item && (
          <CampaignAttachmentsBlock
            campaignId={campaignId}
            initialAttachments={campaignResult.item.attachments ?? []}
          />
        )}
      </Box>

      <Box sx={{mt: 2, minHeight: 24, display: 'flex', alignItems: 'center', gap: 1}}>
        {isSaving && (
          <>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              {t('campaign.wizard.step2.saving')}
            </Typography>
          </>
        )}
        {!isSaving && saved && (
          <Typography variant="caption" color="success.main">
            {t('campaign.wizard.step2.saved')}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button onClick={handleBack} disabled={isSaving}>
          {t('messages.btn.back')}
        </Button>
        <Button variant="contained" onClick={handleContinue} disabled={isSaving}>
          {t('campaign.wizard.btn.save_and_continue')}
        </Button>
      </Box>
    </Box>
  );
};

export default WizardStep2Content;
