import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {
  Campaign,
  CampaignFilter,
  CampaignListFilter,
  CampaignMailList,
  CampaignStats,
  CampaignStatus,
  CampaignStructure,
} from '@/types/models/Campaign';

// ─── V1 API types ────────────────────────────────────────────────────────────

type CampaignApiPayload = {
  id: number;
  name: string | null;
  emailSubject: string;
  snippet: string | null;
  body: string | null;
  structure: CampaignStructure | null;
  composition: Record<string, unknown> | null;
  filter: CampaignFilter | null;
  draft: boolean;
  template: boolean;
  status: CampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  clonedFromId: number | null;
  accountId: number | null;
  mailListIds: number[];
  mailLists: CampaignMailList[];
  recipientCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

type RecipientsCountPayload = {
  count: number;
};

const mapCampaignFromApi = (raw: CampaignApiPayload): Campaign => ({
  id: raw.id,
  name: raw.name,
  email_subject: raw.emailSubject,
  snippet: raw.snippet,
  body: raw.body,
  structure: raw.structure,
  composition: raw.composition,
  filter: raw.filter,
  draft: raw.draft,
  template: raw.template,
  status: raw.status,
  scheduled_at: raw.scheduledAt,
  sent_at: raw.sentAt,
  cloned_from_id: raw.clonedFromId,
  account_id: raw.accountId,
  mail_list_ids: raw.mailListIds,
  mail_lists: raw.mailLists,
  recipient_count: raw.recipientCount,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
});

const mapDetailFromApi = (raw: DetailResult<CampaignApiPayload>): DetailResult<Campaign> => ({
  ...raw,
  item: raw.item ? mapCampaignFromApi(raw.item) : undefined,
});

const mapPaginatedFromApi = (raw: PaginatedResult<CampaignApiPayload>): PaginatedResult<Campaign> => ({
  ...raw,
  items: raw.items ? raw.items.map(mapCampaignFromApi) : [],
});

// ─── V1 API helpers ───────────────────────────────────────────────────────────

export const getCampaigns = async ({
  page,
  perPage,
  filter,
}: {
  page?: number;
  perPage?: number;
  filter?: {status?: CampaignStatus; template?: boolean; sort?: string; direction?: string};
}): Promise<PaginatedResult<Campaign>> => {
  const {data} = await oiFetch.get<PaginatedResult<CampaignApiPayload>>('/campaigns', {
    params: {
      page: page ?? 1,
      per_page: perPage ?? 20,
      status: filter?.status,
      template: filter?.template ?? false,
      sort: filter?.sort ?? 'createdAt',
      direction: filter?.direction ?? 'desc',
    },
  });
  return mapPaginatedFromApi(data);
};

export const getCampaign = async (id: number): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.get<DetailResult<CampaignApiPayload>>(`/campaigns/${id}`);
  return mapDetailFromApi(data);
};

export const createCampaign = async (payload?: {fromTemplateId?: number}): Promise<DetailResult<Campaign>> => {
  const body = payload?.fromTemplateId != null ? {fromTemplateId: payload.fromTemplateId} : {};
  const {data} = await oiFetch.post<DetailResult<CampaignApiPayload>>('/campaigns', body);
  return mapDetailFromApi(data);
};

export const updateCampaign = async (
  id: number,
  partial: {
    name?: string | null;
    emailSubject?: string;
    snippet?: string | null;
    body?: string | null;
    structure?: CampaignStructure | null;
    composition?: Record<string, unknown> | null;
    filter?: CampaignFilter | null;
    mailListIds?: number[];
    scheduledAt?: string | null;
  },
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.patch<DetailResult<CampaignApiPayload>>(`/campaigns/${id}`, partial);
  return mapDetailFromApi(data);
};

export const deleteCampaign = async (id: number): Promise<void> => {
  await oiFetch.delete(`/campaigns/${id}`);
};

export const getRecipientsCount = async (
  mailListIds: number[],
  filter?: CampaignFilter,
): Promise<number> => {
  const {data} = await oiFetch.post<DetailResult<RecipientsCountPayload>>('/campaigns/recipients-count', {
    mailListIds,
    filter: filter ?? {},
  });
  return data.item?.count ?? 0;
};

// ─── Legacy helpers (old API — kept for backwards compatibility) ───────────────

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

export const createCampaignLegacy = async (
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

export const updateCampaignLegacy = async (
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

export const deleteCampaignLegacy = async (
  {id}: {id: Campaign['id']},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>(`/campaigns/${id}/delete`);
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

export const getCampaignStats = async (
  {id}: {id: Campaign['id']},
): Promise<DetailResult<CampaignStats>> => {
  const {data} = await oiFetch.get<DetailResult<CampaignStats>>(`/campaigns/${id}/stats`);
  return data;
};

export const getTemplateList = async (
  {sortBy, sortDirection, page, perPage}: PaginatedQuery<Campaign, CampaignListFilter>,
): Promise<PaginatedResult<Campaign>> => {
  const {data} = await oiFetch.get<PaginatedResult<Campaign>>('/campaign-templates', {
    params: {
      page,
      per_page: perPage,
      sortBy,
      sortMode: sortDirection,
    },
  });
  return data;
};

export const duplicateCampaign = async (
  {id}: {id: Campaign['id']},
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<Campaign>>(`/campaigns/${id}/duplicate`);
  return data;
};

export const saveAsTemplate = async (
  {id}: {id: Campaign['id']},
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<Campaign>>(`/campaigns/${id}/save-as-template`);
  return data;
};
