'use client';

import React, {ReactElement, useState, useCallback, useEffect} from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import {useTranslations} from 'next-intl';
import {Campaign, newCampaign} from '@/types/models/Campaign';
import {MailList} from '@/types/models/MailList';
import {getMailLists} from '@/shared/helpers/api/mailListApiHelper';
import {createCampaign, updateCampaign, sendTestEmail, sendCampaign, saveAsTemplate} from '@/shared/helpers/api/campaignApiHelper';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import CampaignWizardStep1 from './CampaignWizardStep1';
import CampaignWizardStep2 from './CampaignWizardStep2';
import CampaignWizardStep3 from './CampaignWizardStep3';
import CampaignWizardStep4 from './CampaignWizardStep4';

const CampaignWizard = ({
  campaign,
  editing,
  onOperationCompleted,
}: {
  campaign: Campaign | null;
  editing: boolean;
  onOperationCompleted: () => void;
}): ReactElement | null => {
  const t = useTranslations();
  const {performAsyncCall} = useAsyncCallHelper2Actions();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Campaign>(newCampaign);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);

  const {
    result: mailListsResult,
    loading: listsLoading,
    perform: fetchLists,
  } = useAsyncLoader(getMailLists, true);

  useEffect(() => {
    fetchLists({
      page: 1,
      perPage: 100,
      sortBy: 'name' as keyof MailList,
      sortDirection: 'asc',
      filters: {},
    }).catch(console.error);
  }, [fetchLists]);

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
      setSavedId(campaign.id > 0 ? campaign.id : null);
    }
  }, [campaign]);

  const mailLists: MailList[] = mailListsResult?.items ?? [];

  const steps = [
    t('campaign.wizard.step1.title'),
    t('campaign.wizard.step2.title'),
    t('campaign.wizard.step3.title'),
    t('campaign.wizard.step4.title'),
  ];

  const handleNext = useCallback(() => setActiveStep(s => s + 1), []);
  const handleBack = useCallback(() => setActiveStep(s => s - 1), []);

  const handleChange = useCallback((data: Partial<Campaign>) => {
    setFormData(d => ({...d, ...data}));
  }, []);

  const persistCampaign = async (data: Campaign): Promise<Campaign | null> => {
    const isNew = !editing && savedId === null;
    try {
      if (isNew) {
        const result = await performAsyncCall(createCampaign({entity: data}));
        if (result?.item) {
          setSavedId(result.item.id);
          setFormData(result.item);
          return result.item;
        }
      } else {
        const entityToSave = savedId ? {...data, id: savedId} : data;
        await performAsyncCall(updateCampaign({entity: entityToSave}));
        return entityToSave;
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const handleSaveDraft = async () => {
    if (!formData.email_subject.trim()) {
      setSubjectError(t('campaign.error.email_subject.required'));
      setActiveStep(1);
      return;
    }
    setSubjectError(null);
    setIsSubmitting(true);
    try {
      await persistCampaign({...formData, draft: true});
      onOperationCompleted();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendTest = async (email: string) => {
    setIsSubmitting(true);
    try {
      const saved = await persistCampaign(formData);
      const id = saved?.id ?? savedId;
      if (id) {
        await performAsyncCall(sendTestEmail({id, email}));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async (scheduledAt: string) => {
    if (!formData.email_subject.trim()) {
      setSubjectError(t('campaign.error.email_subject.required'));
      setActiveStep(1);
      return;
    }
    setIsSubmitting(true);
    try {
      const saved = await persistCampaign({...formData, draft: false});
      const id = saved?.id ?? savedId;
      if (id) {
        await performAsyncCall(sendCampaign({id, options: {scheduled_at: scheduledAt}}));
      }
      onOperationCompleted();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNow = async () => {
    if (!formData.email_subject.trim()) {
      setSubjectError(t('campaign.error.email_subject.required'));
      setActiveStep(1);
      return;
    }
    setIsSubmitting(true);
    try {
      const saved = await persistCampaign({...formData, draft: false});
      const id = saved?.id ?? savedId;
      if (id) {
        await performAsyncCall(sendCampaign({id, options: {scheduled_at: null}}));
      }
      onOperationCompleted();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!formData.email_subject.trim()) {
      setSubjectError(t('campaign.error.email_subject.required'));
      setActiveStep(1);
      return;
    }
    setIsSubmitting(true);
    try {
      const saved = await persistCampaign({...formData, draft: true});
      const id = saved?.id ?? savedId;
      if (id) {
        await performAsyncCall(saveAsTemplate({id}));
      }
      onOperationCompleted();
    } finally {
      setIsSubmitting(false);
    }
  };

  const step1Valid = formData.mail_list_ids.length > 0;
  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{mb: 4}}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <CampaignWizardStep1
          formData={formData}
          mailLists={mailLists}
          onChange={handleChange}
        />
      )}

      {activeStep === 1 && (
        <CampaignWizardStep2
          formData={formData}
          subjectError={subjectError}
          onChange={handleChange}
        />
      )}

      {activeStep === 2 && (
        <CampaignWizardStep3
          formData={formData}
          onChange={handleChange}
        />
      )}

      {activeStep === 3 && (
        <CampaignWizardStep4
          formData={formData}
          isSaving={isSubmitting}
          onSaveDraft={handleSaveDraft}
          onSendTest={handleSendTest}
          onSchedule={handleSchedule}
          onSendNow={handleSendNow}
          onSaveAsTemplate={handleSaveAsTemplate}
        />
      )}

      <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider'}}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          {t('messages.btn.back')}
        </Button>
        {!isLastStep && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={(activeStep === 0 && (!step1Valid || listsLoading))}
          >
            {t('messages.btn.next')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CampaignWizard;
