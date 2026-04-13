import React, {ReactElement} from 'react';
import Typography, {TypographyProps} from '@mui/material/Typography';
import Link from 'next/link';
import {Url} from 'next/dist/shared/lib/router/router';

const AppSimpleContainerBreadcrumbLinkTypography = (
  {label, href, ...rest}: {
    label: React.ReactNode

    href: Url
  } & TypographyProps
): ReactElement | null => {
  return (
    <Typography
      variant={'h2'}
      component={Link}
      href={href}
      {...rest}
    >
      {label}
    </Typography>
  );
}

export default AppSimpleContainerBreadcrumbLinkTypography;
