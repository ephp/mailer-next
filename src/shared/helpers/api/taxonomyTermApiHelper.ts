import {TagApiHelper} from "@/@oimmei/bundle/tag/helper/api/tagApiHelper";
import {TaxonomyTerm} from "@/types/models/TaxonomyTerm";

const TAXONOMY_TERMS_BASE_URL = '/list-taxonomy-terms';

/**
 * Returns a TagApiHelper scoped to a single TaxonomyCategory.
 * Every request will carry `?category_id=<id>` as a query parameter so the backend
 * TagSubscriber can attach the term to the correct category.
 */
export const taxonomyTermsHelper = (categoryId: number): TagApiHelper<TaxonomyTerm> =>
  new TagApiHelper<TaxonomyTerm>({
    baseUrl: TAXONOMY_TERMS_BASE_URL,
    entityName: 'taxonomy_term',
    extraParams: {category_id: categoryId},
  });
