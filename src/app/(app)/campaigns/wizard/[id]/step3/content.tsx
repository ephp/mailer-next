'use client';

import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {useParams, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {useSnackbar} from 'notistack';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {
  getCampaign,
  getCampaignPreview,
  getTemplatePresets,
  updateCampaign,
} from '@/shared/helpers/api/campaignApiHelper';
import {CAMPAIGN_CRUD_LIST, WIZARD_STEP_2, WIZARD_STEP_4} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import EmailPreview from '@/components/campaign/EmailPreview';
import {defaultCampaignStructure} from '@/types/models/Campaign';
import {EmailTemplatePreset} from '@/types/models/EmailTemplate';

const AUTOSAVE_DELAY_MS = 800;

const WizardStep3Content = (): ReactElement | null => {
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();
  const campaignId = parseInt(idParam, 10);
  const {enqueueSnackbar} = useSnackbar();
  const t = useTranslations();

  const [templateId, setTemplateId] = useState<string>(
    defaultCampaignStructure.template_id ?? 'newsletter',
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    defaultCampaignStructure.primary_color ?? '#1976d2',
  );
  const [textColor, setTextColor] = useState<string>(
    defaultCampaignStructure.text_color ?? '#333333',
  );
  const [presets, setPresets] = useState<EmailTemplatePreset[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
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
    getTemplatePresets()
      .then(result => {
        if (result.item) setPresets(result.item);
      })
      .catch(() => {});
  }, [fetchCampaign, campaignId, enqueueSnackbar, router, t]);

  useEffect(() => {
    const campaign = campaignResult?.item;
    if (campaign && !initialized) {
      const s = campaign.structure ?? defaultCampaignStructure;
      setTemplateId(s.template_id ?? 'newsletter');
      setPrimaryColor(s.primary_color ?? '#1976d2');
      setTextColor(s.text_color ?? '#333333');
      setInitialized(true);
    }
  }, [campaignResult, initialized]);

  const fetchPreview = useCallback(async (): Promise<void> => {
    setPreviewLoading(true);
    try {
      const result = await getCampaignPreview(campaignId);
      setPreviewHtml(result.item?.html ?? '');
    } catch {
      // fail silently — preview is non-critical
    } finally {
      setPreviewLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (!initialized) return;
    fetchPreview().catch(() => {});
  }, [initialized, fetchPreview]);

  const doSave = useCallback(
    async (tid: string, pc: string, tc: string): Promise<void> => {
      setIsSaving(true);
      setSaved(false);
      try {
        await updateCampaign(campaignId, {
          structure: {template_id: tid, primary_color: pc, text_color: tc},
        });
        setSaved(true);
      } catch {
        enqueueSnackbar(t('campaign.wizard.step3.save_error'), {variant: 'error'});
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
      doSave(templateId, primaryColor, textColor)
        .then(() => fetchPreview())
        .catch(console.error);
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [templateId, primaryColor, textColor, initialized, doSave, fetchPreview]);

  const handleBack = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push(generatePathStorage(WIZARD_STEP_2, {id: idParam}));
  };

  const handleContinue = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await doSave(templateId, primaryColor, textColor);
    router.push(generatePathStorage(WIZARD_STEP_4, {id: idParam}));
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
      <Stepper activeStep={2} sx={{mb: 4}}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
        {t('campaign.wizard.step3.description')}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 5}}>
          <Typography variant="subtitle1" fontWeight={600} sx={{mb: 2}}>
            {t('campaign.wizard.step3.template_label')}
          </Typography>

          <Grid container spacing={2}>
            {presets.map(preset => (
              <Grid size={{xs: 6}} key={preset.id}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    border: templateId === preset.id ? '2px solid' : '1px solid',
                    borderColor: templateId === preset.id ? 'primary.main' : 'divider',
                  }}
                >
                  <CardActionArea onClick={() => setTemplateId(preset.id)}>
                    <Box
                      sx={{
                        position: 'relative',
                        bgcolor: 'grey.100',
                        height: 80,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={preset.thumbnail_url}
                        alt={preset.name}
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {templateId === preset.id && (
                        <CheckCircleIcon
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'white',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{py: 1, px: 1.5}}>
                      <Typography variant="caption" fontWeight={600} display="block">
                        {preset.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {preset.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle1" fontWeight={600} sx={{mt: 3, mb: 2}}>
            {t('campaign.wizard.step3.colors_label')}
          </Typography>

          <Box sx={{display: 'flex', gap: 3, flexWrap: 'wrap'}}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 0.5}}>
                {t('campaign.wizard.step3.color_primary')}
              </Typography>
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                style={{width: 48, height: 40, cursor: 'pointer', border: 'none', padding: 0}}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 0.5}}>
                {t('campaign.wizard.step3.color_text')}
              </Typography>
              <input
                type="color"
                value={textColor}
                onChange={e => setTextColor(e.target.value)}
                style={{width: 48, height: 40, cursor: 'pointer', border: 'none', padding: 0}}
              />
            </Box>
          </Box>
        </Grid>

        <Grid size={{xs: 12, md: 7}}>
          <Typography variant="subtitle1" fontWeight={600} sx={{mb: 2}}>
            {t('campaign.wizard.step3.preview_label')}
          </Typography>
          <EmailPreview html={previewHtml} loading={previewLoading} />
        </Grid>
      </Grid>

      <Box sx={{mt: 2, minHeight: 24, display: 'flex', alignItems: 'center', gap: 1}}>
        {isSaving && (
          <>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              {t('campaign.wizard.step3.saving')}
            </Typography>
          </>
        )}
        {!isSaving && saved && (
          <Typography variant="caption" color="success.main">
            {t('campaign.wizard.step3.saved')}
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

export default WizardStep3Content;
