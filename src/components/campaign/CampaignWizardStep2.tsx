'use client';

import React, {ReactElement} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import {Campaign} from '@/types/models/Campaign';
import {useTranslations} from 'next-intl';

const PLACEHOLDERS = ['[[nome]]', '[[cognome]]', '[[email]]'];

const CampaignWizardStep2 = ({
  formData,
  subjectError,
  onChange,
}: {
  formData: Campaign;
  subjectError: string | null;
  onChange: (data: Partial<Campaign>) => void;
}): ReactElement => {
  const t = useTranslations('campaign');

  const insertPlaceholder = (placeholder: string) => {
    const bodyEl = document.querySelector<HTMLTextAreaElement>('textarea[name="body"]');
    const current = formData.body ?? '';
    if (bodyEl) {
      const start = bodyEl.selectionStart ?? current.length;
      const end = bodyEl.selectionEnd ?? current.length;
      onChange({body: current.slice(0, start) + placeholder + current.slice(end)});
    } else {
      onChange({body: current + placeholder});
    }
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
      <Typography variant="body1" color="text.secondary">
        {t('wizard.step2.description')}
      </Typography>

      <TextField
        name="name"
        fullWidth
        label={t('field.name')}
        value={formData.name ?? ''}
        onChange={e => onChange({name: e.target.value || null})}
        slotProps={{inputLabel: {shrink: true}}}
      />

      <TextField
        name="email_subject"
        fullWidth
        required
        label={t('field.email_subject')}
        value={formData.email_subject}
        onChange={e => onChange({email_subject: e.target.value})}
        error={!!subjectError}
        helperText={subjectError ?? undefined}
        slotProps={{inputLabel: {shrink: true}}}
      />

      <TextField
        name="snippet"
        fullWidth
        label={t('field.snippet')}
        value={formData.snippet ?? ''}
        onChange={e => onChange({snippet: e.target.value || null})}
        slotProps={{inputLabel: {shrink: true}}}
        helperText={t('field.snippet_helper')}
      />

      <Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 1}}>
          {t('wizard.step2.placeholders_label')}
        </Typography>
        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
          {PLACEHOLDERS.map(ph => (
            <Chip
              key={ph}
              label={ph}
              size="small"
              onClick={() => insertPlaceholder(ph)}
              sx={{cursor: 'pointer', fontFamily: 'monospace'}}
            />
          ))}
        </Box>
      </Box>

      <TextField
        name="body"
        fullWidth
        multiline
        rows={14}
        label={t('field.body')}
        value={formData.body ?? ''}
        onChange={e => onChange({body: e.target.value || null})}
        slotProps={{inputLabel: {shrink: true}}}
      />
    </Box>
  );
};

export default CampaignWizardStep2;
