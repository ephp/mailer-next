'use client';

import React, {ReactElement, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import {useTranslations} from 'next-intl';

interface EmailPreviewProps {
  html: string;
  loading?: boolean;
}

const EmailPreview = ({html, loading = false}: EmailPreviewProps): ReactElement => {
  const t = useTranslations('campaign');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
      <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
        <ToggleButtonGroup
          value={viewport}
          exclusive
          onChange={(_, val) => {
            if (val) setViewport(val);
          }}
          size="small"
        >
          <ToggleButton value="desktop">
            <DesktopWindowsIcon fontSize="small" sx={{mr: 0.5}} />
            {t('preview.desktop')}
          </ToggleButton>
          <ToggleButton value="mobile">
            <PhoneAndroidIcon fontSize="small" sx={{mr: 0.5}} />
            {t('preview.mobile')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={500} />
      ) : !html ? (
        <Box
          sx={{
            minHeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('preview.empty')}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            bgcolor: '#e0e0e0',
            p: 1,
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              width: viewport === 'mobile' ? '375px' : '600px',
              maxWidth: '100%',
              minHeight: 500,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0.5,
              overflow: 'hidden',
              bgcolor: '#fff',
            }}
          >
            <iframe
              sandbox="allow-same-origin"
              srcDoc={html}
              title="Email preview"
              style={{
                width: '100%',
                minHeight: 500,
                border: 'none',
                display: 'block',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EmailPreview;
