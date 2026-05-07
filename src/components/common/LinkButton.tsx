'use client';

import React, {ReactElement} from 'react';
import Link from 'next/link';
import Button, {ButtonProps} from '@mui/material/Button';

type Props = Omit<ButtonProps, 'component' | 'href'> & {
  href: string;
};

const LinkButton = ({href, children, ...rest}: Props): ReactElement => (
  <Button {...rest} component={Link as React.ElementType} href={href}>
    {children}
  </Button>
);

export default LinkButton;
