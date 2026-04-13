import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {useTranslations} from 'next-intl';
import {USER_CRUD_LIST} from '@/shared/constants/AppRoutes';
import Content from './content';

/**
 * Metadata configuration in Next.js 15.
 *
 * @link https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: `${t('security.user_crud.page.edit.title')} | ${t('messages.common.base_title')}`,
  };
}

export default function UserCrudEdit(): ReactElement {
  const t = useTranslations('security');

  return (
    <AppsSimpleContainer
      title={[
        {
          label: t("user_crud.page.index.title"),

          path: USER_CRUD_LIST,
        },
        t("user_crud.page.edit.title"),
      ]}
      hasMaxWidth
    >
      <Content/>
    </AppsSimpleContainer>
  );
};
