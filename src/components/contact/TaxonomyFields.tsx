'use client';

import React, {ReactElement, useEffect, useState} from 'react';
import Stack from '@mui/material/Stack';
import AutocompleteTag from '@/@oimmei/bundle/tag/component/field/AutocompleteTag';
import {Tag} from '@/@oimmei/bundle/tag/type/model/Tag';
import {TaxonomyCategory} from '@/types/models/TaxonomyCategory';
import {TaxonomyTerm} from '@/types/models/TaxonomyTerm';
import {taxonomyTermsHelper} from '@/shared/helpers/api/taxonomyTermApiHelper';

interface Props {
  categories: TaxonomyCategory[];
  selectedTermIds: number[];
  onChange: (termIds: number[]) => void;
  loading?: boolean;
}

const TaxonomyFields = ({categories, selectedTermIds, onChange, loading = false}: Props): ReactElement => {
  // For each category, the full list of available terms (used to map ids ↔ tags).
  const [termsByCategory, setTermsByCategory] = useState<Record<number, TaxonomyTerm[]>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      categories.map(async (cat) => {
        const result = await taxonomyTermsHelper(cat.id).allTag();
        return [cat.id, result.item ?? []] as const;
      }),
    ).then((entries) => {
      if (!cancelled) {
        setTermsByCategory(Object.fromEntries(entries));
      }
    }).catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [categories]);

  const handleCategoryChange = (categoryId: number, newTags: Tag[]): void => {
    const knownTerms = termsByCategory[categoryId] ?? [];
    const knownIds = new Set(knownTerms.map(t => t.id));

    // A tag created on-the-fly via the autocomplete won't be in our cache yet:
    // append it so it's rendered as a chip and treated as belonging to this category.
    const freshlyCreated = newTags.filter(t => !knownIds.has(t.id)) as TaxonomyTerm[];
    if (freshlyCreated.length > 0) {
      setTermsByCategory(prev => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] ?? []), ...freshlyCreated],
      }));
    }

    const categoryTermIds = [
      ...Array.from(knownIds),
      ...freshlyCreated.map(t => t.id),
    ];
    const otherCategoryTermIds = selectedTermIds.filter(id => !categoryTermIds.includes(id));
    onChange([...otherCategoryTermIds, ...newTags.map(t => t.id)]);
  };

  return (
    <Stack spacing={3}>
      {categories.map((category) => {
        const helper = taxonomyTermsHelper(category.id);
        const categoryTerms = termsByCategory[category.id] ?? [];
        const selectedForCategory = categoryTerms.filter(t => selectedTermIds.includes(t.id));

        return (
          <AutocompleteTag<true>
            key={category.id}
            multiple
            label={category.name}
            value={selectedForCategory}
            fetchAllTags={helper.allTag.bind(helper)}
            createTag={helper.autocompleteCreateTag.bind(helper)}
            onChange={(_event, newValue) => handleCategoryChange(category.id, newValue as Tag[])}
            loading={loading}
          />
        );
      })}
    </Stack>
  );
};

export default TaxonomyFields;
