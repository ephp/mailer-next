import {
  object as yupObject,
  number as yupNumber,
  string as yupString,
  boolean as yupBoolean,
} from "yup";

export interface MailList {
  id: number;
  name: string;
  description: string | null;
  firma_html: string | null;
  mailer_dsn_override: string | null;
  permetti_disiscrizione: boolean;
  unsubscribe_text: string | null;
  contact_count: number;
  active_count: number;
  account_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MailListUpdateInput {
  name?: string;
  description?: string | null;
  firma_html?: string | null;
  mailer_dsn_override?: string | null;
  permetti_disiscrizione?: boolean;
  unsubscribe_text?: string | null;
}

export const mailListSchema = yupObject({
  id: yupNumber().required(),
  name: yupString().required(),
  description: yupString().nullable().defined(),
  firma_html: yupString().nullable().defined(),
  mailer_dsn_override: yupString().nullable().defined(),
  permetti_disiscrizione: yupBoolean().required(),
  unsubscribe_text: yupString().nullable().defined(),
  contact_count: yupNumber().required(),
  active_count: yupNumber().required(),
  account_id: yupNumber().nullable().defined(),
  created_at: yupString().nullable().defined(),
  updated_at: yupString().nullable().defined(),
});

export const newMailList: MailList = {
  id: 0,
  name: '',
  description: null,
  firma_html: null,
  mailer_dsn_override: null,
  permetti_disiscrizione: true,
  unsubscribe_text: null,
  contact_count: 0,
  active_count: 0,
  account_id: null,
  created_at: null,
  updated_at: null,
};

export interface MailListListFilter {
  fts?: string;
}
