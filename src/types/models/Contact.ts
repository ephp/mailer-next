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
}

export const contactSchema = yupObject({
  id: yupNumber().required(),
  email: yupString().email().required(),
  nome: yupString().nullable().defined(),
  cognome: yupString().nullable().defined(),
  telefono: yupString().nullable().defined(),
  iscritto: yupBoolean().required(),
  bounce_count: yupNumber().required(),
});

export const newContact: Contact = {
  id: 0,
  email: '',
  nome: null,
  cognome: null,
  telefono: null,
  iscritto: true,
  bounce_count: 0,
};

export interface ContactListFilter {
  fts?: string;
}
