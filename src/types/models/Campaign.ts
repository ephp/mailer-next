import {
  object as yupObject,
  number as yupNumber,
  string as yupString,
  boolean as yupBoolean,
  array as yupArray,
} from "yup";

export interface CampaignStructure {
  template_id: string;
  colors: {
    primary: string;
    text: string;
    background: string;
  };
  logo_url: string | null;
}

export interface Campaign {
  id: number;
  name: string | null;
  email_subject: string;
  snippet: string | null;
  body: string | null;
  structure: CampaignStructure | null;
  draft: boolean;
  template: boolean;
  scheduled_at: string | null;
  sent_at: string | null;
  account_id: number | null;
  mail_list_ids: number[];
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
  draft: yupBoolean().required(),
  template: yupBoolean().required(),
  scheduled_at: yupString().nullable().defined(),
  sent_at: yupString().nullable().defined(),
  account_id: yupNumber().nullable().defined(),
  mail_list_ids: yupArray(yupNumber().required()).required(),
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
  draft: true,
  template: false,
  scheduled_at: null,
  sent_at: null,
  account_id: null,
  mail_list_ids: [],
  recipient_count: 0,
  created_at: null,
  updated_at: null,
};

export interface CampaignListFilter {
  fts?: string;
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
