import * as React from 'react';
import AppContextProvider from '@/@oimmei/utility/AppContextProvider';
import {
  default as AsyncCallHelper2Provider,
} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import CookieAuthProvider from '@/@oimmei/services/auth/cookie-auth/CookieAuthProvider';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages, getTranslations} from 'next-intl/server';
import theme from '@/theme';
import {Metadata, Viewport} from 'next';

/**
 * Metadata configuration in Next.js 15.
 *
 * @link https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('messages');

  return {
    // TODO: customize this.
    title: t('common.base_title'),
    description: t('common.base_description'),
  };
}

/**
 * Viewport configuration in Next.js 15.
 *
 * @link https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 */
export const viewport: Viewport = {
  // Must match the primary color in MUI theme.
  // I couldn't find a way to get it directly from there in a server component.
  themeColor: '#556cd6',

  // TODO: change for dark mode.
  colorScheme: 'only light',
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  // Setting up translations for the client.
  // https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      // Prevents elastic scrolling on macOS
      // https://forums.tumult.com/t/disable-elastic-scrolling-in-mac-os-x/2024/3
      style={{height: '100%'}}
    >
    <body>
    {/* TODO: import this if you need dark mode. */}
    {/*<InitColorSchemeScript attribute="class"/>*/}
    <AppRouterCacheProvider options={{enableCssLayer: true}}>
      <ThemeProvider theme={theme}>
        <NextIntlClientProvider messages={messages}>
          <AppContextProvider>
            <AsyncCallHelper2Provider>
              <CookieAuthProvider>
                {/*
                  CssBaseline kickstart an elegant, consistent,
                  and simple baseline to build upon.
                 */}
                <CssBaseline/>
                {props.children}
              </CookieAuthProvider>
            </AsyncCallHelper2Provider>
          </AppContextProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
    </body>
    </html>
  );
}
