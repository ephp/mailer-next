'use client';

import React, {ReactElement, useState} from 'react';
import Box, {BoxProps} from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import defaultConfig from '../../../utility/AppContextProvider/defaultConfig';
import {useSidebarActionsContext} from '../../../utility/AppContextProvider/SidebarContextProvider';
import {useAuthMethod, useAuthUser} from '../../../utility/AuthHooks';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from 'next/link';
import {PROFILE_MY_ACCOUNT} from '@/shared/constants/AppRoutes';
import {useTranslations} from 'next-intl';
import Button from '@mui/material/Button';

/**
 * Subcomponent for the user menu.
 */
const UserAuthMenuBox = (
  props: BoxProps,
): ReactElement | null => {
  const t = useTranslations('security');

  const {user} = useAuthUser();
  const {logout} = useAuthMethod();

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box {...props}>
      <Button
        id="menu-appbar-button"
        aria-controls={Boolean(anchorEl) ? 'menu-appbar' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
        onClick={handleOpenUserMenu}
        startIcon={<AccountCircle/>}
        color={'info'}
        variant={'text'}
      >
        {user?.displayName}
      </Button>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleCloseUserMenu}
        MenuListProps={{
          'aria-labelledby': 'menu-appbar-button',
        }}
      >
        <MenuItem
          component={Link}
          href={PROFILE_MY_ACCOUNT}
        >
          {t("profile.page.main.title")}
        </MenuItem>
        <MenuItem
          onClick={logout}
        >
          {t("btn.logout")}
        </MenuItem>
      </Menu>
    </Box>
  );
};

const AppHeader = (): ReactElement | null => {
  const {toggleNavCollapsed} = useSidebarActionsContext();

  return (
    // flexGrow required for full width.
    <Box flexGrow={1}>
      <AppBar
        position={'fixed'}
        sx={{zIndex: (theme) => (theme.vars ?? theme).zIndex.drawer + 1}}
        elevation={0}
      >
        <Toolbar sx={{height: defaultConfig.header.headerHeight}}>
          <IconButton
            onClick={toggleNavCollapsed}
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{marginRight: 2}}
          >
            <MenuIcon/>
          </IconButton>
          <UserAuthMenuBox marginLeft={'auto'}/>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default AppHeader;
