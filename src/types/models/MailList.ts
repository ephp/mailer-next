import {
  object as yupObject,
  number as yupNumber,
  string as yupString,
  boolean as yupBoolean,
} from "yup";

export type SmtpEncryption = 'tls' | 'ssl' | 'none';

export interface MailList {
  id: number;
  name: string;
  description: string | null;
  firma_html: string | null;
  use_custom_dsn: boolean;
  mailer_dsn_override: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_password: string | null;
  smtp_encryption: SmtpEncryption | null;
  mail_from: string | null;
  mail_from_name: string | null;
  default_primary_color: string | null;
  default_text_color: string | null;
  default_heading_font: string | null;
  default_body_font: string | null;
  permetti_disiscrizione: boolean;
  unsubscribe_text: string | null;
  contact_count: number;
  active_count: number;
  account_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  subscribe_token: string;
  /** Stats populated by the list endpoint; null when not yet computed. */
  stats_campaigns_sent: number | null;
  stats_emails_sent: number | null;
  stats_emails_opened: number | null;
  stats_emails_clicked: number | null;
}

export interface MailListUpdateInput {
  name?: string;
  description?: string | null;
  firma_html?: string | null;
  use_custom_dsn?: boolean;
  mailer_dsn_override?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_user?: string | null;
  smtp_password?: string | null;
  smtp_encryption?: SmtpEncryption | null;
  mail_from?: string | null;
  mail_from_name?: string | null;
  default_primary_color?: string | null;
  default_text_color?: string | null;
  default_heading_font?: string | null;
  default_body_font?: string | null;
  permetti_disiscrizione?: boolean;
  unsubscribe_text?: string | null;
}

export const mailListSchema = yupObject({
  id: yupNumber().required(),
  name: yupString().required(),
  description: yupString().nullable().defined(),
  firma_html: yupString().nullable().defined(),
  use_custom_dsn: yupBoolean().required(),
  mailer_dsn_override: yupString().nullable().defined(),
  smtp_host: yupString().nullable().defined(),
  smtp_port: yupNumber().nullable().defined(),
  smtp_user: yupString().nullable().defined(),
  smtp_encryption: yupString().nullable().defined(),
  mail_from: yupString().nullable().defined(),
  mail_from_name: yupString().nullable().defined(),
  permetti_disiscrizione: yupBoolean().required(),
  unsubscribe_text: yupString().nullable().defined(),
  contact_count: yupNumber().required(),
  active_count: yupNumber().required(),
  account_id: yupNumber().nullable().defined(),
  created_at: yupString().nullable().defined(),
  updated_at: yupString().nullable().defined(),
  subscribe_token: yupString().required(),
  stats_campaigns_sent: yupNumber().nullable().defined(),
  stats_emails_sent: yupNumber().nullable().defined(),
  stats_emails_opened: yupNumber().nullable().defined(),
  stats_emails_clicked: yupNumber().nullable().defined(),
});

export const newMailList: MailList = {
  id: 0,
  name: '',
  description: null,
  firma_html: null,
  use_custom_dsn: false,
  mailer_dsn_override: null,
  smtp_host: null,
  smtp_port: null,
  smtp_user: null,
  smtp_password: null,
  smtp_encryption: null,
  mail_from: null,
  mail_from_name: null,
  default_primary_color: null,
  default_text_color: null,
  default_heading_font: null,
  default_body_font: null,
  permetti_disiscrizione: true,
  unsubscribe_text: null,
  contact_count: 0,
  active_count: 0,
  account_id: null,
  created_at: null,
  updated_at: null,
  subscribe_token: '',
  stats_campaigns_sent: null,
  stats_emails_sent: null,
  stats_emails_opened: null,
  stats_emails_clicked: null,
};

export interface MailListListFilter {
  fts?: string;
}
