import {
  object as yupObject,
  number as yupNumber,
  string as yupString,
  boolean as yupBoolean,
} from "yup";

export type SmtpEncryption = 'tls' | 'ssl' | 'none';

export interface Account {
  id: number;
  ragione_sociale: string;
  partita_iva: string | null;
  indirizzo: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_password: string | null;
  smtp_encryption: SmtpEncryption | null;
  api_key: string;
  enabled: boolean;
}

export const accountSchema = yupObject({
  id: yupNumber().required(),
  ragione_sociale: yupString().required(),
  partita_iva: yupString().nullable().defined(),
  indirizzo: yupString().nullable().defined(),
  smtp_host: yupString().nullable().defined(),
  smtp_port: yupNumber().nullable().defined(),
  smtp_user: yupString().nullable().defined(),
  smtp_password: yupString().nullable().defined(),
  smtp_encryption: yupString().nullable().defined(),
  api_key: yupString().required(),
  enabled: yupBoolean().required(),
});

export const newAccount: Account = {
  id: 0,
  ragione_sociale: '',
  partita_iva: null,
  indirizzo: null,
  smtp_host: null,
  smtp_port: null,
  smtp_user: null,
  smtp_password: null,
  smtp_encryption: null,
  api_key: '',
  enabled: true,
};
