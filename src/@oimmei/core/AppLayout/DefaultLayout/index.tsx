import React, {ReactElement} from 'react';
import Box from '@mui/material/Box';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Toolbar from '@mui/material/Toolbar';
import defaultConfig from '../../../utility/AppContextProvider/defaultConfig';

const DefaultLayout = (
  {children}: {
    children: React.ReactNode
  },
): ReactElement | null => {
  return (
    <Box
      height={'100vh'}
    >
      <AppHeader/>

      <Box
        display={'flex'}
        height={1} // Full height: the header is fixed.
      >
        <AppSidebar/>

        <Box
          display={'flex'}
          flexDirection={'column'}
          flex={1}
          minWidth={0}
        >
          {/* See AppSidebar for details about this madness. */}
          <Toolbar sx={{height: defaultConfig.header.headerHeight}}/>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DefaultLayout;
