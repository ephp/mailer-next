import {oiFetch} from '@/@oimmei/services/auth';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult,
} from '@Oimmei-Digital-Boutique/crema-components';
import {Account, SmtpDiagnosticResult} from '@/types/models/Account';

export const getMyAccount = async (): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.get<DetailResult<Account>>('/account/my-account');
  return data;
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
      smtpPassword: entity.smtp_password,
      smtpEncryption: entity.smtp_encryption,
    },
  });
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
      partitaIva: entity.partita_iva,
      indirizzo: entity.indirizzo,
      smtpHost: entity.smtp_host,
      smtpPort: entity.smtp_port,
      smtpUser: entity.smtp_user,
      smtpPassword: entity.smtp_password,
      smtpEncryption: entity.smtp_encryption,
    },
  });
  return data;
};

export const updateAccount = async (
  {entity}: {entity: Account},
): Promise<DetailResult<Account>> => {
  const {data} = await oiFetch.post<DetailResult<Account>>(`/backend/account/${entity.id}/edit`, {
    account: {
      ragioneSociale: entity.ragione_sociale,
      partitaIva: entity.partita_iva,
      indirizzo: entity.indirizzo,
      smtpHost: entity.smtp_host,
      smtpPort: entity.smtp_port,
      smtpUser: entity.smtp_user,
      smtpPassword: entity.smtp_password,
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
