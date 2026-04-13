'use client';
import React, {ReactNode} from 'react';
import SidebarContextProvider from './SidebarContextProvider';
import LocaleContextProvider from './LocaleContextProvider';
import {SnackbarProvider} from 'notistack';
import {
  CremaComponentProvider,
  CremaComponentLocale,
} from '@Oimmei-Digital-Boutique/crema-components';
import {useLocale} from 'next-intl';

interface AppContextProviderProps {
  children: ReactNode;
}

const AppContextProvider: React.FC<AppContextProviderProps> = (
  {children},
) => {
  const locale = useLocale();

  return (
    <LocaleContextProvider>
      <SidebarContextProvider>
        <CremaComponentProvider locale={locale as CremaComponentLocale}>
          <SnackbarProvider
            anchorOrigin={{
              horizontal: 'right',
              vertical: 'bottom',
            }}
            autoHideDuration={10000}
            maxSnack={3}
            style={{
              // Respect new lines in the text (\n):
              // https://github.com/iamhosseindhv/notistack/issues/32
              whiteSpace: 'pre-line',
            }}
          >
            {children}
          </SnackbarProvider>
        </CremaComponentProvider>
      </SidebarContextProvider>
    </LocaleContextProvider>
  );
};

export default AppContextProvider;
