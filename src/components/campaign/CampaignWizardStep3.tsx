'use client';

import React, {ReactElement, useState, useCallback} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import {Campaign, CampaignStructure, defaultCampaignStructure} from '@/types/models/Campaign';
import {useTranslations} from 'next-intl';

const TEMPLATES = [
  {
    id: 'classic',
    label: 'campaign.wizard.step3.template_classic',
    description: 'campaign.wizard.step3.template_classic_desc',
  },
];

function buildPreviewHtml(formData: Campaign, structure: CampaignStructure): string {
  const {colors, logo_url} = structure;
  const body = formData.body ?? '';
  const subject = formData.email_subject || '(oggetto)';
  const logoHtml = logo_url
    ? `<img src="${logo_url}" alt="Logo" style="max-height:60px;max-width:200px;" />`
    : `<span style="font-size:22px;font-weight:bold;color:${colors.primary};">LOGO</span>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{margin:0;padding:0;background:${colors.background};font-family:Arial,sans-serif;color:${colors.text};}
  .wrapper{max-width:600px;margin:0 auto;background:#ffffff;}
  .header{background:${colors.primary};padding:20px 30px;text-align:center;}
  .content{padding:30px;}
  .content h1{color:${colors.primary};font-size:20px;margin:0 0 16px;}
  .content p{line-height:1.6;white-space:pre-wrap;}
  .footer{background:#f0f0f0;padding:16px 30px;text-align:center;font-size:12px;color:#888;}
  .footer a{color:${colors.primary};}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">${logoHtml}</div>
  <div class="content">
    <h1>${subject}</h1>
    <p>${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
  </div>
  <div class="footer">
    &copy; 2026 &mdash; <a href="#">Cancella iscrizione</a>
  </div>
</div>
</body>
</html>`;
}

const CampaignWizardStep3 = ({
  formData,
  onChange,
}: {
  formData: Campaign;
  onChange: (data: Partial<Campaign>) => void;
}): ReactElement => {
  const t = useTranslations('campaign');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const structure: CampaignStructure = formData.structure ?? defaultCampaignStructure;

  const updateStructure = useCallback((patch: Partial<CampaignStructure>) => {
    onChange({structure: {...structure, ...patch}});
  }, [onChange, structure]);

  const updateColors = useCallback((colorPatch: Partial<CampaignStructure['colors']>) => {
    updateStructure({colors: {...structure.colors, ...colorPatch}});
  }, [updateStructure, structure.colors]);

  const previewHtml = buildPreviewHtml(formData, structure);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <Typography variant="body1" color="text.secondary">
        {t('wizard.step3.description')}
      </Typography>

      {/* Template selection */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{mb: 2}}>
          {t('wizard.step3.template_label')}
        </Typography>
        <Grid container spacing={2}>
          {TEMPLATES.map(tpl => {
            const selected = structure.template_id === tpl.id;
            return (
              <Grid key={tpl.id} size={{xs: 12, sm: 6, md: 4}}>
                <Card
                  variant="outlined"
                  sx={{
                    borderColor: selected ? 'primary.main' : 'divider',
                    borderWidth: selected ? 2 : 1,
                  }}
                >
                  <CardActionArea onClick={() => updateStructure({template_id: tpl.id})}>
                    <CardContent sx={{position: 'relative'}}>
                      {selected && (
                        <CheckCircleIcon
                          color="primary"
                          sx={{position: 'absolute', top: 8, right: 8}}
                        />
                      )}
                      {/* Thumbnail */}
                      <Box
                        sx={{
                          height: 100,
                          bgcolor: structure.colors.background,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1.5,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box sx={{bgcolor: structure.colors.primary, height: 24}} />
                        <Box sx={{p: 1, flex: 1}}>
                          <Box sx={{height: 8, bgcolor: 'grey.300', borderRadius: 1, mb: 0.5, width: '70%'}} />
                          <Box sx={{height: 6, bgcolor: 'grey.200', borderRadius: 1, mb: 0.5}} />
                          <Box sx={{height: 6, bgcolor: 'grey.200', borderRadius: 1, width: '85%'}} />
                        </Box>
                        <Box sx={{bgcolor: 'grey.200', height: 16}} />
                      </Box>
                      <Typography variant="body2" fontWeight={selected ? 'bold' : 'normal'}>
                        {t(tpl.label)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(tpl.description)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Color customization */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{mb: 2}}>
          {t('wizard.step3.colors_label')}
        </Typography>
        <Box sx={{display: 'flex', gap: 3, flexWrap: 'wrap'}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
            <input
              type="color"
              value={structure.colors.primary}
              onChange={e => updateColors({primary: e.target.value})}
              style={{width: 40, height: 40, padding: 2, cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4}}
            />
            <Typography variant="body2">{t('wizard.step3.color_primary')}</Typography>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
            <input
              type="color"
              value={structure.colors.text}
              onChange={e => updateColors({text: e.target.value})}
              style={{width: 40, height: 40, padding: 2, cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4}}
            />
            <Typography variant="body2">{t('wizard.step3.color_text')}</Typography>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
            <input
              type="color"
              value={structure.colors.background}
              onChange={e => updateColors({background: e.target.value})}
              style={{width: 40, height: 40, padding: 2, cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4}}
            />
            <Typography variant="body2">{t('wizard.step3.color_background')}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Logo URL */}
      <TextField
        fullWidth
        label={t('wizard.step3.logo_url')}
        value={structure.logo_url ?? ''}
        onChange={e => updateStructure({logo_url: e.target.value || null})}
        slotProps={{inputLabel: {shrink: true}}}
        helperText={t('wizard.step3.logo_url_helper')}
      />

      {/* Preview */}
      <Box>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('wizard.step3.preview_label')}
          </Typography>
          <ToggleButtonGroup
            value={previewMode}
            exclusive
            onChange={(_, val) => { if (val) setPreviewMode(val); }}
            size="small"
          >
            <ToggleButton value="desktop">
              <DesktopWindowsIcon fontSize="small" sx={{mr: 0.5}} />
              {t('wizard.step3.preview_desktop')}
            </ToggleButton>
            <ToggleButton value="mobile">
              <PhoneAndroidIcon fontSize="small" sx={{mr: 0.5}} />
              {t('wizard.step3.preview_mobile')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            bgcolor: '#e0e0e0',
            p: 2,
          }}
        >
          <iframe
            srcDoc={previewHtml}
            title="Email preview"
            style={{
              width: previewMode === 'desktop' ? '100%' : 375,
              maxWidth: previewMode === 'desktop' ? 700 : 375,
              height: 420,
              border: 'none',
              background: '#fff',
              borderRadius: 4,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CampaignWizardStep3;
