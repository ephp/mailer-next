import {Tag} from '@/@oimmei/bundle/tag/type/model/Tag';

export interface TaxonomyTerm extends Tag {
  categoryId: number;
}

export const newTaxonomyTerm = (categoryId: number): TaxonomyTerm => ({
  id: 0,
  label: '',
  color: '#000000',
  icon: null,
  categoryId,
});
