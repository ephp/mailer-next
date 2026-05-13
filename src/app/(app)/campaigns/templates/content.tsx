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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArticleIcon from '@mui/icons-material/Article';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useSnackbar} from 'notistack';
import {Campaign} from '@/types/models/Campaign';
import {createCampaign, deleteCampaign, getCampaigns} from '@/shared/helpers/api/campaignApiHelper';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {WIZARD_STEP_1} from '@/shared/constants/AppRoutes';

const TemplateCard = ({
  template,
  onUse,
  onEdit,
  onDelete,
}: {
  template: Campaign;
  onUse: (id: number) => void;
  onEdit: (id: number) => void;
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
              {template.name ?? template.email_subject}
            </Typography>
            {template.email_subject && (
              <Typography variant="caption" color="text.secondary" sx={{display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {template.email_subject}
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

        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, flexWrap: 'wrap'}}>
          <Chip
            label={t('template.badge')}
            size="small"
            color="secondary"
            variant="outlined"
          />
          <Chip
            label={t('template.used_count', {count: 0})}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>

      <CardActions sx={{justifyContent: 'flex-end', gap: 0.5, px: 2, pb: 2, flexWrap: 'wrap'}}>
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
          startIcon={<EditOutlinedIcon/>}
          onClick={() => onEdit(template.id)}
        >
          {t('template.btn.edit')}
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

  const [templates, setTemplates] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingTemplate, setDeletingTemplate] = useState<Campaign | null>(null);

  useEffect(() => {
    getCampaigns({page: 1, perPage: 50, filter: {template: true}})
      .then(res => setTemplates(res.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUseTemplate = useCallback(async (id: number) => {
    try {
      const res = await createCampaign({fromTemplateId: id});
      if (res?.item?.id) {
        enqueueSnackbar({message: t('template.success.used'), variant: 'success'});
        router.push(generatePathStorage(WIZARD_STEP_1, {id: res.item.id.toString()}));
      }
    } catch {
      // silent
    }
  }, [router, enqueueSnackbar, t]);

  const handleEditTemplate = useCallback((id: number) => {
    router.push(generatePathStorage(WIZARD_STEP_1, {id: id.toString()}));
  }, [router]);

  const confirmDeleteTemplate = (template: Campaign) => {
    setDeletingTemplate(null);
    deleteCampaign(template.id)
      .then(() => {
        setTemplates(prev => prev.filter(c => c.id !== template.id));
        enqueueSnackbar({message: t('success.deleted'), variant: 'success'});
      })
      .catch(console.error);
  };

  return (
    <>
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({length: 6}).map((_, i) => (
            <Grid size={{xs: 12, sm: 6, md: 4}} key={i}>
              <Skeleton variant="rectangular" height={180} sx={{borderRadius: 1}}/>
            </Grid>
          ))}
        </Grid>
      ) : templates.length === 0 ? (
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
      ) : (
        <Grid container spacing={2}>
          {templates.map(template => (
            <Grid size={{xs: 12, sm: 6, md: 4}} key={template.id}>
              <TemplateCard
                template={template}
                onUse={handleUseTemplate}
                onEdit={handleEditTemplate}
                onDelete={setDeletingTemplate}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deletingTemplate !== null}
        onClose={() => setDeletingTemplate(null)}
        aria-labelledby="delete-template-dialog-title"
      >
        <DialogTitle id="delete-template-dialog-title">
          {deletingTemplate !== null && t('template.message.delete.title', {name: deletingTemplate.name ?? deletingTemplate.email_subject})}
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
