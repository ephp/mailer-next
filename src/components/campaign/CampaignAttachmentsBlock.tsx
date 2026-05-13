'use client';

import React, {ReactElement, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {useTranslations} from 'next-intl';
import {useSnackbar} from 'notistack';
import {CampaignAttachment} from '@/types/models/Campaign';
import {
  deleteCampaignAttachment,
  uploadCampaignAttachment,
} from '@/shared/helpers/api/campaignApiHelper';

interface Props {
  campaignId: number;
  initialAttachments: CampaignAttachment[];
}

const formatBytes = (b: number): string => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const CampaignAttachmentsBlock = ({campaignId, initialAttachments}: Props): ReactElement => {
  const t = useTranslations();
  const {enqueueSnackbar} = useSnackbar();
  const [attachments, setAttachments] = useState<CampaignAttachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectFiles = () => fileInputRef.current?.click();

  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: CampaignAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const att = await uploadCampaignAttachment(campaignId, files[i]);
        uploaded.push(att);
      }
      setAttachments(prev => [...prev, ...uploaded]);
      enqueueSnackbar(t('campaign.attachments.uploaded', {count: uploaded.length}), {variant: 'success'});
    } catch (err) {
      console.error(err);
      enqueueSnackbar(t('campaign.attachments.upload_error'), {variant: 'error'});
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId: number) => {
    setDeletingId(attachmentId);
    try {
      await deleteCampaignAttachment(campaignId, attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err) {
      console.error(err);
      enqueueSnackbar(t('campaign.attachments.delete_error'), {variant: 'error'});
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{mb: 1, fontWeight: 600}}>
        {t('campaign.attachments.title')}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 2}}>
        {t('campaign.attachments.helper')}
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFilesChosen}
      />

      <Button
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={16}/> : <CloudUploadIcon/>}
        onClick={handleSelectFiles}
        disabled={uploading}
      >
        {uploading ? t('campaign.attachments.uploading') : t('campaign.attachments.add')}
      </Button>

      {attachments.length > 0 && (
        <List dense sx={{mt: 1}}>
          {attachments.map(att => (
            <ListItem
              key={att.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleDelete(att.id)}
                  disabled={deletingId === att.id}
                >
                  {deletingId === att.id ? <CircularProgress size={16}/> : <DeleteIcon fontSize="small"/>}
                </IconButton>
              }
            >
              <ListItemIcon sx={{minWidth: 32}}><AttachFileIcon fontSize="small"/></ListItemIcon>
              <ListItemText
                primary={att.filename}
                secondary={`${formatBytes(att.size)}${att.mimetype ? ` • ${att.mimetype}` : ''}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CampaignAttachmentsBlock;
