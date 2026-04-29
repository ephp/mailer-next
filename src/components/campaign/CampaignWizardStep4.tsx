'use client';

import React, {ReactElement, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import SendIcon from '@mui/icons-material/Send';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import ArticleIcon from '@mui/icons-material/Article';
import GroupIcon from '@mui/icons-material/Group';
import SubjectIcon from '@mui/icons-material/Subject';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {Dayjs} from 'dayjs';
import {Campaign} from '@/types/models/Campaign';
import {useTranslations} from 'next-intl';

const CampaignWizardStep4 = ({
  formData,
  isSaving,
  onSaveDraft,
  onSendTest,
  onSchedule,
  onSendNow,
  onSaveAsTemplate,
}: {
  formData: Campaign;
  isSaving: boolean;
  onSaveDraft: () => void;
  onSendTest: (email: string) => void;
  onSchedule: (scheduledAt: string) => void;
  onSendNow: () => void;
  onSaveAsTemplate: () => void;
}): ReactElement => {
  const t = useTranslations('campaign');

  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(dayjs().add(1, 'hour'));

  const [sendNowOpen, setSendNowOpen] = useState(false);

  const handleTestEmailSubmit = () => {
    if (testEmail.trim()) {
      onSendTest(testEmail.trim());
      setTestEmailOpen(false);
    }
  };

  const handleScheduleSubmit = () => {
    if (scheduledAt) {
      onSchedule(scheduledAt.toISOString());
      setScheduleOpen(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <Typography variant="body1" color="text.secondary">
          {t('wizard.step4.description')}
        </Typography>

        {/* Campaign summary */}
        <Paper variant="outlined" sx={{p: 3}}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{mb: 2}}>
            {t('wizard.step4.summary_title')}
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
              <SubjectIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('field.email_subject')}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formData.email_subject || <em>—</em>}
                </Typography>
              </Box>
            </Box>
            {formData.name && (
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                <EmailIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('field.name')}
                  </Typography>
                  <Typography variant="body2">{formData.name}</Typography>
                </Box>
              </Box>
            )}
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
              <GroupIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('field.recipient_count')}
                </Typography>
                <Typography variant="body2">
                  {formData.recipient_count > 0 ? (
                    <Chip
                      label={formData.recipient_count}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : '—'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Divider />

        {/* Action buttons */}
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <Typography variant="subtitle1" fontWeight="bold">
            {t('wizard.step4.actions_title')}
          </Typography>

          {/* Test email */}
          <Paper variant="outlined" sx={{p: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1}}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {t('wizard.step4.test_email_title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('wizard.step4.test_email_desc')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => setTestEmailOpen(true)}
              >
                {t('btn.send_test')}
              </Button>
            </Box>
          </Paper>

          {/* Save draft */}
          <Paper variant="outlined" sx={{p: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1}}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {t('wizard.step4.draft_title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('wizard.step4.draft_desc')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={onSaveDraft}
                disabled={isSaving}
              >
                {t('btn.save_draft')}
              </Button>
            </Box>
          </Paper>

          {/* Schedule */}
          <Paper variant="outlined" sx={{p: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1}}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {t('wizard.step4.schedule_title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('wizard.step4.schedule_desc')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ScheduleSendIcon />}
                onClick={() => setScheduleOpen(true)}
              >
                {t('btn.schedule')}
              </Button>
            </Box>
          </Paper>

          {/* Save as template */}
          <Paper variant="outlined" sx={{p: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1}}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {t('wizard.step4.template_title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('wizard.step4.template_desc')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ArticleIcon />}
                onClick={onSaveAsTemplate}
                disabled={isSaving}
              >
                {t('btn.save_as_template')}
              </Button>
            </Box>
          </Paper>

          {/* Send now */}
          <Paper variant="outlined" sx={{p: 2, borderColor: 'primary.main'}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1}}>
              <Box>
                <Typography variant="body1" fontWeight="medium" color="primary.main">
                  {t('wizard.step4.send_now_title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('wizard.step4.send_now_desc')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setSendNowOpen(true)}
                disabled={isSaving || formData.recipient_count === 0}
              >
                {t('btn.send_now')}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Test email dialog */}
      <Dialog open={testEmailOpen} onClose={() => setTestEmailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('wizard.step4.test_email_dialog_title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="email"
            label={t('wizard.step4.test_email_field')}
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            sx={{mt: 1}}
            onKeyDown={e => { if (e.key === 'Enter') handleTestEmailSubmit(); }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailOpen(false)}>{t('btn.cancel')}</Button>
          <Button variant="contained" onClick={handleTestEmailSubmit} disabled={!testEmail.trim()}>
            {t('btn.send_test')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule dialog */}
      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('wizard.step4.schedule_dialog_title')}</DialogTitle>
        <DialogContent sx={{pt: 2}}>
          <DateTimePicker
            label={t('wizard.step4.schedule_date_field')}
            value={scheduledAt}
            onChange={val => setScheduledAt(val)}
            disablePast
            sx={{mt: 1, width: '100%'}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleOpen(false)}>{t('btn.cancel')}</Button>
          <Button variant="contained" color="secondary" onClick={handleScheduleSubmit} disabled={!scheduledAt}>
            {t('btn.schedule')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send now confirmation dialog */}
      <Dialog open={sendNowOpen} onClose={() => setSendNowOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('wizard.step4.send_now_dialog_title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('wizard.step4.send_now_dialog_desc', {count: formData.recipient_count})}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendNowOpen(false)}>{t('btn.cancel')}</Button>
          <Button
            variant="contained"
            onClick={() => { setSendNowOpen(false); onSendNow(); }}
          >
            {t('btn.send_now')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CampaignWizardStep4;
