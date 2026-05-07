'use client';

import React, {ReactElement, useCallback, useEffect, useMemo, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {useSnackbar} from 'notistack';
import {useTranslations} from 'next-intl';
import TagForm from '@/@oimmei/bundle/tag/component/form/TagForm';
import {TaxonomyTerm} from '@/types/models/TaxonomyTerm';
import {taxonomyTermsHelper} from '@/shared/helpers/api/taxonomyTermApiHelper';
import {TAXONOMY_TERMS} from '@/shared/constants/AppRoutes';

const TaxonomyTermEditContent = (): ReactElement => {
  const t = useTranslations();
  const router = useRouter();
  const {enqueueSnackbar} = useSnackbar();
  const {id: listIdParam, categoryId: categoryIdParam, termId: termIdParam} = useParams<{
    id: string; categoryId: string; termId: string;
  }>();
  const categoryId = parseInt(categoryIdParam);
  const termId = parseInt(termIdParam);

  const helper = useMemo(() => taxonomyTermsHelper(categoryId), [categoryId]);
  const listRoute = generatePathStorage(TAXONOMY_TERMS, {
    id: listIdParam,
    categoryId: categoryIdParam,
  });

  const [term, setTerm] = useState<TaxonomyTerm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    helper.findTag({id: termId})
      .then((result) => setTerm(result.item ?? null))
      .catch((err) => {
        console.error(err);
        enqueueSnackbar({message: t('taxonomy.error.term_not_found'), variant: 'error'});
        router.push(listRoute);
      })
      .finally(() => setLoading(false));
  }, [helper, termId, enqueueSnackbar, t, router, listRoute]);

  const onCompleted = useCallback(() => {
    enqueueSnackbar({message: t('taxonomy.success.term_updated'), variant: 'success'});
    router.push(listRoute);
  }, [enqueueSnackbar, t, router, listRoute]);

  return (
    <TagForm<TaxonomyTerm>
      tag={term}
      loading={loading}
      listRoute={listRoute}
      saveTagAction={helper.updateTag.bind(helper)}
      onOperationCompleted={onCompleted}
    />
  );
};

export default TaxonomyTermEditContent;
