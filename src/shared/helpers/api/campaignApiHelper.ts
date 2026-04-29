import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {Campaign, CampaignListFilter} from '@/types/models/Campaign';

export const getCampaignList = async (
  {sortBy, sortDirection, page, perPage}: PaginatedQuery<Campaign, CampaignListFilter>,
): Promise<PaginatedResult<Campaign>> => {
  const {data} = await oiFetch.get<PaginatedResult<Campaign>>('/campaigns', {
    params: {
      page,
      per_page: perPage,
      sortBy,
      sortMode: sortDirection,
    },
  });
  return data;
};

export const findCampaign = async (
  {id}: {id: Campaign['id']},
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.get<DetailResult<Campaign>>(`/campaigns/${id}`);
  return data;
};

export const createCampaign = async (
  {entity}: {entity: Campaign},
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<Campaign>>('/campaigns-new', {
    campaign: {
      name: entity.name,
      emailSubject: entity.email_subject,
      snippet: entity.snippet,
      body: entity.body,
      draft: entity.draft,
    },
    mail_list_ids: entity.mail_list_ids,
  });
  return data;
};

export const updateCampaign = async (
  {entity}: {entity: Campaign},
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<Campaign>>(`/campaigns/${entity.id}/edit`, {
    campaign: {
      name: entity.name,
      emailSubject: entity.email_subject,
      snippet: entity.snippet,
      body: entity.body,
      draft: entity.draft,
    },
    mail_list_ids: entity.mail_list_ids,
  });
  return data;
};

export const deleteCampaign = async (
  {id}: {id: Campaign['id']},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>(`/campaigns/${id}/delete`);
  return data;
};
