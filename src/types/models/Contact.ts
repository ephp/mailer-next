import {
  object as yupObject,
  number as yupNumber,
  string as yupString,
  boolean as yupBoolean,
} from "yup";

export interface Contact {
  id: number;
  email: string;
  nome: string | null;
  cognome: string | null;
  telefono: string | null;
  iscritto: boolean;
  bounce_count: number;
  unsubscribe_reason: string | null;
  /** Count of campaign_email rows in (bounced|failed) for this contact. */
  bounced_failed_count: number;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
}

export const contactSchema = yupObject({
  id: yupNumber().required(),
  email: yupString().email().required(),
  nome: yupString().nullable().defined(),
  cognome: yupString().nullable().defined(),
  telefono: yupString().nullable().defined(),
  iscritto: yupBoolean().required(),
  bounce_count: yupNumber().required(),
  unsubscribe_reason: yupString().nullable().defined(),
  bounced_failed_count: yupNumber().required(),
  sent_count: yupNumber().required(),
  opened_count: yupNumber().required(),
  clicked_count: yupNumber().required(),
});

export const newContact: Contact = {
  id: 0,
  email: '',
  nome: null,
  cognome: null,
  telefono: null,
  iscritto: true,
  bounce_count: 0,
  unsubscribe_reason: null,
  bounced_failed_count: 0,
  sent_count: 0,
  opened_count: 0,
  clicked_count: 0,
};

export interface ContactListFilter {
  fts?: string;
}
