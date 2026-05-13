import {baseUrl} from '@/shared/constants/AppConst';

// Public subscribe endpoints — these do NOT use OiFetch because they must not
// send the Oi-Cookie-Auth header (the form is public and anonymous).

export interface SubscribeTerm {
  id: number;
  name: string;
}

export interface SubscribeCategory {
  id: number;
  name: string;
  terms: SubscribeTerm[];
}

export interface SubscribeInfo {
  list: {
    id: number;
    name: string;
    description: string | null;
  };
  categories: SubscribeCategory[];
  /** Privacy policy text already rendered with account placeholders. */
  privacy_policy: string;
}

export interface SubscribePayload {
  email: string;
  nome?: string | null;
  cognome?: string | null;
  telefono?: string | null;
  term_ids?: number[];
  privacy_accepted: boolean;
}

const apiBase = baseUrl.replace(/\/api\/v\d+\/?$/, '');

const subscribeBase = (token: string): string => `${apiBase}/subscribe/${token}`;

export const getSubscribeInfo = async (token: string): Promise<SubscribeInfo | null> => {
  const r = await fetch(subscribeBase(token), {method: 'GET', credentials: 'omit'});
  if (!r.ok) return null;
  const json = await r.json();
  return json?.item ?? null;
};

export interface SubscribeResult {
  ok: boolean;
  message?: string;
  contactId?: number;
}

export const submitSubscribe = async (token: string, payload: SubscribePayload): Promise<SubscribeResult> => {
  const r = await fetch(subscribeBase(token), {
    method: 'POST',
    credentials: 'omit',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  const json = await r.json().catch(() => null);
  if (!r.ok) {
    return {ok: false, message: json?.message?.message ?? `Errore (${r.status})`};
  }
  return {
    ok: true,
    message: json?.message?.message,
    contactId: json?.item?.contact_id,
  };
};

/** Builds the URL that the QR code encodes. */
export const buildSubscribeUrl = (origin: string, token: string, termIds: number[]): string => {
  const u = new URL(`${origin}/subscribe/${token}`);
  if (termIds.length > 0) u.searchParams.set('t', termIds.join(','));
  return u.toString();
};
