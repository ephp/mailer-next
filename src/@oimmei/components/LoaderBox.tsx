import React, {ReactElement} from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box, {BoxProps} from '@mui/material/Box';

const LoaderBox = (
  {disableFullHeight = false, ...rest}: {
    disableFullHeight?: boolean
  } & BoxProps,
): ReactElement | null => {
  return (
    <Box
      height={!disableFullHeight ? 1 : undefined}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      {...rest}
    >
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={{
          color: theme => (theme.vars ?? theme).palette.primary.main,
          animationDuration: '550ms',
          position: 'absolute',
        }}
      />
    </Box>
  );
};

export default LoaderBox;
