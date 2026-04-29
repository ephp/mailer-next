import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {MailList, MailListListFilter} from '@/types/models/MailList';

export const getMailListList = async (
  {
    sortBy,
    sortDirection,
    page,
    perPage,
  }: PaginatedQuery<MailList, MailListListFilter>,
): Promise<PaginatedResult<MailList>> => {
  const {data} = await oiFetch.get<PaginatedResult<MailList>>('/lists', {
    params: {
      page,
      per_page: perPage,
      sortBy,
      sortMode: sortDirection,
    },
  });
  return data;
};

export const findMailList = async (
  {id}: {id: MailList['id']},
): Promise<DetailResult<MailList>> => {
  const {data} = await oiFetch.get<DetailResult<MailList>>(`/lists/${id}`);
  return data;
};

export const createMailList = async (
  {entity}: {entity: MailList},
): Promise<DetailResult<MailList>> => {
  const {data} = await oiFetch.post<DetailResult<MailList>>('/lists-new', {
    mail_list: {
      name: entity.name,
      description: entity.description,
      firmaHtml: entity.firma_html,
      mailerDsnOverride: entity.mailer_dsn_override,
      permettiDisiscrizione: entity.permetti_disiscrizione,
    },
  });
  return data;
};

export const updateMailList = async (
  {entity}: {entity: MailList},
): Promise<DetailResult<MailList>> => {
  const {data} = await oiFetch.post<DetailResult<MailList>>(`/lists/${entity.id}/edit`, {
    mail_list: {
      name: entity.name,
      description: entity.description,
      firmaHtml: entity.firma_html,
      mailerDsnOverride: entity.mailer_dsn_override,
      permettiDisiscrizione: entity.permetti_disiscrizione,
    },
  });
  return data;
};

export const deleteMailList = async (
  {id}: {id: MailList['id']},
): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>(`/lists/${id}/delete`);
  return data;
};
