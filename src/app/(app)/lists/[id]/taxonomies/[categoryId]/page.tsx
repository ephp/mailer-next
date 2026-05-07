import React, {ReactElement} from 'react';
import {getTranslations} from 'next-intl/server';
import {Metadata} from 'next';
import AppsSimpleContainer from '@/@oimmei/core/AppsSimpleContainer';
import {MAIL_LIST_CRUD_LIST, TAXONOMY_CATEGORIES, TAXONOMY_TERM_NEW} from '@/shared/constants/AppRoutes';
import LinkButton from '@/components/common/LinkButton';
import Content from './content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t('taxonomy.page.terms.title')} | ${t('messages.common.base_title')}`,
  };
}

export default async function TaxonomyTermsPage({params}: {params: Promise<{id: string; categoryId: string}>}): Promise<ReactElement> {
  const t = await getTranslations();
  const {id, categoryId} = await params;
  const newTermHref = TAXONOMY_TERM_NEW.replace(':id', id).replace(':categoryId', categoryId);

  return (
    <AppsSimpleContainer
      title={[
        {label: t('maillist.page.index.title'), path: MAIL_LIST_CRUD_LIST},
        {label: t('taxonomy.page.categories.title'), path: TAXONOMY_CATEGORIES.replace(':id', id)},
        t('taxonomy.page.terms.title'),
      ]}
      actionWrapper={
        <LinkButton variant="contained" href={newTermHref}>
          {t('taxonomy.btn.new_term')}
        </LinkButton>
      }
      hasMaxWidth
    >
      <Content/>
    </AppsSimpleContainer>
  );
}
