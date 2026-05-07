'use client';

import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import {useParams, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {useSnackbar} from 'notistack';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {getCampaign, updateCampaign} from '@/shared/helpers/api/campaignApiHelper';
import {getMailLists} from '@/shared/helpers/api/mailListApiHelper';
import {CAMPAIGN_CRUD_LIST, WIZARD_STEP_2} from '@/shared/constants/AppRoutes';
import {CampaignFilter} from '@/types/models/Campaign';
import {MailList} from '@/types/models/MailList';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';

const AUTOSAVE_DELAY_MS = 800;

const WizardStep1Content = (): ReactElement | null => {
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();
  const campaignId = parseInt(idParam, 10);
  const {enqueueSnackbar} = useSnackbar();
  const t = useTranslations();

  const [mailListIds, setMailListIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<CampaignFilter | null>(null);
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

  const {
    result: mailListsResult,
    loading: listsLoading,
    perform: fetchLists,
  } = useAsyncLoader(getMailLists, true);

  useEffect(() => {
    fetchCampaign(campaignId).catch(() => {
      enqueueSnackbar(t('campaign.error.not_found'), {variant: 'error'});
      router.push(CAMPAIGN_CRUD_LIST);
    });
    fetchLists({
      page: 1,
      perPage: 100,
      sortBy: 'name' as keyof MailList,
      sortDirection: 'asc',
      filters: {},
    }).catch(console.error);
  }, [fetchCampaign, fetchLists, campaignId, enqueueSnackbar, router, t]);

  useEffect(() => {
    const campaign = campaignResult?.item;
    if (campaign && !initialized) {
      setMailListIds(campaign.mail_list_ids ?? []);
      setFilter(campaign.filter ?? null);
      setInitialized(true);
    }
  }, [campaignResult, initialized]);

  const doSave = useCallback(
    async (ids: number[], f: CampaignFilter | null): Promise<void> => {
      setIsSaving(true);
      setSaved(false);
      try {
        await updateCampaign(campaignId, {mailListIds: ids, filter: f});
        setSaved(true);
      } catch {
        enqueueSnackbar(t('campaign.wizard.step1.save_error'), {variant: 'error'});
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
      doSave(mailListIds, filter).catch(console.error);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [mailListIds, filter, initialized, doSave]);

  const handleToggleList = (id: number) => {
    setMailListIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const handleCancel = () => {
    router.push(CAMPAIGN_CRUD_LIST);
  };

  const handleContinue = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await doSave(mailListIds, filter);
    router.push(generatePathStorage(WIZARD_STEP_2, {id: idParam}));
  };

  const mailLists: MailList[] = mailListsResult?.items ?? [];

  const steps = [
    t('campaign.wizard.step1.title'),
    t('campaign.wizard.step2.title'),
    t('campaign.wizard.step3.title'),
    t('campaign.wizard.step4.title'),
  ];

  if (campaignLoading || listsLoading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', py: 6}}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stepper activeStep={0} sx={{mb: 4}}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
        {t('campaign.wizard.step1.description')}
      </Typography>

      {mailLists.length === 0 ? (
        <Typography color="text.secondary">{t('campaign.wizard.step1.no_lists')}</Typography>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {mailLists.map((list, index) => (
              <ListItem
                key={list.id}
                divider={index < mailLists.length - 1}
                sx={{px: 2, py: 0.5}}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={mailListIds.includes(list.id)}
                      onChange={() => handleToggleList(list.id)}
                    />
                  }
                  label={
                    <Box sx={{ml: 0.5}}>
                      <Typography variant="body2" fontWeight={500}>
                        {list.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('campaign.wizard.step1.contacts', {count: list.active_count})}
                      </Typography>
                    </Box>
                  }
                  sx={{flex: 1, mr: 0, width: '100%'}}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Box sx={{mt: 2, minHeight: 24, display: 'flex', alignItems: 'center', gap: 1}}>
        {isSaving && (
          <>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              {t('campaign.wizard.step1.saving')}
            </Typography>
          </>
        )}
        {!isSaving && saved && (
          <Typography variant="caption" color="success.main">
            {t('campaign.wizard.step1.saved')}
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
        <Button onClick={handleCancel} disabled={isSaving}>
          {t('messages.btn.cancel')}
        </Button>
        <Button variant="contained" onClick={handleContinue} disabled={isSaving}>
          {t('campaign.wizard.btn.save_and_continue')}
        </Button>
      </Box>
    </Box>
  );
};

export default WizardStep1Content;
