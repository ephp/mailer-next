import {
  object as yupObject,
  number as yupNumber,
  string as yupString,
  boolean as yupBoolean,
  array as yupArray,
} from "yup";

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent';

export interface CampaignFilter {
  taxonomy_term_ids?: number[];
}

export interface CampaignStructure {
  template_id: string;
  colors: {
    primary: string;
    text: string;
    background: string;
  };
  logo_url: string | null;
}

export interface CampaignMailList {
  id: number;
  name: string;
}

export interface Campaign {
  id: number;
  name: string | null;
  email_subject: string;
  snippet: string | null;
  body: string | null;
  structure: CampaignStructure | null;
  composition: Record<string, unknown> | null;
  filter: CampaignFilter | null;
  draft: boolean;
  template: boolean;
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  cloned_from_id: number | null;
  account_id: number | null;
  mail_list_ids: number[];
  mail_lists: CampaignMailList[];
  recipient_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export const campaignSchema = yupObject({
  id: yupNumber().required(),
  name: yupString().nullable().defined(),
  email_subject: yupString().required(),
  snippet: yupString().nullable().defined(),
  body: yupString().nullable().defined(),
  structure: yupObject().nullable().defined(),
  composition: yupObject().nullable().defined(),
  filter: yupObject().nullable().defined(),
  draft: yupBoolean().required(),
  template: yupBoolean().required(),
  status: yupString().oneOf(['draft', 'scheduled', 'sending', 'sent'] as const).required(),
  scheduled_at: yupString().nullable().defined(),
  sent_at: yupString().nullable().defined(),
  cloned_from_id: yupNumber().nullable().defined(),
  account_id: yupNumber().nullable().defined(),
  mail_list_ids: yupArray(yupNumber().required()).required(),
  mail_lists: yupArray(yupObject()).required(),
  recipient_count: yupNumber().required(),
  created_at: yupString().nullable().defined(),
  updated_at: yupString().nullable().defined(),
});

export const defaultCampaignStructure: CampaignStructure = {
  template_id: 'classic',
  colors: {
    primary: '#556cd6',
    text: '#333333',
    background: '#f5f5f5',
  },
  logo_url: null,
};

export const newCampaign: Campaign = {
  id: 0,
  name: null,
  email_subject: '',
  snippet: null,
  body: null,
  structure: defaultCampaignStructure,
  composition: null,
  filter: null,
  draft: true,
  template: false,
  status: 'draft',
  scheduled_at: null,
  sent_at: null,
  cloned_from_id: null,
  account_id: null,
  mail_list_ids: [],
  mail_lists: [],
  recipient_count: 0,
  created_at: null,
  updated_at: null,
};

export interface CampaignListFilter {
  fts?: string;
  status?: CampaignStatus;
}

export interface CampaignStats {
  total_sent: number;
  total_failed: number;
  total_pending: number;
  total_bounced: number;
  total_opens: number;
  total_clicks: number;
  total_unsubscribes: number;
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
}
