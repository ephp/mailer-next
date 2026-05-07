import React, {ReactElement} from 'react';
import {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import Content from './content';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import {PROFILE_MY_ACCOUNT, PROFILE_PASSWORD} from '@/shared/constants/AppRoutes';
import ProfileTabs from '@/components/profile/ProfileTabs';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('security.profile.page.main.title')} | ${t('messages.common.base_title')}`,
  };
}

export async function generateStaticParams(): Promise<{ page: string }[]> {
  return ['my-account', 'password'].map(page => ({
    page,
  }));
}

export default async function MyAccount(
  {params}: {
    params: Promise<{ page: 'my-account' | 'password' }>
  },
): Promise<ReactElement> {
  const t = await getTranslations('security');

  const page = (await params).page;
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
        <ProfileTabs value={value} tabs={tabs} ariaLabel={t("profile.page.main.title")}/>
      }
      hasMaxWidth
    >
      <Content page={page}/>
    </AppsSimpleContainer>
  );
}
