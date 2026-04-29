import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {Campaign, CampaignListFilter} from '@/types/models/Campaign';

export interface SendCampaignOptions {
  scheduled_at?: string | null;
}

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
    structure: entity.structure,
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
    structure: entity.structure,
  });
  return data;
};

export const sendTestEmail = async (
  {id, email}: {id: Campaign['id']; email: string},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>(`/campaigns/${id}/test-email`, {email});
  return data;
};

export const sendCampaign = async (
  {id, options}: {id: Campaign['id']; options: SendCampaignOptions},
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<Campaign>>(`/campaigns/${id}/send`, options);
  return data;
};

export const deleteCampaign = async (
  {id}: {id: Campaign['id']},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>(`/campaigns/${id}/delete`);
  return data;
};
