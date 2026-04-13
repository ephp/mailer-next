'use client';

import React, {ReactElement} from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import {styled} from '@mui/material/styles';
import ClientOnlyPortal from '../../components/ClientOnlyPortal';

const AppLoaderRoot = styled('div')({
  height: '100%',
  display: 'flex',
  flex: '1',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  zIndex: '99999',
});

const AppLoader = (
  {disablePortal}: {
    disablePortal?: boolean
  },
): ReactElement | null => {
  // Borrowed from https://mui.com/material-ui/react-progress/#customization
  const loaderContent = (
    <AppLoaderRoot>
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme) =>
            (theme.vars ?? theme).palette
              .grey[theme.palette.mode === 'light' ? 200 : 800],
        }}
        size={40}
        thickness={4}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={{
          color: theme => (theme.vars ?? theme).palette.primary.main,
          animationDuration: '550ms',
          position: 'absolute',
        }}
        size={40}
        thickness={4}
      />
    </AppLoaderRoot>
  );

  if (disablePortal) {
    return loaderContent;
  } else {
    return (
      // Using a portal so the loader is always directly inside the body.
      <ClientOnlyPortal selector={'body'}>
        {loaderContent}
      </ClientOnlyPortal>
    );
  }
};

export default AppLoader;
