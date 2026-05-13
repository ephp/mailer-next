import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {MailList, MailListListFilter, MailListUpdateInput, SmtpEncryption} from '@/types/models/MailList';

type MailListApiPayload = {
  id: number;
  name: string;
  description: string | null;
  firmaHtml: string | null;
  useCustomDsn: boolean;
  mailerDsnOverride: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpEncryption: SmtpEncryption | null;
  mailFrom: string | null;
  mailFromName: string | null;
  defaultPrimaryColor: string | null;
  defaultTextColor: string | null;
  defaultHeadingFont: string | null;
  defaultBodyFont: string | null;
  permettiDisiscrizione: boolean;
  unsubscribeText: string | null;
  contactCount: number;
  activeCount: number;
  accountId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  subscribeToken: string;
  statsCampaignsSent?: number | null;
  statsEmailsSent?: number | null;
  statsEmailsOpened?: number | null;
  statsEmailsClicked?: number | null;
};

const mapMailListFromApi = (raw: MailListApiPayload): MailList => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  firma_html: raw.firmaHtml,
  use_custom_dsn: raw.useCustomDsn,
  mailer_dsn_override: raw.mailerDsnOverride,
  smtp_host: raw.smtpHost,
  smtp_port: raw.smtpPort,
  smtp_user: raw.smtpUser,
  smtp_password: null,
  smtp_encryption: raw.smtpEncryption,
  mail_from: raw.mailFrom,
  mail_from_name: raw.mailFromName,
  default_primary_color: raw.defaultPrimaryColor,
  default_text_color: raw.defaultTextColor,
  default_heading_font: raw.defaultHeadingFont,
  default_body_font: raw.defaultBodyFont,
  permetti_disiscrizione: raw.permettiDisiscrizione,
  unsubscribe_text: raw.unsubscribeText,
  contact_count: raw.contactCount,
  active_count: raw.activeCount,
  account_id: raw.accountId,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
  subscribe_token: raw.subscribeToken,
  stats_campaigns_sent: raw.statsCampaignsSent ?? null,
  stats_emails_sent: raw.statsEmailsSent ?? null,
  stats_emails_opened: raw.statsEmailsOpened ?? null,
  stats_emails_clicked: raw.statsEmailsClicked ?? null,
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
      useCustomDsn: entity.use_custom_dsn,
      mailerDsnOverride: entity.mailer_dsn_override,
      smtpHost: entity.smtp_host,
      smtpPort: entity.smtp_port,
      smtpUser: entity.smtp_user,
      smtpPassword: entity.smtp_password,
      smtpEncryption: entity.smtp_encryption,
      mailFrom: entity.mail_from,
      mailFromName: entity.mail_from_name,
      defaultPrimaryColor: entity.default_primary_color,
      defaultTextColor: entity.default_text_color,
      defaultHeadingFont: entity.default_heading_font,
      defaultBodyFont: entity.default_body_font,
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
      useCustomDsn: entity.use_custom_dsn,
      mailerDsnOverride: entity.mailer_dsn_override,
      smtpHost: entity.smtp_host,
      smtpPort: entity.smtp_port,
      smtpUser: entity.smtp_user,
      smtpPassword: entity.smtp_password,
      smtpEncryption: entity.smtp_encryption,
      mailFrom: entity.mail_from,
      mailFromName: entity.mail_from_name,
      defaultPrimaryColor: entity.default_primary_color,
      defaultTextColor: entity.default_text_color,
      defaultHeadingFont: entity.default_heading_font,
      defaultBodyFont: entity.default_body_font,
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
