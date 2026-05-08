export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  bounced: number;
  unique_opens: number;
  total_opens: number;
  unique_clicks: number;
  total_clicks: number;
  unsubscribes: number;
  open_rate: number;
  click_rate: number;
  click_to_open_rate: number;
  unsubscribe_rate: number;
}

export interface TimelinePoint {
  timestamp: string;
  value: number;
}

export interface LinkStats {
  original_url: string;
  unique_clicks: number;
  total_clicks: number;
  click_rate: number;
}

export interface AccountMonthlyPoint {
  month: string;
  emails_sent: number;
  unique_opens: number;
  unique_clicks: number;
  average_open_rate: number;
  average_click_rate: number;
}

export interface CampaignRecipient {
  id: number;
  email: string;
  contact_nome: string | null;
  contact_cognome: string | null;
  mail_list_name: string | null;
  status: string;
  opened: boolean;
  opened_at: string | null;
  open_count: number;
  clicked: boolean;
  click_count: number;
  unsubscribed: boolean;
}

export interface ContactHistoryCampaign {
  campaign_id: number;
  campaign_name: string | null;
  sent_at: string | null;
  opened: boolean;
  opened_at: string | null;
  open_count: number;
  clicked: boolean;
  click_count: number;
  links_clicked: string[];
  unsubscribed: boolean;
}

export interface ContactHistoryKpi {
  personal_open_rate: number;
  personal_click_rate: number;
  engagement_score: number;
}

export interface ContactHistory {
  campaigns: ContactHistoryCampaign[];
  kpi: ContactHistoryKpi;
}

export interface AccountStats {
  total_campaigns: number;
  total_lists: number;
  total_contacts: number;
  total_subscribed: number;
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

export interface MailListStats {
  total_contacts: number;
  total_subscribed: number;
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
