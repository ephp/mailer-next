import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {MAIL_LIST_CRUD_LIST, TAXONOMY_CATEGORIES, TAXONOMY_TERMS} from '@/shared/constants/AppRoutes';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t('taxonomy.page.new_term.title')} | ${t('messages.common.base_title')}`,
  };
}

export default async function TaxonomyTermNewPage({params}: {params: Promise<{id: string; categoryId: string}>}): Promise<ReactElement> {
  const t = await getTranslations();
  const {id, categoryId} = await params;

  return (
    <AppsSimpleContainer
      title={[
        {label: t('maillist.page.index.title'), path: MAIL_LIST_CRUD_LIST},
        {label: t('taxonomy.page.categories.title'), path: TAXONOMY_CATEGORIES.replace(':id', id)},
        {label: t('taxonomy.page.terms.title'), path: TAXONOMY_TERMS.replace(':id', id).replace(':categoryId', categoryId)},
        t('taxonomy.page.new_term.title'),
      ]}
      hasMaxWidth
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
