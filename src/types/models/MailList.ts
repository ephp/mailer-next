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
  contact_count: number;
  account_id: number | null;
}

export const mailListSchema = yupObject({
  id: yupNumber().required(),
  name: yupString().required(),
  description: yupString().nullable().defined(),
  firma_html: yupString().nullable().defined(),
  mailer_dsn_override: yupString().nullable().defined(),
  permetti_disiscrizione: yupBoolean().required(),
  contact_count: yupNumber().required(),
  account_id: yupNumber().nullable().defined(),
});

export const newMailList: MailList = {
  id: 0,
  name: '',
  description: null,
  firma_html: null,
  mailer_dsn_override: null,
  permetti_disiscrizione: true,
  contact_count: 0,
  account_id: null,
};

export interface MailListListFilter {
  fts?: string;
}
