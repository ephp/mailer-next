'use client';

import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import CampaignIcon from '@mui/icons-material/Campaign';
import BusinessIcon from '@mui/icons-material/Business';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import type {SvgIconComponent} from '@mui/icons-material';
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
import {getMailList} from '@/shared/helpers/api/mailListApiHelper';
import {CAMPAIGN_CRUD_LIST, WIZARD_STEP_2, WIZARD_STEP_4} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import EmailPreview from '@/components/campaign/EmailPreview';
import GoogleFontAutocomplete from '@/components/common/GoogleFontAutocomplete';
import {defaultCampaignStructure} from '@/types/models/Campaign';
import {EmailTemplatePreset} from '@/types/models/EmailTemplate';

const AUTOSAVE_DELAY_MS = 800;

const PRESET_ICONS: Record<string, SvgIconComponent> = {
  newsletter: NewspaperIcon,
  promo: CampaignIcon,
  institutional: BusinessIcon,
  plaintext: TextFieldsIcon,
};

interface ListDefaults {
  primaryColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
}

const SYSTEM_DEFAULTS: ListDefaults = {
  primaryColor: '#1976d2',
  textColor: '#333333',
  headingFont: 'Roboto',
  bodyFont: 'Inter',
};

const WizardStep3Content = (): ReactElement | null => {
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();
  const campaignId = parseInt(idParam, 10);
  const {enqueueSnackbar} = useSnackbar();
  const t = useTranslations();

  const [templateId, setTemplateId] = useState<string>(
    defaultCampaignStructure.template_id ?? 'newsletter',
  );
  const [globalStyle, setGlobalStyle] = useState<boolean>(false);
  const [stylePerList, setStylePerList] = useState<boolean>(false);
  const [primaryColor, setPrimaryColor] = useState<string>(SYSTEM_DEFAULTS.primaryColor);
  const [textColor, setTextColor] = useState<string>(SYSTEM_DEFAULTS.textColor);
  const [headingFont, setHeadingFont] = useState<string>(SYSTEM_DEFAULTS.headingFont);
  const [bodyFont, setBodyFont] = useState<string>(SYSTEM_DEFAULTS.bodyFont);

  const [presets, setPresets] = useState<EmailTemplatePreset[]>([]);
  const [firstListDefaults, setFirstListDefaults] = useState<ListDefaults | null>(null);
  const [mailListCount, setMailListCount] = useState(0);
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

  // Initialize state from campaign + load defaults of the first associated mail list.
  useEffect(() => {
    const campaign = campaignResult?.item;
    if (!campaign || initialized) return;

    const s = campaign.structure ?? {};
    setTemplateId(s.template_id ?? 'newsletter');
    setGlobalStyle(s.global_style ?? false);
    setStylePerList(s.style_per_list ?? false);
    setPrimaryColor(s.primary_color ?? SYSTEM_DEFAULTS.primaryColor);
    setTextColor(s.text_color ?? SYSTEM_DEFAULTS.textColor);
    setHeadingFont(s.heading_font ?? SYSTEM_DEFAULTS.headingFont);
    setBodyFont(s.body_font ?? SYSTEM_DEFAULTS.bodyFont);

    const listIds = campaign.mail_list_ids ?? [];
    setMailListCount(listIds.length);

    if (listIds.length > 0) {
      getMailList({id: listIds[0]})
        .then(res => {
          const ml = res.item;
          if (!ml) return;
          setFirstListDefaults({
            primaryColor: ml.default_primary_color ?? SYSTEM_DEFAULTS.primaryColor,
            textColor: ml.default_text_color ?? SYSTEM_DEFAULTS.textColor,
            headingFont: ml.default_heading_font ?? SYSTEM_DEFAULTS.headingFont,
            bodyFont: ml.default_body_font ?? SYSTEM_DEFAULTS.bodyFont,
          });
        })
        .catch(() => setFirstListDefaults(null));
    }

    setInitialized(true);
  }, [campaignResult, initialized]);

  const fetchPreview = useCallback(async (): Promise<void> => {
    setPreviewLoading(true);
    try {
      const result = await getCampaignPreview(campaignId);
      setPreviewHtml(result.item?.html ?? '');
    } catch {
      // Non-critical
    } finally {
      setPreviewLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (!initialized) return;
    fetchPreview().catch(() => {});
  }, [initialized, fetchPreview]);

  const doSave = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    setSaved(false);
    try {
      await updateCampaign(campaignId, {
        structure: {
          template_id: templateId,
          global_style: globalStyle,
          style_per_list: stylePerList,
          primary_color: primaryColor,
          text_color: textColor,
          heading_font: headingFont,
          body_font: bodyFont,
        },
      });
      setSaved(true);
    } catch {
      enqueueSnackbar(t('campaign.wizard.step3.save_error'), {variant: 'error'});
    } finally {
      setIsSaving(false);
    }
  }, [
    campaignId, templateId, globalStyle, stylePerList,
    primaryColor, textColor, headingFont, bodyFont,
    enqueueSnackbar, t,
  ]);

  // Autosave (debounced) on any structure change.
  useEffect(() => {
    if (!initialized) return;
    if (skipFirstSaveRef.current) {
      skipFirstSaveRef.current = false;
      return;
    }
    setSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSave().then(() => fetchPreview()).catch(console.error);
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    templateId, globalStyle, stylePerList,
    primaryColor, textColor, headingFont, bodyFont,
    initialized, doSave, fetchPreview,
  ]);

  // When the user turns ON global customization for the first time,
  // pre-fill the editable values with the first list's defaults (or system).
  const handleToggleGlobal = (next: boolean): void => {
    if (next && firstListDefaults) {
      // Only override if state is still untouched / matches system defaults
      if (primaryColor === SYSTEM_DEFAULTS.primaryColor) setPrimaryColor(firstListDefaults.primaryColor);
      if (textColor === SYSTEM_DEFAULTS.textColor) setTextColor(firstListDefaults.textColor);
      if (headingFont === SYSTEM_DEFAULTS.headingFont) setHeadingFont(firstListDefaults.headingFont);
      if (bodyFont === SYSTEM_DEFAULTS.bodyFont) setBodyFont(firstListDefaults.bodyFont);
    }
    setGlobalStyle(next);
  };

  const handleBack = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push(generatePathStorage(WIZARD_STEP_2, {id: idParam}));
  };

  const handleContinue = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await doSave();
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
                        bgcolor: templateId === preset.id ? 'primary.50' : 'grey.100',
                        height: 80,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {React.createElement(PRESET_ICONS[preset.id] ?? NewspaperIcon, {
                        sx: {
                          fontSize: 40,
                          color: templateId === preset.id ? 'primary.main' : 'grey.500',
                        },
                      })}
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

          <Box sx={{mt: 4}}>
            <FormControlLabel
              control={
                <Switch
                  checked={globalStyle}
                  onChange={(e) => handleToggleGlobal(e.target.checked)}
                />
              }
              label={t('campaign.wizard.step3.global_style')}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              {t('campaign.wizard.step3.global_style_help')}
            </Typography>
          </Box>

          {!globalStyle && mailListCount === 0 && (
            <Alert severity="info" sx={{mt: 2}}>
              {t('campaign.wizard.step3.no_lists_selected')}
            </Alert>
          )}

          {!globalStyle && mailListCount === 1 && (
            <Alert severity="info" sx={{mt: 2}}>
              {t('campaign.wizard.step3.using_single_list_defaults')}
            </Alert>
          )}

          {!globalStyle && mailListCount >= 2 && (
            <Box sx={{mt: 2}}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 1}}>
                {t('campaign.wizard.step3.multi_list_strategy')}
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={stylePerList ? 'per_list' : 'first_list'}
                onChange={(_, v) => {
                  if (v !== null) setStylePerList(v === 'per_list');
                }}
              >
                <ToggleButton value="first_list" sx={{textTransform: 'none'}}>
                  {t('campaign.wizard.step3.use_first_list')}
                </ToggleButton>
                <ToggleButton value="per_list" sx={{textTransform: 'none'}}>
                  {t('campaign.wizard.step3.use_per_list')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          {globalStyle && (
            <Box sx={{mt: 3}}>
              <Typography variant="subtitle2" fontWeight={600} sx={{mb: 2}}>
                {t('campaign.wizard.step3.colors_label')}
              </Typography>

              <Box sx={{display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3}}>
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

              <Typography variant="subtitle2" fontWeight={600} sx={{mb: 2}}>
                {t('campaign.wizard.step3.fonts_label')}
              </Typography>

              <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <GoogleFontAutocomplete
                  value={headingFont}
                  onChange={(v) => setHeadingFont(v ?? SYSTEM_DEFAULTS.headingFont)}
                  label={t('campaign.wizard.step3.heading_font')}
                />
                <GoogleFontAutocomplete
                  value={bodyFont}
                  onChange={(v) => setBodyFont(v ?? SYSTEM_DEFAULTS.bodyFont)}
                  label={t('campaign.wizard.step3.body_font')}
                />
              </Box>
            </Box>
          )}
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
