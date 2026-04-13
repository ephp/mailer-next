import React, {ReactElement} from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import {Divider} from '@mui/material';
import ContentWrapBox from '@/@oimmei/core/AppsSimpleContainer/ContentWrapBox';
import {
  default as AppSimpleContainerBreadcrumbItemComponent,
  AppSimpleContainerBreadcrumbItem,
} from './AppSimpleContainerBreadcrumbItemComponent'

export interface AppSimpleContainerProps {
  /**
   * Page content.
   */
  children: React.ReactNode;

  /**
   * Page title, including breadcrumbs.
   */
  title:
    | AppSimpleContainerBreadcrumbItem
    | AppSimpleContainerBreadcrumbItem[];

  /**
   * Wrapper for additional elements
   * (buttons, links...) on the right.
   */
  actionWrapper?: React.ReactNode;

  /**
   * Wrapper for additional elements below the title.
   */
  subheaderBottomWrapper?: React.ReactNode;

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
}

const AppsSimpleContainer = (
  {
    children,
    title,
    actionWrapper,
    subheaderBottomWrapper,
    disablePadding = false,
    hasMaxWidth = false,
  }: AppSimpleContainerProps,
): ReactElement | null => {
  return (
    <>
      <AppBar position={'static'} color={'info'} elevation={2}>
        <Toolbar>
          {/* Title/breadcrumbs wrapper. */}
          <Breadcrumbs
            aria-label={'breadcrumb'}
          >
            {Array.isArray(title) ? title.map(
              (
                item,
                index,
                array,
              ) => (
                <AppSimpleContainerBreadcrumbItemComponent
                  key={index}
                  item={item}
                  last={index === array.length - 1}
                />
              ),
            ) : (
              <AppSimpleContainerBreadcrumbItemComponent item={title} last/>
            )}
          </Breadcrumbs>

          {actionWrapper !== undefined && (
            <Box display={'flex'} marginLeft={'auto'}>
              {actionWrapper}
            </Box>
          )}
        </Toolbar>
        {subheaderBottomWrapper !== undefined && (
          <>
            <Divider/>
            {/*
             Using a toolbar so the same spacing as the one
             above is applied (it's just a styled div anyway).
            */}
            <Toolbar variant={'dense'}>
              {subheaderBottomWrapper}
            </Toolbar>
          </>
        )}
      </AppBar>

      <ContentWrapBox
        disablePadding={disablePadding}
        hasMaxWidth={hasMaxWidth}
      >
        {children}
      </ContentWrapBox>
    </>
  );
};

export default AppsSimpleContainer;
