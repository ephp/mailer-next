'use client';

import React, {ReactElement, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import InsightsIcon from '@mui/icons-material/Insights';
import {useParams, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {useSnackbar} from 'notistack';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {
  getCampaign,
  getRecipientsCount,
  getTemplatePresets,
  saveAsTemplate,
  scheduleCampaign,
  sendCampaign,
  sendTestEmail,
} from '@/shared/helpers/api/campaignApiHelper';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/it';
import dayjs, {Dayjs} from 'dayjs';
import EventIcon from '@mui/icons-material/Event';
import {CAMPAIGN_CRUD_LIST, CAMPAIGN_STATS, CAMPAIGN_TEMPLATES, WIZARD_STEP_3} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {EmailTemplatePreset} from '@/types/models/EmailTemplate';
import SendingProgressModal from '@/components/campaign/SendingProgressModal';

const WizardStep4Content = (): ReactElement | null => {
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();
  const campaignId = parseInt(idParam, 10);
  const {enqueueSnackbar} = useSnackbar();
  const t = useTranslations();

  const [presets, setPresets] = useState<EmailTemplatePreset[]>([]);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [testEmails, setTestEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogName, setDialogName] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

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
    if (!campaign) return;
    const mailListIds = campaign.mail_list_ids ?? [];
    getRecipientsCount(mailListIds, campaign.filter ?? undefined)
      .then(count => setRecipientCount(count))
      .catch(() => setRecipientCount(0));
    // Reflect persisted scheduling state on the button label.
    if (campaign.status === 'scheduled' && campaign.scheduled_at) {
      setScheduledAtIso(campaign.scheduled_at);
    }
  }, [campaignResult]);

  const campaign = campaignResult?.item;

  const presetLabel = (() => {
    const templateId = campaign?.structure?.template_id ?? 'newsletter';
    return presets.find(p => p.id === templateId)?.name ?? templateId;
  })();

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      enqueueSnackbar(t('campaign.wizard.step4.invalid_email_error'), {variant: 'warning'});
      return;
    }
    if (testEmails.length >= 5) {
      enqueueSnackbar(t('campaign.wizard.step4.max_emails_error'), {variant: 'warning'});
      return;
    }
    if (!testEmails.includes(email)) {
      setTestEmails(prev => [...prev, email]);
    }
    setEmailInput('');
  };

  const handleRemoveEmail = (email: string) => {
    setTestEmails(prev => prev.filter(e => e !== email));
  };

  const handleSendTest = async () => {
    if (testEmails.length === 0) return;
    setIsSendingTest(true);
    try {
      const result = await sendTestEmail(campaignId, testEmails);
      const item = result.item;
      if (item) {
        enqueueSnackbar(
          t('campaign.wizard.step4.test_result', {sent: item.sent, failed: item.failed}),
          {variant: item.failed > 0 ? 'warning' : 'success'},
        );
      }
    } catch {
      enqueueSnackbar(t('messages.common.error.unknown'), {variant: 'error'});
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogName(campaign?.name ?? '');
    setDialogDescription(campaign?.snippet ?? '');
    setDialogOpen(true);
  };

  const handleSaveAsTemplate = async () => {
    if (!dialogName.trim()) return;
    setIsSavingTemplate(true);
    try {
      await saveAsTemplate(campaignId, {
        name: dialogName.trim(),
        description: dialogDescription.trim() || undefined,
      });
      setDialogOpen(false);
      enqueueSnackbar(t('campaign.success.saved_as_template'), {variant: 'success'});
      router.push(CAMPAIGN_TEMPLATES);
    } catch {
      enqueueSnackbar(t('messages.common.error.unknown'), {variant: 'error'});
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingStarted, setSendingStarted] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState<Dayjs | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [scheduledAtIso, setScheduledAtIso] = useState<string | null>(null);

  const handleConfirmSchedule = async () => {
    if (!scheduleAt) return;
    if (!scheduleAt.isAfter(dayjs())) {
      enqueueSnackbar(t('campaign.error.scheduled_past'), {variant: 'error'});
      return;
    }
    setScheduling(true);
    try {
      const iso = scheduleAt.toISOString();
      await scheduleCampaign(campaignId, iso);
      setScheduledAtIso(iso);
      setScheduleOpen(false);
      enqueueSnackbar(t('campaign.wizard.step4.scheduled_ok'), {variant: 'success'});
    } catch (e) {
      const err = e as {message?: {message?: string}; error?: {message?: string}};
      const msg = err?.message?.message ?? err?.error?.message ?? t('messages.common.error.unknown');
      enqueueSnackbar(msg, {variant: 'error'});
    } finally {
      setScheduling(false);
    }
  };

  const handleConfirmSend = async () => {
    setSending(true);
    try {
      await sendCampaign(campaignId);
      setConfirmSendOpen(false);
      setSendingStarted(true);
      setProgressOpen(true);
    } catch (e) {
      const err = e as {message?: {message?: string}; error?: {message?: string}};
      const msg = err?.message?.message ?? err?.error?.message ?? t('messages.common.error.unknown');
      enqueueSnackbar(msg, {variant: 'error'});
    } finally {
      setSending(false);
    }
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
      <Stepper activeStep={3} sx={{mb: 4}}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
        {t('campaign.wizard.step4.description')}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 6}}>
          <Typography variant="subtitle1" fontWeight={600} sx={{mb: 2}}>
            {t('campaign.wizard.step4.summary_title')}
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('campaign.wizard.step4.summary_subject')}
              </Typography>
              <Typography variant="body2">{campaign?.email_subject ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('campaign.wizard.step4.summary_template')}
              </Typography>
              <Typography variant="body2">{presetLabel}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('campaign.wizard.step4.summary_lists')}
              </Typography>
              <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5}}>
                {campaign?.mail_lists?.length ? (
                  campaign.mail_lists.map(ml => (
                    <Chip key={ml.id} label={ml.name} size="small" />
                  ))
                ) : (
                  <Typography variant="body2">—</Typography>
                )}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('campaign.wizard.step4.summary_recipients')}
              </Typography>
              <Typography variant="body2">
                {recipientCount === null ? '...' : recipientCount}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Typography variant="subtitle1" fontWeight={600} sx={{mb: 1}}>
            {t('campaign.wizard.step4.test_email_title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
            {t('campaign.wizard.step4.test_email_desc')}
          </Typography>

          <Box sx={{display: 'flex', gap: 1, mb: 1.5}}>
            <TextField
              size="small"
              fullWidth
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder={t('campaign.wizard.step4.email_input_placeholder')}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEmail();
                }
              }}
              disabled={testEmails.length >= 5}
            />
            <Button
              variant="outlined"
              onClick={handleAddEmail}
              disabled={testEmails.length >= 5 || !emailInput.trim()}
              sx={{whiteSpace: 'nowrap'}}
            >
              {t('campaign.wizard.step4.add_email')}
            </Button>
          </Box>

          {testEmails.length > 0 && (
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5}}>
              {testEmails.map(email => (
                <Chip
                  key={email}
                  label={email}
                  size="small"
                  onDelete={() => handleRemoveEmail(email)}
                />
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={isSendingTest ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            onClick={handleSendTest}
            disabled={testEmails.length === 0 || isSendingTest}
          >
            {t('campaign.wizard.step4.send_test_btn')}
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{my: 3}} />

      <Typography variant="subtitle1" fontWeight={600} sx={{mb: 2}}>
        {t('campaign.wizard.step4.actions_title')}
      </Typography>

      <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
        <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => router.push(CAMPAIGN_CRUD_LIST)}>
          {t('campaign.wizard.step4.draft_title')}
        </Button>
        <Button variant="outlined" startIcon={<BookmarkIcon />} onClick={handleOpenDialog}>
          {t('campaign.wizard.step4.template_title')}
        </Button>
        {!sendingStarted && (
          <>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EventIcon />}
              onClick={() => {
                setScheduleAt(scheduledAtIso ? dayjs(scheduledAtIso) : dayjs().add(1, 'hour'));
                setScheduleOpen(true);
              }}
            >
              {scheduledAtIso
                ? t('campaign.wizard.step4.scheduled_for', {when: dayjs(scheduledAtIso).format('DD/MM/YYYY HH:mm')})
                : t('campaign.wizard.step4.schedule_title')}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<SendIcon />}
              onClick={() => setConfirmSendOpen(true)}
            >
              {t('campaign.wizard.step4.send_now_title')}
            </Button>
          </>
        )}
        {sendingStarted && (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<InsightsIcon />}
              onClick={() => router.push(generatePathStorage(CAMPAIGN_STATS, {id: idParam}))}
            >
              {t('campaign.wizard.step4.view_stats')}
            </Button>
            <Button variant="outlined" color="info" onClick={() => setProgressOpen(true)}>
              {t('campaign.wizard.step4.show_progress')}
            </Button>
          </>
        )}
      </Stack>

      <Box
        sx={{
          display: 'flex',
          mt: 4,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button onClick={() => router.push(generatePathStorage(WIZARD_STEP_3, {id: idParam}))}>
          {t('messages.btn.back')}
        </Button>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('campaign.wizard.step4.template_title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('campaign.wizard.step4.template_dialog_name')}
            fullWidth
            value={dialogName}
            onChange={e => setDialogName(e.target.value)}
            required
            sx={{mt: 1}}
          />
          <TextField
            margin="dense"
            label={t('campaign.wizard.step4.template_dialog_description')}
            fullWidth
            multiline
            rows={2}
            value={dialogDescription}
            onChange={e => setDialogDescription(e.target.value)}
            sx={{mt: 1}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isSavingTemplate}>
            {t('messages.btn.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAsTemplate}
            disabled={!dialogName.trim() || isSavingTemplate}
          >
            {isSavingTemplate ? <CircularProgress size={20} color="inherit" /> : t('messages.btn.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmSendOpen}
        onClose={() => !sending && setConfirmSendOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('campaign.wizard.step4.send_now_dialog_title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('campaign.wizard.step4.send_now_dialog_desc', {count: recipientCount ?? 0})}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSendOpen(false)} disabled={sending}>
            {t('messages.btn.cancel')}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            onClick={handleConfirmSend}
            disabled={sending}
          >
            {t('campaign.wizard.step4.send_now_title')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={scheduleOpen}
        onClose={() => !scheduling && setScheduleOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('campaign.wizard.step4.schedule_title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{mb: 2}} color="text.secondary">
            {t('campaign.wizard.step4.schedule_desc')}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
            <DateTimePicker
              value={scheduleAt}
              onChange={setScheduleAt}
              minDateTime={dayjs()}
              ampm={false}
              format="DD/MM/YYYY HH:mm"
              sx={{width: '100%'}}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          {scheduledAtIso && (
            <Button
              color="warning"
              onClick={async () => {
                setScheduling(true);
                try {
                  await scheduleCampaign(campaignId, null);
                  setScheduledAtIso(null);
                  setScheduleAt(null);
                  setScheduleOpen(false);
                  enqueueSnackbar(t('campaign.wizard.step4.unscheduled_ok'), {variant: 'info'});
                } catch (e) {
                  const err = e as {message?: {message?: string}; error?: {message?: string}};
                  enqueueSnackbar(err?.message?.message ?? err?.error?.message ?? '', {variant: 'error'});
                } finally {
                  setScheduling(false);
                }
              }}
              disabled={scheduling}
            >
              {t('campaign.wizard.step4.unschedule')}
            </Button>
          )}
          <Button onClick={() => setScheduleOpen(false)} disabled={scheduling}>
            {t('messages.btn.cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={scheduling ? <CircularProgress size={16} color="inherit" /> : <EventIcon />}
            onClick={handleConfirmSchedule}
            disabled={scheduling || !scheduleAt}
          >
            {t('campaign.wizard.step4.schedule_confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <SendingProgressModal
        campaignId={campaignId}
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
      />
    </Box>
  );
};

export default WizardStep4Content;
