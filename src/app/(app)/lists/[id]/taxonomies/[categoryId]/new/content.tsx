'use client';

import React, {ReactElement, useCallback, useMemo} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {useSnackbar} from 'notistack';
import {useTranslations} from 'next-intl';
import TagForm from '@/@oimmei/bundle/tag/component/form/TagForm';
import {newTaxonomyTerm, TaxonomyTerm} from '@/types/models/TaxonomyTerm';
import {taxonomyTermsHelper} from '@/shared/helpers/api/taxonomyTermApiHelper';
import {TAXONOMY_TERMS} from '@/shared/constants/AppRoutes';

const TaxonomyTermNewContent = (): ReactElement => {
  const t = useTranslations();
  const router = useRouter();
  const {enqueueSnackbar} = useSnackbar();
  const {id: listIdParam, categoryId: categoryIdParam} = useParams<{id: string; categoryId: string}>();
  const categoryId = parseInt(categoryIdParam);

  const helper = useMemo(() => taxonomyTermsHelper(categoryId), [categoryId]);
  const listRoute = generatePathStorage(TAXONOMY_TERMS, {
    id: listIdParam,
    categoryId: categoryIdParam,
  });

  const onCompleted = useCallback(() => {
    enqueueSnackbar({message: t('taxonomy.success.term_created'), variant: 'success'});
    router.push(listRoute);
  }, [enqueueSnackbar, t, router, listRoute]);

  return (
    <TagForm<TaxonomyTerm>
      tag={newTaxonomyTerm(categoryId)}
      listRoute={listRoute}
      saveTagAction={helper.createTag.bind(helper)}
      onOperationCompleted={onCompleted}
    />
  );
};

export default TaxonomyTermNewContent;
