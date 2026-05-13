import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {Contact, ContactListFilter} from '@/types/models/Contact';
import {baseUrl} from '@/shared/constants/AppConst';

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: Array<{row: number; email?: string; error: string}>;
};

export type ContactBounce = {
  id: number;
  campaign_id: number;
  campaign_name: string | null;
  status: 'bounced' | 'failed';
  error_message: string | null;
  retry_count: number;
  sent_at: string | null;
};

// Backend serializes the Contact entity via property names (camelCase).
type ContactApiPayload = {
  id: number;
  email: string;
  nome: string | null;
  cognome: string | null;
  telefono: string | null;
  iscritto: boolean;
  bounceCount: number;
  unsubscribeReason: string | null;
  bouncedFailedCount?: number | null;
  sentCount?: number | null;
  openedCount?: number | null;
  clickedCount?: number | null;
};

const mapContactFromApi = (raw: ContactApiPayload): Contact => ({
  id: raw.id,
  email: raw.email,
  nome: raw.nome,
  cognome: raw.cognome,
  telefono: raw.telefono,
  iscritto: raw.iscritto,
  bounce_count: raw.bounceCount,
  unsubscribe_reason: raw.unsubscribeReason,
  bounced_failed_count: raw.bouncedFailedCount ?? 0,
  sent_count: raw.sentCount ?? 0,
  opened_count: raw.openedCount ?? 0,
  clicked_count: raw.clickedCount ?? 0,
});

type ContactListQuery = PaginatedQuery<Contact, ContactListFilter> & {listId: number};

export const getContactList = async (
  {
    listId,
    page,
    perPage,
    filters,
  }: ContactListQuery,
): Promise<PaginatedResult<Contact>> => {
  const {data} = await oiFetch.get<PaginatedResult<ContactApiPayload>>(`/lists/${listId}/contacts`, {
    params: {
      page,
      per_page: perPage,
      fts: filters?.fts,
    },
  });
  return {
    ...data,
    items: data.items?.map(mapContactFromApi) ?? [],
  };
};

export const findContact = async (
  {listId, id}: {listId: number; id: Contact['id']},
): Promise<DetailResult<Contact>> => {
  const {data} = await oiFetch.get<DetailResult<ContactApiPayload>>(`/lists/${listId}/contacts/${id}`);
  return {
    ...data,
    item: data.item ? mapContactFromApi(data.item) : undefined,
  };
};

export const getContactBounces = async (
  {listId, id}: {listId: number; id: Contact['id']},
): Promise<ContactBounce[]> => {
  const {data} = await oiFetch.get<DetailResult<ContactBounce[]>>(`/lists/${listId}/contacts/${id}/bounces`);
  return data.item ?? [];
};

const mapDetail = (raw: DetailResult<ContactApiPayload>): DetailResult<Contact> => ({
  ...raw,
  item: raw.item ? mapContactFromApi(raw.item) : undefined,
});

export const createContact = async (
  {listId, entity}: {listId: number; entity: Contact},
): Promise<DetailResult<Contact>> => {
  const {data} = await oiFetch.post<DetailResult<ContactApiPayload>>(`/lists/${listId}/contacts-new`, {
    contact: {
      email: entity.email,
      nome: entity.nome,
      cognome: entity.cognome,
      telefono: entity.telefono,
      iscritto: entity.iscritto,
    },
  });
  return mapDetail(data);
};

export const updateContact = async (
  {listId, entity}: {listId: number; entity: Contact},
): Promise<DetailResult<Contact>> => {
  const {data} = await oiFetch.post<DetailResult<ContactApiPayload>>(`/lists/${listId}/contacts/${entity.id}/edit`, {
    contact: {
      email: entity.email,
      nome: entity.nome,
      cognome: entity.cognome,
      telefono: entity.telefono,
      iscritto: entity.iscritto,
    },
  });
  return mapDetail(data);
};

export const deleteContact = async (
  {listId, id}: {listId: number; id: Contact['id']},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>(`/lists/${listId}/contacts/${id}/delete`);
  return data;
};

export const subscribeContact = async (
  {listId, id}: {listId: number; id: Contact['id']},
): Promise<DetailResult<Contact>> => {
  const {data} = await oiFetch.post<DetailResult<ContactApiPayload>>(`/lists/${listId}/contacts/${id}/subscribe`);
  return mapDetail(data);
};

export const unsubscribeContact = async (
  {listId, id}: {listId: number; id: Contact['id']},
): Promise<DetailResult<Contact>> => {
  const {data} = await oiFetch.post<DetailResult<ContactApiPayload>>(`/lists/${listId}/contacts/${id}/unsubscribe`);
  return mapDetail(data);
};

export const importContacts = async (
  {listId, file}: {listId: number; file: File},
): Promise<DetailResult<ImportResult>> => {
  const formData = new FormData();
  formData.append('csv_file', file);
  const {data} = await oiFetch.post<DetailResult<ImportResult>>(`/lists/${listId}/contacts-import`, formData);
  return data;
};

export const downloadImportTemplate = async (
  {listId}: {listId: number},
): Promise<void> => {
  const response = await fetch(`${baseUrl}/lists/${listId}/contacts-import-template`, {
    method: 'GET',
    credentials: 'include',
    headers: {'Oi-Cookie-Auth': '1'},
  });
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `import-template-${listId}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
