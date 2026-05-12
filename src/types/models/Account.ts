import {
  object as yupObject,
  number as yupNumber,
  string as yupString,
  boolean as yupBoolean,
} from "yup";

export type SmtpEncryption = 'tls' | 'ssl' | 'none';

export interface AccountLogo {
  url: string;
  filename: string;
}

export interface Account {
  id: number;
  ragione_sociale: string;
  email_contatto: string;
  mail_from: string;
  mail_from_name: string;
  partita_iva: string | null;
  indirizzo: string | null;
  mailer_dsn: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_encryption: SmtpEncryption | null;
  logo: AccountLogo | null;
  batch_size: number;
  send_interval: number;
  api_key: string;
  api_rate_limit: number;
  enabled: boolean;
  privacy_policy: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AccountUpdateInput {
  ragione_sociale?: string;
  email_contatto?: string;
  mail_from?: string;
  mail_from_name?: string;
  partita_iva?: string | null;
  indirizzo?: string | null;
  mailer_dsn?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_user?: string | null;
  smtp_password?: string | null;
  smtp_encryption?: SmtpEncryption | null;
  batch_size?: number;
  send_interval?: number;
  api_rate_limit?: number;
  privacy_policy?: string | null;
}

export interface SmtpTestInput {
  dsn?: string;
  smtpHost?: string;
  smtpPort?: number;
}

export interface SmtpTestResult {
  success: boolean;
  error: string | null;
}

export const accountSchema = yupObject({
  id: yupNumber().required(),
  ragione_sociale: yupString().required(),
  email_contatto: yupString().required(),
  mail_from: yupString().required(),
  mail_from_name: yupString().required(),
  partita_iva: yupString().nullable().defined(),
  indirizzo: yupString().nullable().defined(),
  mailer_dsn: yupString().nullable().defined(),
  smtp_host: yupString().nullable().defined(),
  smtp_port: yupNumber().nullable().defined(),
  smtp_user: yupString().nullable().defined(),
  smtp_encryption: yupString().nullable().defined(),
  batch_size: yupNumber().required(),
  send_interval: yupNumber().required(),
  api_key: yupString().required(),
  api_rate_limit: yupNumber().required().min(1).max(1000),
  enabled: yupBoolean().required(),
  privacy_policy: yupString().nullable().defined(),
});

export interface SmtpCheckResult {
  connected: boolean;
  host: string | null;
  port: number;
  error: string | null;
}

export interface DnsCheckResult {
  domain: string | null;
  spf: { found: boolean; record: string | null };
  dkim: { found: boolean; selector: string | null; record: string | null };
  dmarc: { found: boolean; record: string | null };
}

export interface SmtpDiagnosticResult {
  smtp: SmtpCheckResult;
  dns: DnsCheckResult;
}

export const newAccount: Account = {
  id: 0,
  ragione_sociale: '',
  email_contatto: '',
  mail_from: '',
  mail_from_name: '',
  partita_iva: null,
  indirizzo: null,
  mailer_dsn: null,
  smtp_host: null,
  smtp_port: null,
  smtp_user: null,
  smtp_encryption: null,
  logo: null,
  batch_size: 50,
  send_interval: 30,
  api_key: '',
  api_rate_limit: 60,
  enabled: true,
  privacy_policy: null,
  created_at: null,
  updated_at: null,
};
