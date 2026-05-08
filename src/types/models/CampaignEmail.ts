export interface SendingStatus {
  total: number;
  pending: number;
  sending: number;
  sent: number;
  failed: number;
  bounced: number;
  percent_complete: number;
}

export interface SendCampaignResponse {
  total_emails: number;
}
