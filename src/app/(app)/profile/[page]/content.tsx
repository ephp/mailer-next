'use client';

import React, {ReactElement} from 'react';
import Box from '@mui/material/Box';
import PersonalInfo from '@/components/profile/PersonalInfo';
import ChangePassword from '@/components/profile/ChangePassword';

const MyAccountContent = (
  {page}: {
    page: 'my-account' | 'password'
  },
): ReactElement | null => {
  return (
    <Box className="account-tabs-content">
      {page === 'my-account' && <PersonalInfo/>}
      {page === 'password' && <ChangePassword/>}
    </Box>
  );
};

export default MyAccountContent;
