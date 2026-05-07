'use client';

import React, {ReactElement, useMemo} from 'react';
import {useParams} from 'next/navigation';
import TagListComponent from '@/@oimmei/bundle/tag/component/index/TagListComponent';
import {TaxonomyTerm} from '@/types/models/TaxonomyTerm';
import {taxonomyTermsHelper} from '@/shared/helpers/api/taxonomyTermApiHelper';
import {TAXONOMY_TERM_EDIT} from '@/shared/constants/AppRoutes';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';

const TaxonomyTermsContent = (): ReactElement => {
  const {id: listIdParam, categoryId: categoryIdParam} = useParams<{id: string; categoryId: string}>();
  const categoryId = parseInt(categoryIdParam);

  const helper = useMemo(() => taxonomyTermsHelper(categoryId), [categoryId]);

  const editRoute = generatePathStorage(TAXONOMY_TERM_EDIT, {
    id: listIdParam,
    categoryId: categoryIdParam,
    termId: ':id',
  });

  return (
    <TagListComponent<TaxonomyTerm>
      getAllTagsAction={helper.allTag.bind(helper)}
      deleteTagAction={helper.deleteTag.bind(helper)}
      editRoute={editRoute}
    />
  );
};

export default TaxonomyTermsContent;
