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
import {getMailListList} from '@/shared/helpers/api/mailListApiHelper';
import {createCampaign, updateCampaign} from '@/shared/helpers/api/campaignApiHelper';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import CampaignWizardStep1 from './CampaignWizardStep1';
import CampaignWizardStep2 from './CampaignWizardStep2';

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

  const {
    result: mailListsResult,
    loading: listsLoading,
    perform: fetchLists,
  } = useAsyncLoader(getMailListList, true);

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
    }
  }, [campaign]);

  const mailLists: MailList[] = mailListsResult?.items ?? [];

  const steps = [
    t('campaign.wizard.step1.title'),
    t('campaign.wizard.step2.title'),
  ];

  const handleNext = useCallback(() => setActiveStep(s => s + 1), []);
  const handleBack = useCallback(() => setActiveStep(s => s - 1), []);

  const handleChange = useCallback((data: Partial<Campaign>) => {
    setFormData(d => ({...d, ...data}));
  }, []);

  const handleSave = async () => {
    if (!formData.email_subject.trim()) {
      setSubjectError(t('campaign.error.email_subject.required'));
      return;
    }
    setSubjectError(null);
    setIsSubmitting(true);
    try {
      if (!editing) {
        await performAsyncCall(createCampaign({entity: formData}));
      } else {
        await performAsyncCall(updateCampaign({entity: formData}));
      }
      onOperationCompleted();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const step1Valid = formData.mail_list_ids.length > 0;

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

      <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider'}}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          {t('messages.btn.back')}
        </Button>
        <Box>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!step1Valid || listsLoading}
            >
              {t('messages.btn.next')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {t('campaign.btn.save_draft')}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CampaignWizard;
