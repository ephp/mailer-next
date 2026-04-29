import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {Contact, ContactListFilter} from '@/types/models/Contact';

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: Array<{row: number; email?: string; error: string}>;
};

type ContactListQuery = PaginatedQuery<Contact, ContactListFilter> & {listId: number};

export const getContactList = async (
  {
    listId,
    page,
    perPage,
    filters,
  }: ContactListQuery,
): Promise<PaginatedResult<Contact>> => {
  const {data} = await oiFetch.get<PaginatedResult<Contact>>(`/lists/${listId}/contacts`, {
    params: {
      page,
      per_page: perPage,
      fts: filters?.fts,
    },
  });
  return data;
};

export const findContact = async (
  {listId, id}: {listId: number; id: Contact['id']},
): Promise<DetailResult<Contact>> => {
  const {data} = await oiFetch.get<DetailResult<Contact>>(`/lists/${listId}/contacts/${id}`);
  return data;
};

export const createContact = async (
  {listId, entity}: {listId: number; entity: Contact},
): Promise<DetailResult<Contact>> => {
  const {data} = await oiFetch.post<DetailResult<Contact>>(`/lists/${listId}/contacts-new`, {
    contact: {
      email: entity.email,
      nome: entity.nome,
      cognome: entity.cognome,
      telefono: entity.telefono,
      iscritto: entity.iscritto,
    },
  });
  return data;
};

export const updateContact = async (
  {listId, entity}: {listId: number; entity: Contact},
): Promise<DetailResult<Contact>> => {
  const {data} = await oiFetch.post<DetailResult<Contact>>(`/lists/${listId}/contacts/${entity.id}/edit`, {
    contact: {
      email: entity.email,
      nome: entity.nome,
      cognome: entity.cognome,
      telefono: entity.telefono,
      iscritto: entity.iscritto,
    },
  });
  return data;
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
  const {data} = await oiFetch.post<DetailResult<Contact>>(`/lists/${listId}/contacts/${id}/subscribe`);
  return data;
};

export const unsubscribeContact = async (
  {listId, id}: {listId: number; id: Contact['id']},
): Promise<DetailResult<Contact>> => {
  const {data} = await oiFetch.post<DetailResult<Contact>>(`/lists/${listId}/contacts/${id}/unsubscribe`);
  return data;
};

export const importContacts = async (
  {listId, file}: {listId: number; file: File},
): Promise<DetailResult<ImportResult>> => {
  const formData = new FormData();
  formData.append('csv_file', file);
  const {data} = await oiFetch.post<DetailResult<ImportResult>>(`/lists/${listId}/contacts-import`, formData);
  return data;
};
