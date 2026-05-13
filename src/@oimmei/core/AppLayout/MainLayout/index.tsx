'use client';

import React, {ReactElement, useState} from 'react';
import Stack from '@mui/material/Stack';
import {useTranslations} from 'next-intl';
import {useAuthMethod, useAuthUser} from '../../../utility/AuthHooks';
import Button from '@mui/material/Button';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from 'next/link';
import {PROFILE_MY_ACCOUNT} from '@/shared/constants/AppRoutes';

/**
 * Subcomponent for the user menu.
 */
const UserAuthMenuBox = (): ReactElement | null => {
  const t = useTranslations('security');

  const {user} = useAuthUser();
  const {logout} = useAuthMethod();

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleOpenUserMenu =
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        id="menu-appbar-button"
        aria-controls={Boolean(anchorEl) ? 'menu-appbar' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
        onClick={handleOpenUserMenu}
        startIcon={<AccountCircle/>}
        color={'primary'}
        variant={'text'}
      >
        {user?.displayName}
      </Button>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
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
    </>
  );
};

/**
 * A mostly blank layout, with no header, no menu and
 * only a profile handling button on the top.
 *
 * Created to display a QRCode for Ciclostazione.
 */
const MainLayout = (
  {children}: {
    children: React.ReactNode
  },
): ReactElement | null => {
  return (
    <Stack
      justifyContent={'center'}
      alignItems={'center'}
      gap={'32px'}
      paddingY={4}
      paddingX={2}
      width={1}
    >
      <UserAuthMenuBox/>

      {children}
    </Stack>
  );
};

export default MainLayout;
