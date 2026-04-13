import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import {OiAnimate} from '@Oimmei-Digital-Boutique/crema-components';

interface AuthWrapperProps {
  children: any;
  wide?: boolean; // Added for the signup.
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({children, wide = false}) => {
  return (
    <OiAnimate>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 1,
          minHeight: '100vh',
        }}
      >
        <Card
          sx={{
            maxWidth: !wide ? 500 : 800,
            minHeight: {xs: 320, sm: 450},
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
          }}
        >
          <Box
            sx={{
              // width: { xs: "100%", sm: "50%", lg: "40%" },
              width: {xs: '100%'},
              padding: {xs: 5, lg: 10},
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {children}
          </Box>
        </Card>
      </Box>
    </OiAnimate>
  );
};

export default AuthWrapper;
