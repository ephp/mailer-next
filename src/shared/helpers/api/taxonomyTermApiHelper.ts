import {TagApiHelper} from "@/@oimmei/bundle/tag/helper/api/tagApiHelper";
import {Tag, TagFilter} from "@/@oimmei/bundle/tag/type/model/Tag";

const tagApiHelper = new TagApiHelper<Tag, TagFilter>('/backend/time-type');

// Esporta i metodi per mantenere la compatibilità con il codice esistente
export const allTimeType =
  tagApiHelper.allTag.bind(tagApiHelper);
export const getTimeTypes =
  tagApiHelper.getTags.bind(tagApiHelper);
export const findTimeType =
  tagApiHelper.findTag.bind(tagApiHelper);
export const createTimeType =
  tagApiHelper.createTag.bind(tagApiHelper);
export const autocompleteCreateTimeType =
  tagApiHelper.autocompleteCreateTag.bind(tagApiHelper);
export const updateTimeType =
  tagApiHelper.updateTag.bind(tagApiHelper);
export const deleteTimeType =
  tagApiHelper.deleteTag.bind(tagApiHelper);