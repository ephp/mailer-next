'use client';

import React, {ReactElement} from 'react';
import Typography, {TypographyProps} from '@mui/material/Typography';
import Link from 'next/link';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';

const AppSimpleContainerBreadcrumbStorageLinkTypography = (
  {label, path, params, ...rest}: {
    label: React.ReactNode

    path: string

    params?: Record<string, string>
  } & TypographyProps
): ReactElement | null => {
  return (
    <Typography
      variant={'h2'}
      component={Link}
      href={generatePathStorage(path, params)}
      {...rest}
    >
      {label}
    </Typography>
  );
}

export default AppSimpleContainerBreadcrumbStorageLinkTypography;
