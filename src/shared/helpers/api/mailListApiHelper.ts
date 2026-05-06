import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {MailList, MailListListFilter, MailListUpdateInput} from '@/types/models/MailList';

type MailListApiPayload = {
  id: number;
  name: string;
  description: string | null;
  firmaHtml: string | null;
  mailerDsnOverride: string | null;
  permettiDisiscrizione: boolean;
  unsubscribeText: string | null;
  contactCount: number;
  activeCount: number;
  accountId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const mapMailListFromApi = (raw: MailListApiPayload): MailList => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  firma_html: raw.firmaHtml,
  mailer_dsn_override: raw.mailerDsnOverride,
  permetti_disiscrizione: raw.permettiDisiscrizione,
  unsubscribe_text: raw.unsubscribeText,
  contact_count: raw.contactCount,
  active_count: raw.activeCount,
  account_id: raw.accountId,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
});

const mapMailListDetailFromApi = (raw: DetailResult<MailListApiPayload>): DetailResult<MailList> => ({
  ...raw,
  item: raw.item ? mapMailListFromApi(raw.item) : undefined,
});

const mapMailListPaginatedFromApi = (raw: PaginatedResult<MailListApiPayload>): PaginatedResult<MailList> => ({
  ...raw,
  items: raw.items?.map(mapMailListFromApi),
});

export const getMailLists = async (
  {
    sortBy,
    sortDirection,
    page,
    perPage,
    filters,
  }: PaginatedQuery<MailList, MailListListFilter>,
): Promise<PaginatedResult<MailList>> => {
  const {data} = await oiFetch.get<PaginatedResult<MailListApiPayload>>('/lists', {
    params: {
      page,
      per_page: perPage,
      sort: sortBy,
      direction: sortDirection,
      search: filters?.fts || undefined,
    },
  });
  return mapMailListPaginatedFromApi(data);
};

export const getMailList = async (
  {id}: {id: MailList['id']},
): Promise<DetailResult<MailList>> => {
  const {data} = await oiFetch.get<DetailResult<MailListApiPayload>>(`/lists/${id}`);
  return mapMailListDetailFromApi(data);
};

export const createMailList = async (
  {entity}: {entity: MailList},
): Promise<DetailResult<MailList>> => {
  const {data} = await oiFetch.post<DetailResult<MailListApiPayload>>('/lists', {
    mail_list: {
      name: entity.name,
      description: entity.description,
      firmaHtml: entity.firma_html,
      mailerDsnOverride: entity.mailer_dsn_override,
      permettiDisiscrizione: entity.permetti_disiscrizione,
      unsubscribeText: entity.unsubscribe_text,
    },
  });
  return mapMailListDetailFromApi(data);
};

export const updateMailList = async (
  {entity}: {entity: MailList},
): Promise<DetailResult<MailList>> => {
  const {data} = await oiFetch.patch<DetailResult<MailListApiPayload>>(`/lists/${entity.id}`, {
    mail_list: {
      name: entity.name,
      description: entity.description,
      firmaHtml: entity.firma_html,
      mailerDsnOverride: entity.mailer_dsn_override,
      permettiDisiscrizione: entity.permetti_disiscrizione,
      unsubscribeText: entity.unsubscribe_text,
    },
  });
  return mapMailListDetailFromApi(data);
};

export const deleteMailList = async (
  {id}: {id: MailList['id']},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.delete<DetailResult<null>>(`/lists/${id}`);
  return data;
};
