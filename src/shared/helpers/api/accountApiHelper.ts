import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {Account, AccountLogo, AccountUpdateInput, SmtpDiagnosticResult, SmtpEncryption, SmtpTestInput, SmtpTestResult} from '@/types/models/Account';

type AccountApiPayload = {
  id: number;
  ragioneSociale: string;
  emailContatto: string;
  mailFrom: string;
  mailFromName: string;
  partitaIva: string | null;
  indirizzo: string | null;
  mailerDsn: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpEncryption: SmtpEncryption | null;
  logo: AccountLogo | null;
  batchSize: number;
  sendInterval: number;
  apiKey: string;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

const mapAccountFromApi = (raw: AccountApiPayload): Account => ({
  id: raw.id,
  ragione_sociale: raw.ragioneSociale,
  email_contatto: raw.emailContatto,
  mail_from: raw.mailFrom,
  mail_from_name: raw.mailFromName,
  partita_iva: raw.partitaIva,
  indirizzo: raw.indirizzo,
  mailer_dsn: raw.mailerDsn,
  smtp_host: raw.smtpHost,
  smtp_port: raw.smtpPort,
  smtp_user: raw.smtpUser,
  smtp_encryption: raw.smtpEncryption,
  logo: raw.logo,
  batch_size: raw.batchSize,
  send_interval: raw.sendInterval,
  api_key: raw.apiKey,
  enabled: raw.enabled,
  created_at: raw.createdAt,
  updated_at: raw.updatedAt,
});

const mapDetailFromApi = (raw: DetailResult<AccountApiPayload>): DetailResult<Account> => ({
  ...raw,
  item: raw.item ? mapAccountFromApi(raw.item) : undefined,
});

export const getMyAccount = async (): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.get<DetailResult<Account>>('/account/my-account');
  return data;
};

export const getAccount = async (): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.get<DetailResult<AccountApiPayload>>('/account');
  return mapDetailFromApi(data);
};

export const updateMyAccount = async (
  {entity}: {entity: Account},
): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.post<DetailResult<Account>>('/account/my-account/edit', {
    account: {
      ragioneSociale: entity.ragione_sociale,
      partitaIva: entity.partita_iva,
      indirizzo: entity.indirizzo,
      smtpHost: entity.smtp_host,
      smtpPort: entity.smtp_port,
      smtpUser: entity.smtp_user,
      smtpEncryption: entity.smtp_encryption,
    },
  });
  return data;
};

export const updateAccount = async (data: AccountUpdateInput): Promise<DetailResult<Account>> => {
  const {data: response} = await oiFetch.patch<DetailResult<AccountApiPayload>>('/account', {
    account: {
      ragioneSociale: data.ragione_sociale,
      emailContatto: data.email_contatto,
      mailFrom: data.mail_from,
      mailFromName: data.mail_from_name,
      partitaIva: data.partita_iva,
      indirizzo: data.indirizzo,
      mailerDsn: data.mailer_dsn,
      smtpHost: data.smtp_host,
      smtpPort: data.smtp_port,
      smtpUser: data.smtp_user,
      smtpPassword: data.smtp_password,
      smtpEncryption: data.smtp_encryption,
      batchSize: data.batch_size,
      sendInterval: data.send_interval,
    },
  });
  return mapDetailFromApi(response);
};

export const uploadAccountLogo = async (file: File): Promise<DetailResult<Account>> => {
  const formData = new FormData();
  formData.append('logo', file);
  const {data} = await oiFetch.post<DetailResult<AccountApiPayload>>('/account/logo', formData);
  return mapDetailFromApi(data);
};

export const testSmtp = async (input: SmtpTestInput): Promise<SmtpTestResult> => {
  const {data} = await oiFetch.post<SmtpTestResult>('/account/test-smtp', input);
  return data;
};

export const sendTestEmail = async (to: string): Promise<DetailResult<null>> => {
  const {data} = await oiFetch.post<DetailResult<null>>('/account/send-test-email', {to});
  return data;
};

export const getAccountList = async (
  {
    sortBy,
    sortDirection,
    page,
    perPage,
  }: PaginatedQuery<Account, Record<string, never>>,
): Promise<PaginatedResult<Account>> => {
  const {data} = await oiFetch.get<PaginatedResult<Account>>('/backend/account', {
    params: {
      page,
      per_page: perPage,
      sortBy,
      sortMode: sortDirection,
    },
  });
  return data;
};

export const findAccount = async (
  {id}: {id: Account['id']},
): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.get<DetailResult<Account>>(`/backend/account/${id}`);
  return data;
};

export const createAccount = async (
  {entity}: {entity: Account},
): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.post<DetailResult<Account>>('/backend/account-new', {
    account: {
      ragioneSociale: entity.ragione_sociale,
      emailContatto: entity.email_contatto,
      partitaIva: entity.partita_iva,
      indirizzo: entity.indirizzo,
      smtpHost: entity.smtp_host,
      smtpPort: entity.smtp_port,
      smtpUser: entity.smtp_user,
      smtpEncryption: entity.smtp_encryption,
    },
  });
  return data;
};

export const updateAccountById = async (
  {entity}: {entity: Account},
): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.post<DetailResult<Account>>(`/backend/account/${entity.id}/edit`, {
    account: {
      ragioneSociale: entity.ragione_sociale,
      emailContatto: entity.email_contatto,
      partitaIva: entity.partita_iva,
      indirizzo: entity.indirizzo,
      smtpHost: entity.smtp_host,
      smtpPort: entity.smtp_port,
      smtpUser: entity.smtp_user,
      smtpEncryption: entity.smtp_encryption,
    },
  });
  return data;
};

export const enableAccount = async (
  {id}: {id: Account['id']},
): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.post<DetailResult<Account>>(`/backend/account/${id}/enable`);
  return data;
};

export const disableAccount = async (
  {id}: {id: Account['id']},
): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.post<DetailResult<Account>>(`/backend/account/${id}/disable`);
  return data;
};

export const regenerateApiKey = async (): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.post<DetailResult<Account>>('/account/my-account/regenerate-key');
  return data;
};

export const diagnoseSMTP = async (): Promise<DetailResult<SmtpDiagnosticResult>> => {
  const {data} = await oiFetch.post<DetailResult<SmtpDiagnosticResult>>('/account/my-account/diagnose');
  return data;
};
