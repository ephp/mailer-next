'use client';

import React, {ReactElement} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import GroupIcon from '@mui/icons-material/Group';
import {Campaign} from '@/types/models/Campaign';
import {MailList} from '@/types/models/MailList';
import {useTranslations} from 'next-intl';

const CampaignWizardStep1 = ({
  formData,
  mailLists,
  onChange,
}: {
  formData: Campaign;
  mailLists: MailList[];
  onChange: (data: Partial<Campaign>) => void;
}): ReactElement => {
  const t = useTranslations('campaign');

  const totalRecipients = mailLists
    .filter(ml => formData.mail_list_ids.includes(ml.id))
    .reduce((sum, ml) => sum + ml.contact_count, 0);

  const handleToggle = (listId: number) => {
    const current = formData.mail_list_ids;
    const next = current.includes(listId)
      ? current.filter(id => id !== listId)
      : [...current, listId];
    onChange({mail_list_ids: next});
  };

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
        {t('wizard.step1.description')}
      </Typography>

      {mailLists.length === 0 && (
        <Typography color="text.secondary">
          {t('wizard.step1.no_lists')}
        </Typography>
      )}

      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        {mailLists.map(mailList => {
          const selected = formData.mail_list_ids.includes(mailList.id);
          return (
            <Box
              key={mailList.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                border: '1px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: selected ? 'action.selected' : 'transparent',
                '&:hover': {borderColor: 'primary.light'},
              }}
              onClick={() => handleToggle(mailList.id)}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selected}
                    onChange={() => handleToggle(mailList.id)}
                    onClick={e => e.stopPropagation()}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">{mailList.name}</Typography>
                    {mailList.description && (
                      <Typography variant="body2" color="text.secondary">
                        {mailList.description}
                      </Typography>
                    )}
                  </Box>
                }
                sx={{flex: 1, m: 0}}
              />
              <Chip
                icon={<GroupIcon/>}
                label={mailList.contact_count}
                size="small"
                variant="outlined"
              />
            </Box>
          );
        })}
      </Box>

      {formData.mail_list_ids.length > 0 && (
        <Box sx={{mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1}}>
          <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
            {t('wizard.step1.recipient_count', {count: totalRecipients})}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CampaignWizardStep1;
