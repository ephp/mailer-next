import React, {ReactElement} from 'react';
import {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import Content from './content';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Link from 'next/link';
import {PROFILE_MY_ACCOUNT, PROFILE_PASSWORD} from '@/shared/constants/AppRoutes';

/**
 * Metadata configuration in Next.js 15.
 *
 * @link https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('security.profile.page.main.title')} | ${t('messages.common.base_title')}`,
  };
}

export async function generateStaticParams(): Promise<{ page: string }[]> {
  /**
   * Statically generating the two available pages for this route.
   */
  return ['my-account', 'password'].map(page => ({
    page,
  }));
}

/**
 * Helper for the tabs.
 */
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default async function MyAccount(
  {params}: {
    params: Promise<{ page: 'my-account' | 'password' }>
  },
): Promise<ReactElement> {
  const t = await getTranslations('security');

  const page = (await params).page;

  // Setting the tab value according to the page.
  const value = page === 'password' ? 1 : 0;

  const tabs = [
    {
      id: 1,
      icon: <PersonIcon/>,
      name: t('profile.page.personal_info.title'),
      href: PROFILE_MY_ACCOUNT,
    },
    {
      id: 2,
      icon: <LockIcon/>,
      name: t('profile.page.change_password.title'),
      href: PROFILE_PASSWORD,
    },
  ];

  return (
    <AppsSimpleContainer
      title={t("profile.page.main.title")}
      subheaderBottomWrapper={
        <Tabs
          className="account-tabs"
          value={value}
          variant="scrollable"
          scrollButtons="auto"
          aria-label={t("profile.page.main.title")}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              label={tab.name}
              className="account-tab"
              component={Link}
              href={tab.href}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      }
      hasMaxWidth
    >
      <Content page={page}/>
    </AppsSimpleContainer>
  );
}
