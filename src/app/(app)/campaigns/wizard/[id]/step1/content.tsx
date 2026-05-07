'use client';

import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useParams, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {useSnackbar} from 'notistack';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {getCampaign, updateCampaign} from '@/shared/helpers/api/campaignApiHelper';
import {getMailLists} from '@/shared/helpers/api/mailListApiHelper';
import {getTaxonomyCategoryList} from '@/shared/helpers/api/taxonomyApiHelper';
import {taxonomyTermsHelper} from '@/shared/helpers/api/taxonomyTermApiHelper';
import {CAMPAIGN_CRUD_LIST, WIZARD_STEP_2} from '@/shared/constants/AppRoutes';
import {CampaignFilter} from '@/types/models/Campaign';
import {MailList} from '@/types/models/MailList';
import {TaxonomyCategory} from '@/types/models/TaxonomyCategory';
import {TaxonomyTerm} from '@/types/models/TaxonomyTerm';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';

const AUTOSAVE_DELAY_MS = 800;

type TaxonomyAccordionProps = {
  listId: number;
  selectedTermIds: number[];
  onTermToggle: (termId: number) => void;
};

const TaxonomyAccordion = ({listId, selectedTermIds, onTermToggle}: TaxonomyAccordionProps): ReactElement => {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState<TaxonomyCategory[] | null>(null);
  const [terms, setTerms] = useState<Record<number, TaxonomyTerm[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const loadedRef = useRef(false);

  const handleChange = (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
    if (!isExpanded || loadedRef.current) return;
    loadedRef.current = true;
    setLoadingCategories(true);
    getTaxonomyCategoryList({listId})
      .then(async result => {
        const cats = result.item ?? [];
        setCategories(cats);
        const termEntries = await Promise.all(
          cats.map(async cat => {
            const termResult = await taxonomyTermsHelper(cat.id).allTag();
            return [cat.id, termResult.item ?? []] as [number, TaxonomyTerm[]];
          }),
        );
        setTerms(Object.fromEntries(termEntries));
      })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      disableGutters
      elevation={0}
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'action.hover',
        '&:before': {display: 'none'},
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon fontSize="small" />}
        sx={{minHeight: 32, pl: 4, '& .MuiAccordionSummary-content': {my: 0.5}}}
      >
        <Typography variant="caption" color="text.secondary">
          {t('campaign.wizard.step1.taxonomy_filter_label')}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{pt: 0, pb: 1.5, px: 4}}>
        {loadingCategories ? (
          <Box>
            <Skeleton height={20} width="55%" />
            <Skeleton height={20} width="38%" />
            <Skeleton height={20} width="45%" />
          </Box>
        ) : categories !== null && categories.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            {t('campaign.wizard.step1.no_taxonomy_filters')}
          </Typography>
        ) : (
          categories?.map(cat => (
            <Box key={cat.id} sx={{mb: 1.5}}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5}}
              >
                {cat.name}
              </Typography>
              <Box sx={{display: 'flex', flexWrap: 'wrap', ml: -0.5}}>
                {(terms[cat.id] ?? []).map(term => (
                  <FormControlLabel
                    key={term.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedTermIds.includes(term.id)}
                        onChange={() => onTermToggle(term.id)}
                      />
                    }
                    label={<Typography variant="caption">{term.label}</Typography>}
                    sx={{mr: 1, ml: 0}}
                  />
                ))}
              </Box>
            </Box>
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
};

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

  const handleTermToggle = useCallback((termId: number) => {
    setFilter(prev => {
      const currentIds = prev?.taxonomy_term_ids ?? [];
      const newIds = currentIds.includes(termId)
        ? currentIds.filter(id => id !== termId)
        : [...currentIds, termId];
      return {taxonomy_term_ids: newIds};
    });
  }, []);

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
        <Paper variant="outlined" sx={{overflow: 'hidden'}}>
          {mailLists.map((list, index) => (
            <Box
              key={list.id}
              sx={{
                borderBottom: index < mailLists.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box sx={{px: 2, py: 0.5}}>
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
              </Box>
              {mailListIds.includes(list.id) && (
                <TaxonomyAccordion
                  listId={list.id}
                  selectedTermIds={filter?.taxonomy_term_ids ?? []}
                  onTermToggle={handleTermToggle}
                />
              )}
            </Box>
          ))}
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
