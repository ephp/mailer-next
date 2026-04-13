import React, {ReactElement} from 'react';
import {
  default as AppSimpleContainerBreadcrumbStringTypography,
} from './AppSimpleContainerBreadcrumbStringTypography';
import {
  default as AppSimpleContainerBreadcrumbLinkTypography,
} from './AppSimpleContainerBreadcrumbLinkTypography';
import {
  default as AppSimpleContainerBreadcrumbStorageLinkTypography,
} from './AppSimpleContainerBreadcrumbStorageLinkTypography';
import {TypographyProps} from '@mui/material/Typography';

export type AppSimpleContainerBreadcrumbItem =
  | string
  |
  {
    label: React.ReactNode

    /**
     * Static URL, possibly pre-generated on the server.
     */
    href: string
  }
  |
  {
    label: React.ReactNode

    /**
     * Path and params for a dynamic URL. This will be
     * generated on the client, meaning it will be able
     * to use browser-based features like sessionStorage.
     */
    path: string
    params?: Record<string, string>
  }
  | ReactElement
  ;

/**
 * Helper function for rendering breadcrumb items.
 */
const AppSimpleContainerBreadcrumbItemComponent = (
  {item, last = false}: {
    item: AppSimpleContainerBreadcrumbItem,
    last?: boolean,
  },
): ReactElement | null => {
  const additionalTypographyProps: TypographyProps = last ? {
    color: "text.primary",
  } : {};

  if (typeof item === 'string') {
    // Printing the string, wrapped in a typography.
    return (
      <AppSimpleContainerBreadcrumbStringTypography
        content={item}
        {...additionalTypographyProps}
      />
    );
  } else if ('label' in item) {
    // Rendering the link.
    if ('href' in item) {
      // Static, server-generated link.
      return (
        <AppSimpleContainerBreadcrumbLinkTypography
          label={item.label}
          href={item.href}
          {...additionalTypographyProps}
        />
      );
    } else {
      // Dynamic, client-generated link.
      return (
        <AppSimpleContainerBreadcrumbStorageLinkTypography
          label={item.label}
          path={item.path}
          params={item.params}
          {...additionalTypographyProps}
        />
      );
    }
  } else {
    // Returning the element as-is in any other case.
    return item;
  }
};

export default AppSimpleContainerBreadcrumbItemComponent;
