import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {baseUrl} from '@/shared/constants/AppConst';
import {
  Campaign,
  CampaignFilter,
  CampaignListFilter,
  CampaignAttachment,
  CampaignMailList,
  CampaignStats,
  CampaignStatus,
  CampaignStructure,
} from '@/types/models/Campaign';
import {EmailTemplatePreset, PreviewResponse, TestEmailResponse} from '@/types/models/EmailTemplate';
import {SendCampaignResponse, SendingStatus} from '@/types/models/CampaignEmail';

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
  /** Backend exposes the named list as `mailListNames` (id+name pairs). */
  mailListNames?: CampaignMailList[];
  recipientCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  statsSent?: number | null;
  statsUniqueOpens?: number | null;
  statsUniqueClicks?: number | null;
  attachments?: CampaignAttachment[];
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
  mail_lists: raw.mailListNames ?? [],
  attachments: raw.attachments ?? [],
  recipient_count: raw.recipientCount,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
  stats_sent: raw.statsSent ?? null,
  stats_unique_opens: raw.statsUniqueOpens ?? null,
  stats_unique_clicks: raw.statsUniqueClicks ?? null,
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
  filter?: {status?: CampaignStatus; template?: boolean; sort?: string; direction?: string; fts?: string};
}): Promise<PaginatedResult<Campaign>> => {
  const {data} = await oiFetch.get<PaginatedResult<CampaignApiPayload>>('/campaigns', {
    params: {
      page: page ?? 1,
      per_page: perPage ?? 20,
      status: filter?.status,
      template: filter?.template ?? false,
      sort: filter?.sort ?? 'createdAt',
      direction: filter?.direction ?? 'desc',
      fts: filter?.fts ?? undefined,
    },
  });
  return mapPaginatedFromApi(data);
};

export const scheduleCampaign = async (
  id: number,
  scheduledAt: string | null,
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<CampaignApiPayload>>(`/campaigns/${id}/schedule`, {
    scheduled_at: scheduledAt,
  });
  return mapDetailFromApi(data);
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
  // Bypass OiFetch: it always tries `await response.json()`, which throws on
  // an empty body (the backend returns 204 No Content for successful deletes).
  const response = await fetch(`${baseUrl}/campaigns/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {'Oi-Cookie-Auth': '1'},
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Delete failed: ${response.status}`);
  }
};

export const getRecipientsCount = async (
  mailListIds: number[],
  filter?: CampaignFilter,
): Promise<number> => {
  const {data} = await oiFetch.post<DetailResult<RecipientsCountPayload>>('/campaigns/recipients-count', {
    mailListIds,
    filter: {
      taxonomyTermIds: filter?.taxonomy_term_ids ?? [],
    },
  });
  return data.item?.count ?? 0;
};

export const getCampaignsPaginated = async ({
  page,
  perPage,
  filters,
}: PaginatedQuery<Campaign, CampaignListFilter>): Promise<PaginatedResult<Campaign>> => {
  return getCampaigns({
    page,
    perPage,
    filter: {
      status: filters?.status,
      template: false,
      fts: filters?.fts && filters.fts.trim() !== '' ? filters.fts.trim() : undefined,
    },
  });
};

// ─── V1 template / preview helpers ───────────────────────────────────────────

type PreviewApiPayload = {html: string; plainText: string};
type TestEmailApiPayload = {sent: number; failed: number; errors?: string[]};
type TemplatePresetApiPayload = {id: string; name: string; description: string; thumbnailUrl: string};

export const getCampaignPreview = async (
  id: number,
  viewport: 'desktop' | 'mobile' = 'desktop',
): Promise<DetailResult<PreviewResponse>> => {
  const {data} = await oiFetch.get<DetailResult<PreviewApiPayload>>(`/campaigns/${id}/preview`, {
    params: {viewport},
  });
  return {
    ...data,
    item: data.item ? {html: data.item.html, plain_text: data.item.plainText} : undefined,
  };
};

export const sendTestEmail = async (
  id: number,
  emails: string[],
): Promise<DetailResult<TestEmailResponse>> => {
  const {data} = await oiFetch.post<DetailResult<TestEmailApiPayload>>(`/campaigns/${id}/send-test`, {emails});
  return {
    ...data,
    item: data.item
      ? {sent: data.item.sent, failed: data.item.failed, errors: data.item.errors}
      : undefined,
  };
};

export const saveAsTemplate = async (
  id: number,
  payload: {name: string; description?: string},
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<CampaignApiPayload>>(`/campaigns/${id}/save-as-template`, payload);
  return mapDetailFromApi(data);
};

export const duplicateCampaign = async (id: number): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<CampaignApiPayload>>(`/campaigns/${id}/duplicate`);
  return mapDetailFromApi(data);
};

export const getTemplatePresets = async (): Promise<DetailResult<EmailTemplatePreset[]>> => {
  const {data} = await oiFetch.get<DetailResult<TemplatePresetApiPayload[]>>('/templates/presets');
  return {
    ...data,
    item: data.item
      ? data.item.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          thumbnail_url: p.thumbnailUrl,
        }))
      : undefined,
  };
};

// ─── V1 send / sending-status helpers ────────────────────────────────────────

type SendCampaignApiPayload = {
  totalEmails: number;
};

type SendingStatusApiPayload = {
  total: number;
  pending: number;
  sending: number;
  sent: number;
  failed: number;
  bounced: number;
  percentComplete: number;
};

const mapSendingStatusFromApi = (raw: SendingStatusApiPayload): SendingStatus => ({
  total: raw.total,
  pending: raw.pending,
  sending: raw.sending,
  sent: raw.sent,
  failed: raw.failed,
  bounced: raw.bounced,
  percent_complete: raw.percentComplete,
});

export const sendCampaign = async (id: number): Promise<DetailResult<SendCampaignResponse>> => {
  const {data} = await oiFetch.post<DetailResult<SendCampaignApiPayload>>(`/campaigns/${id}/send`);
  return {
    ...data,
    item: data.item ? {total_emails: data.item.totalEmails} : undefined,
  };
};

export const getSendingStatus = async (id: number): Promise<DetailResult<SendingStatus>> => {
  const {data} = await oiFetch.get<DetailResult<SendingStatusApiPayload>>(`/campaigns/${id}/sending-status`);
  return {
    ...data,
    item: data.item ? mapSendingStatusFromApi(data.item) : undefined,
  };
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

export const sendTestEmailLegacy = async (
  {id, email}: {id: Campaign['id']; email: string},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>(`/campaigns/${id}/test-email`, {email});
  return data;
};

export const sendCampaignLegacy = async (
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

export const duplicateCampaignLegacy = async (
  {id}: {id: Campaign['id']},
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<Campaign>>(`/campaigns/${id}/duplicate`);
  return data;
};

export const saveAsTemplateLegacy = async (
  {id}: {id: Campaign['id']},
): Promise<DetailResult<Campaign>> => {
  const {data} = await oiFetch.post<DetailResult<Campaign>>(`/campaigns/${id}/save-as-template`);
  return data;
};

export const uploadCampaignAttachment = async (
  campaignId: number,
  file: File,
): Promise<CampaignAttachment> => {
  const formData = new FormData();
  formData.append('file', file);
  const {data} = await oiFetch.post<DetailResult<CampaignAttachment>>(
    `/campaigns/${campaignId}/attachments`,
    formData,
  );
  if (!data.item) {
    throw new Error('Upload failed: missing item in response');
  }
  return data.item;
};

export const deleteCampaignAttachment = async (
  campaignId: number,
  attachmentId: number,
): Promise<void> => {
  // OiFetch always parses JSON, but the endpoint returns 204 No Content.
  const response = await fetch(`${baseUrl}/campaigns/${campaignId}/attachments/${attachmentId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {'Oi-Cookie-Auth': '1'},
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Delete failed: ${response.status}`);
  }
};
