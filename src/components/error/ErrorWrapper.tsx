import React, {ReactElement} from 'react';
import {OiAnimate} from '@Oimmei-Digital-Boutique/crema-components';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {grey} from '@mui/material/colors';

export default (
  {title, description, logo, children}: {
    title: string

    description: string

    logo: React.ReactNode

    children?: React.ReactNode
  },
): ReactElement | null => {
  return (
    <OiAnimate>
      <Box
        sx={{
          py: 8,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            mb: {xs: 4, xl: 8},
            width: '100%',
            maxWidth: {xs: 200, sm: 300, xl: 706},
            '& svg': {
              width: '100%',
              maxWidth: 400,
            },
          }}
        >
          {logo}
        </Box>
        <Box sx={{mb: {xs: 4, xl: 5}}}>
          <Typography
            component="h3"
            sx={{
              mb: {xs: 3, xl: 4},
              fontSize: {xs: 20, md: 24},
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              mb: {xs: 4, xl: 5},
              color: grey[600],
              fontSize: 16,
            }}
          >
            <Typography>
              {description}
            </Typography>
          </Box>

          {children}
        </Box>
      </Box>
    </OiAnimate>
  );
}
