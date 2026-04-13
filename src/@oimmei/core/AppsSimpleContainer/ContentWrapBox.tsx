'use client';

import React, {ReactElement} from 'react';
import Box from '@mui/material/Box';

/**
 * This wrapper uses the theme, meaning it needs to be wrapped in a client component.
 */
const ContentWrapBox = (
  {disablePadding, hasMaxWidth, children}: {
    /**
     * If TRUE, no padding will be
     * applied to the children wrapper.
     */
    disablePadding?: boolean;

    /**
     * If TRUE, a max width will be applied
     * to the children wrapper.
     */
    hasMaxWidth?: boolean;

    children: React.ReactNode
  }
): ReactElement | null => {
  return (
    <Box
      flex={1}
      minHeight={0}
      overflow={'auto'}
      paddingY={disablePadding ? 0 : {xs: 2, md: 4}}

      // So a max-width can be given without using an
      // additional box, which would break some styles:
      paddingX={theme => (
        hasMaxWidth ? {
          xs: `max(calc((100% - 1100px) / 2), ${theme.spacing(2)})`,
          md: `max(calc((100% - 1100px) / 2), ${theme.spacing(4)})`,
        } : {xs: 2, md: 4}
      )}
    >
      {children}
    </Box>
  );
};

export default ContentWrapBox;
