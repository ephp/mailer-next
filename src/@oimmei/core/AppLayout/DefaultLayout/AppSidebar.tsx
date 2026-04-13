'use client';

import React, {ReactElement} from 'react';
import {default as MuiDrawer} from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import routesConfig, {
  RouterConfigData,
  RouterConfigDivider,
  RouterConfigItem,
  RouterConfigTitle,
} from '@/modules/routesConfig';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {useSidebarContext} from '../../../utility/AppContextProvider/SidebarContextProvider';
import Toolbar from '@mui/material/Toolbar';
import defaultConfig from '../../../utility/AppContextProvider/defaultConfig';
import {styled, Theme, CSSObject} from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import {usePathname} from 'next/navigation';
import {matchRoute} from '@Oimmei-Digital-Boutique/crema-components';
import {useAuthUser} from '../../../utility/AuthHooks';
import {checkPermission} from '../../../utility/helper/RouteHelper';

/**
 * Following the docs for a collapsible permanent bar.
 * {@link https://mui.com/material-ui/react-drawer/#mini-variant-drawer}
 */
const openedMixin = (
  theme: Theme,
  drawerWidth: number | string,
): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(
  MuiDrawer,
  {
    shouldForwardProp: (prop) => prop !== 'open',
  },
)<{ width: number | string }>(
  (
    {
      theme,
      open,
      width,
    },
  ) => ({
    width: width,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme, width),
      '& .MuiDrawer-paper': openedMixin(theme, width),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

/**
 * Common interface for element props.
 */
interface SidebarListElementProps<
  T extends RouterConfigData = RouterConfigData>
  extends React.ComponentProps<typeof ListItem> {
  item: T;
  navCollapsed: boolean;
}

/**
 * Subcomponent to render a title element.
 */
const SidebarListTitleElement = (
  {item, navCollapsed, ...rest}: SidebarListElementProps<RouterConfigTitle>,
): ReactElement | null => {
  const t = useTranslations();

  return (
    <ListItem {...rest}>
      <ListItemText
        // Can't provide static validation for this. Using coercion here.
        primary={t(item.titleId as Parameters<typeof t>[0])}
        slotProps={{
          primary: {
            variant: 'caption',
          },
        }}
        sx={{
          opacity: !navCollapsed ? 1 : 0,
        }}
      />
    </ListItem>
  );
};

/**
 * Subcomponent to render an item (link).
 */
const SidebarListItemElement = React.forwardRef<HTMLLIElement,
  SidebarListElementProps<RouterConfigItem>>(
  (
    {item, navCollapsed, ...rest}: SidebarListElementProps<RouterConfigItem>,
    ref,
  ): ReactElement | null => {
    const t = useTranslations();

    const pathname = usePathname();

    // Wondering if this is better than using a state and an effect.
    // Without a clear answer, I'm choosing simplicity.
    const selected = item.url !== undefined ?
      matchRoute(pathname, item.url) || (
        item.matches !== undefined
        && item.matches
          .some(match => match
            .url !== undefined && matchRoute(pathname, match.url))
      ) : false;

    return (
      <ListItem ref={ref} disablePadding {...rest}>
        <ListItemButton
          component={Link}
          href={item.url ?? '#'}
          selected={selected}
          sx={{
            minHeight: 48,
            justifyContent: !navCollapsed ? 'initial' : 'center',
            px: 2.5,
          }}
        >
          {item.icon && (
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: !navCollapsed ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
          )}
          <ListItemText
            // Can't provide static validation for this. Using coercion here.
            primary={t(item.messageId as Parameters<typeof t>[0])}
            slotProps={{
              primary: {
                noWrap: true,
              },
            }}
            sx={{opacity: !navCollapsed ? 1 : 0}}
          />
        </ListItemButton>
      </ListItem>
    );
  },
);

/**
 * Subcomponent to render a divider element.
 */
const SidebarListDividerElement = (
  {}: SidebarListElementProps<RouterConfigDivider>,
): ReactElement | null => {
  return (
    <Divider component={'li'} sx={{marginY: 1}}/>
  );
};

const AppSidebar = (): ReactElement | null => {
  const t = useTranslations();

  // Used to check for permission against route configuration.
  const {user} = useAuthUser();

  const {sidebarWidth, navCollapsed} = useSidebarContext();

  return (
    <Drawer
      variant={'permanent'}
      open={!navCollapsed}
      width={sidebarWidth}
      sx={{
        flexShrink: 0,
      }}
    >
      {/*
        Dear future reader,

        I bet you're wondering what is an empty toolbar doing inside the
        sidebar of this project, and I'm happy to satisfy your curiosity.

        As crazy as it sounds, it looks like the recommended MUI way
        to have a sidebar under a header is to create an empty toolbar
        to match the height of the header one. This sounds very stupid
        to me as well, but that's what the docs say.

        https://mui.com/material-ui/react-drawer/#clipped-under-the-app-bar
      */}
      <Toolbar sx={{height: defaultConfig.header.headerHeight}}/>

      <List>
        {routesConfig.map((item) => {
          if (checkPermission(item.permittedRole, user?.role ?? undefined)) {
            switch (item.type) {
              case "title":
                return (
                  <SidebarListTitleElement
                    key={item.id}
                    item={item}
                    navCollapsed={navCollapsed}
                  />
                );
              case "item":
                if (!navCollapsed) {
                  return (
                    <SidebarListItemElement
                      key={item.id}
                      item={item}
                      navCollapsed={navCollapsed}
                    />
                  );
                } else {
                  return (
                    <Tooltip
                      key={item.id}
                      // Can't provide static validation for this. Using coercion here.
                      title={t(item.messageId as Parameters<typeof t>[0])}
                      placement={'right'}
                      arrow
                    >
                      <SidebarListItemElement
                        item={item}
                        navCollapsed={navCollapsed}
                      />
                    </Tooltip>
                  );
                }
              case "divider":
                return (
                  <SidebarListDividerElement
                    key={item.id}
                    item={item}
                    navCollapsed={navCollapsed}
                  />
                );
              default:
                return null;
            }
          } else {
            return null;
          }
        })}
      </List>
    </Drawer>
  );
};

export default AppSidebar;
