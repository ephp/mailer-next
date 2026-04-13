import React, {ReactElement} from 'react';
import Box from '@mui/material/Box';

export default function AuthLayout({children}: {
  children: React.ReactNode
}): ReactElement | null {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        height: '100vh',
        backgroundColor: '#f3f4f6',
        backgroundSize: 'cover',
      }}
    >
      {children}
    </Box>
  );
}
