import React, {ReactElement} from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';
import Box, {BoxProps} from '@mui/material/Box';

const EmptyStateBox = (
  {title, message, disableFullHeight = false, ...rest}: {
    title?: string

    message: string

    disableFullHeight?: boolean
  } & BoxProps,
): ReactElement | null => {
  return (
    <Box
      height={!disableFullHeight ? 1 : undefined}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      {...rest}
    >
      <ErrorOutlineIcon
        fontSize={'large'}
        color={'error'}
        sx={{
          marginBottom: 3,
        }}
      />
      {title && (
        <Typography variant={'h6'} marginBottom={1}>
          {title}
        </Typography>
      )}
      {message && (
        <Typography>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default EmptyStateBox;
