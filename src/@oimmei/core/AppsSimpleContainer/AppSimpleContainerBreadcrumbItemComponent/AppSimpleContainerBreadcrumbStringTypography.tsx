import React, {ReactElement} from 'react';
import Typography, {TypographyProps} from '@mui/material/Typography';

const AppSimpleContainerBreadcrumbStringTypography = (
  {content, ...rest}: {
    content: React.ReactNode
  } & Omit<TypographyProps, 'content'>,
): ReactElement | null => {
  return (
    <Typography
      variant={'h2'}
      {...rest}
    >
      {content}
    </Typography>
  );
};

export default AppSimpleContainerBreadcrumbStringTypography;
