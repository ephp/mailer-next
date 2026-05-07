import {oiFetch} from '@/@oimmei/services/auth';
import {DetailResult} from '@Oimmei-Digital-Boutique/crema-components';
import {TaxonomyCategory} from '@/types/models/TaxonomyCategory';
import {TaxonomyTerm} from '@/types/models/TaxonomyTerm';

// ── Categories ────────────────────────────────────────────────────────────────

export const getTaxonomyCategoryList = async (
  {listId}: {listId: number},
): Promise<DetailResult<TaxonomyCategory[]>> => {
  const {data} = await oiFetch.get<DetailResult<TaxonomyCategory[]>>(
    `/lists/${listId}/taxonomy-categories`,
  );
  return data;
};

export const findTaxonomyCategory = async (
  {listId, id}: {listId: number; id: number},
): Promise<DetailResult<TaxonomyCategory>> => {
  const {data} = await oiFetch.get<DetailResult<TaxonomyCategory>>(
    `/lists/${listId}/taxonomy-categories/${id}`,
  );
  return data;
};

export const createTaxonomyCategory = async (
  {listId, name}: {listId: number; name: string},
): Promise<DetailResult<TaxonomyCategory>> => {
  const {data} = await oiFetch.post<DetailResult<TaxonomyCategory>>(
    `/lists/${listId}/taxonomy-categories-new`,
    {taxonomy_category: {name}},
  );
  return data;
};

export const updateTaxonomyCategory = async (
  {listId, id, name}: {listId: number; id: number; name: string},
): Promise<DetailResult<TaxonomyCategory>> => {
  const {data} = await oiFetch.post<DetailResult<TaxonomyCategory>>(
    `/lists/${listId}/taxonomy-categories/${id}/edit`,
    {taxonomy_category: {name}},
  );
  return data;
};

export const deleteTaxonomyCategory = async (
  {listId, id}: {listId: number; id: number},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>(
    `/lists/${listId}/taxonomy-categories/${id}/delete`,
  );
  return data;
};

// ── Terms ─────────────────────────────────────────────────────────────────────

export const getTaxonomyTermList = async (
  {listId, categoryId}: {listId: number; categoryId: number},
): Promise<DetailResult<TaxonomyTerm[]>> => {
  const {data} = await oiFetch.get<DetailResult<TaxonomyTerm[]>>(
    `/lists/${listId}/taxonomy-categories/${categoryId}/terms`,
  );
  return data;
};

export const createTaxonomyTerm = async (
  {listId, categoryId, name}: {listId: number; categoryId: number; name: string},
): Promise<DetailResult<TaxonomyTerm>> => {
  const {data} = await oiFetch.post<DetailResult<TaxonomyTerm>>(
    `/lists/${listId}/taxonomy-categories/${categoryId}/terms-new`,
    {taxonomy_term: {name}},
  );
  return data;
};

export const updateTaxonomyTerm = async (
  {listId, categoryId, id, name}: {listId: number; categoryId: number; id: number; name: string},
): Promise<DetailResult<TaxonomyTerm>> => {
  const {data} = await oiFetch.post<DetailResult<TaxonomyTerm>>(
    `/lists/${listId}/taxonomy-categories/${categoryId}/terms/${id}/edit`,
    {taxonomy_term: {name}},
  );
  return data;
};

export const deleteTaxonomyTerm = async (
  {listId, categoryId, id}: {listId: number; categoryId: number; id: number},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>(
    `/lists/${listId}/taxonomy-categories/${categoryId}/terms/${id}/delete`,
  );
  return data;
};

// ── Contact taxonomy ──────────────────────────────────────────────────────────

export const getContactTaxonomy = async (
  {listId, contactId}: {listId: number; contactId: number},
): Promise<DetailResult<{term_ids: number[]}>> => {
  const {data} = await oiFetch.get<DetailResult<{term_ids: number[]}>>(
    `/lists/${listId}/contacts/${contactId}/taxonomy`,
  );
  return data;
};

export const syncContactTaxonomy = async (
  {listId, contactId, termIds}: {listId: number; contactId: number; termIds: number[]},
): Promise<DetailResult<{term_ids: number[]}>> => {
  const {data} = await oiFetch.post<DetailResult<{term_ids: number[]}>>(
    `/lists/${listId}/contacts/${contactId}/taxonomy-sync`,
    {term_ids: termIds},
  );
  return data;
};
