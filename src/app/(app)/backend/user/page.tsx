import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import {USER_CRUD_NEW} from '@/shared/constants/AppRoutes';
import LinkButton from '@/components/common/LinkButton';
import Content from './content';

/**
 * Metadata configuration in Next.js 15.
 *
 * @link https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('security.user_crud.page.index.title')} | ${t('messages.common.base_title')}`,
  };
}

/**
 * TODO: doesn't compile with Next.js 16 for no valid reason. I suspect a bug. I give up for now.
 */
export default function UserCrudList(): ReactElement {
  const t = useTranslations('security');

  return (
    <AppsSimpleContainer
      title={t("user_crud.page.index.title")}
      actionWrapper={
        <LinkButton variant={"contained"} href={USER_CRUD_NEW}>
          {t("btn.create_user")}
        </LinkButton>
      }
    >
      <Content/>
    </AppsSimpleContainer>
  );
};
