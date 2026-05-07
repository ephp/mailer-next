export type TaxonomyCategory = {
  id: number;
  name: string;
  mailListId: number;
  termCount: number;
};

export const newTaxonomyCategory = (): Omit<TaxonomyCategory, 'id' | 'mailListId' | 'termCount'> => ({
  name: '',
});
