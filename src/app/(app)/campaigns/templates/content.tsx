'use client';

import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import SubjectIcon from '@mui/icons-material/Subject';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArticleIcon from '@mui/icons-material/Article';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useSnackbar} from 'notistack';
import {Campaign} from '@/types/models/Campaign';
import {deleteCampaignLegacy, duplicateCampaign, getTemplateList} from '@/shared/helpers/api/campaignApiHelper';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {CAMPAIGN_CRUD_EDIT} from '@/shared/constants/AppRoutes';

const TemplateCard = ({
  template,
  onUse,
  onDelete,
}: {
  template: Campaign;
  onUse: (id: number) => void;
  onDelete: (template: Campaign) => void;
}): ReactElement => {
  const t = useTranslations('campaign');
  const tMsg = useTranslations('messages');

  return (
    <Card variant="outlined" sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <CardContent sx={{flexGrow: 1}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5}}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              flexShrink: 0,
            }}
          >
            <ArticleIcon fontSize="small"/>
          </Box>
          <Box sx={{minWidth: 0}}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {template.email_subject}
            </Typography>
            {template.name && (
              <Typography variant="caption" color="text.secondary">
                {template.name}
              </Typography>
            )}
          </Box>
        </Box>

        {template.snippet && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 1,
            }}
          >
            {template.snippet}
          </Typography>
        )}

        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 1}}>
          <SubjectIcon fontSize="small" color="action"/>
          <Chip
            label={t('template.badge')}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>
      </CardContent>

      <CardActions sx={{justifyContent: 'flex-end', gap: 1, px: 2, pb: 2}}>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteOutlineIcon/>}
          onClick={() => onDelete(template)}
        >
          {tMsg('btn.delete')}
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<ContentCopyIcon/>}
          onClick={() => onUse(template.id)}
        >
          {t('template.btn.use')}
        </Button>
      </CardActions>
    </Card>
  );
};

const CampaignTemplatesContent = (): ReactElement => {
  const t = useTranslations('campaign');
  const tMsg = useTranslations('messages');
  const router = useRouter();
  const {enqueueSnackbar} = useSnackbar();
  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const {result, setResult, loading, perform: fetchTemplates} = useAsyncLoader(getTemplateList, true);

  useEffect(() => {
    fetchTemplates({page: 1, perPage: 50, sortBy: 'id', sortDirection: 'desc'}).catch(console.error);
  }, [fetchTemplates]);

  const [deletingTemplate, setDeletingTemplate] = useState<Campaign | null>(null);

  const handleUseTemplate = useCallback(async (id: number) => {
    const res = await performAsyncCall(duplicateCampaign(id));
    if (res?.item?.id) {
      enqueueSnackbar({message: t('template.success.used'), variant: 'success'});
      router.push(generatePathStorage(CAMPAIGN_CRUD_EDIT, {id: res.item.id.toString()}));
    }
  }, [performAsyncCall, router, enqueueSnackbar, t]);

  const confirmDeleteTemplate = (template: Campaign) => {
    performAsyncCall(deleteCampaignLegacy({id: template.id}))
      .then(() => {
        setResult(prev => prev !== null ? {
          ...prev,
          items: prev.items?.filter(c => c.id !== template.id) ?? prev.items,
        } : prev);
        enqueueSnackbar({message: t('success.deleted'), variant: 'success'});
      })
      .catch(console.error);
    setDeletingTemplate(null);
  };

  const templates = result?.items ?? [];

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({length: 6}).map((_, i) => (
          <Grid size={{xs: 12, sm: 6, md: 4}} key={i}>
            <Skeleton variant="rectangular" height={180} sx={{borderRadius: 1}}/>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (templates.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          gap: 2,
          color: 'text.secondary',
        }}
      >
        <ArticleIcon sx={{fontSize: 64, opacity: 0.3}}/>
        <Typography variant="h6" color="text.secondary">
          {t('template.empty.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t('template.empty.description')}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        {templates.map(template => (
          <Grid size={{xs: 12, sm: 6, md: 4}} key={template.id}>
            <TemplateCard
              template={template}
              onUse={handleUseTemplate}
              onDelete={setDeletingTemplate}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deletingTemplate !== null}
        onClose={() => setDeletingTemplate(null)}
        aria-labelledby="delete-template-dialog-title"
      >
        <DialogTitle id="delete-template-dialog-title">
          {deletingTemplate !== null && t('template.message.delete.title', {name: deletingTemplate.email_subject})}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('template.message.delete.description')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingTemplate(null)}>{tMsg('btn.cancel')}</Button>
          <Button onClick={() => confirmDeleteTemplate(deletingTemplate as Campaign)} autoFocus color="error">
            {tMsg('btn.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CampaignTemplatesContent;
