import {oiFetch} from '@/@oimmei/services/auth';
import {DetailResult, PaginatedResult} from '@Oimmei-Digital-Boutique/crema-components';
import {
  AccountStats,
  MailListStats,
  CampaignStats,
  TimelinePoint,
  LinkStats,
  AccountMonthlyPoint,
  CampaignRecipient,
  ContactHistory,
  ContactHistoryCampaign,
  ContactHistoryKpi,
} from '@/types/models/Statistics';
import {baseUrl} from '@/shared/constants/AppConst';

// ─── API payload types (camelCase from Symfony serializer) ────────────────────

type CampaignStatsApiPayload = {
  total: number;
  sent: number;
  failed: number;
  bounced: number;
  uniqueOpens: number;
  totalOpens: number;
  uniqueClicks: number;
  totalClicks: number;
  unsubscribes: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  unsubscribeRate: number;
};

type TimelinePointApiPayload = {
  timestamp: string;
  value: number;
};

type LinkStatsApiPayload = {
  originalUrl: string;
  uniqueClicks: number;
  totalClicks: number;
  clickRate: number;
};

type AccountMonthlyPointApiPayload = {
  month: string;
  emailsSent: number;
  uniqueOpens: number;
  uniqueClicks: number;
  averageOpenRate: number;
  averageClickRate: number;
};

type CampaignRecipientApiPayload = {
  id: number;
  email: string;
  contactNome: string | null;
  contactCognome: string | null;
  mailListName: string | null;
  status: string;
  opened: boolean;
  openedAt: string | null;
  openCount: number;
  clicked: boolean;
  clickCount: number;
  unsubscribed: boolean;
};

type ContactHistoryCampaignApiPayload = {
  campaignId: number;
  campaignName: string | null;
  sentAt: string | null;
  opened: boolean;
  openedAt: string | null;
  openCount: number;
  clicked: boolean;
  clickCount: number;
  linksClicked: string[];
  unsubscribed: boolean;
};

type ContactHistoryKpiApiPayload = {
  personalOpenRate: number;
  personalClickRate: number;
  engagementScore: number;
};

type ContactHistoryApiPayload = {
  campaigns: ContactHistoryCampaignApiPayload[];
  kpi: ContactHistoryKpiApiPayload;
};

// ─── Mappers (camelCase → snake_case) ────────────────────────────────────────

const mapCampaignStatsFromApi = (raw: CampaignStatsApiPayload): CampaignStats => ({
  total: raw.total,
  sent: raw.sent,
  failed: raw.failed,
  bounced: raw.bounced,
  unique_opens: raw.uniqueOpens,
  total_opens: raw.totalOpens,
  unique_clicks: raw.uniqueClicks,
  total_clicks: raw.totalClicks,
  unsubscribes: raw.unsubscribes,
  open_rate: raw.openRate,
  click_rate: raw.clickRate,
  click_to_open_rate: raw.clickToOpenRate,
  unsubscribe_rate: raw.unsubscribeRate,
});

const mapTimelinePointFromApi = (raw: TimelinePointApiPayload): TimelinePoint => ({
  timestamp: raw.timestamp,
  value: raw.value,
});

const mapLinkStatsFromApi = (raw: LinkStatsApiPayload): LinkStats => ({
  original_url: raw.originalUrl,
  unique_clicks: raw.uniqueClicks,
  total_clicks: raw.totalClicks,
  click_rate: raw.clickRate,
});

const mapAccountMonthlyPointFromApi = (raw: AccountMonthlyPointApiPayload): AccountMonthlyPoint => ({
  month: raw.month,
  emails_sent: raw.emailsSent,
  unique_opens: raw.uniqueOpens,
  unique_clicks: raw.uniqueClicks,
  average_open_rate: raw.averageOpenRate,
  average_click_rate: raw.averageClickRate,
});

const mapCampaignRecipientFromApi = (raw: CampaignRecipientApiPayload): CampaignRecipient => ({
  id: raw.id,
  email: raw.email,
  contact_nome: raw.contactNome,
  contact_cognome: raw.contactCognome,
  mail_list_name: raw.mailListName,
  status: raw.status,
  opened: raw.opened,
  opened_at: raw.openedAt,
  open_count: raw.openCount,
  clicked: raw.clicked,
  click_count: raw.clickCount,
  unsubscribed: raw.unsubscribed,
});

const mapContactHistoryCampaignFromApi = (raw: ContactHistoryCampaignApiPayload): ContactHistoryCampaign => ({
  campaign_id: raw.campaignId,
  campaign_name: raw.campaignName,
  sent_at: raw.sentAt,
  opened: raw.opened,
  opened_at: raw.openedAt,
  open_count: raw.openCount,
  clicked: raw.clicked,
  click_count: raw.clickCount,
  links_clicked: raw.linksClicked,
  unsubscribed: raw.unsubscribed,
});

const mapContactHistoryKpiFromApi = (raw: ContactHistoryKpiApiPayload): ContactHistoryKpi => ({
  personal_open_rate: raw.personalOpenRate,
  personal_click_rate: raw.personalClickRate,
  engagement_score: raw.engagementScore,
});

const mapContactHistoryFromApi = (raw: ContactHistoryApiPayload): ContactHistory => ({
  campaigns: raw.campaigns.map(mapContactHistoryCampaignFromApi),
  kpi: mapContactHistoryKpiFromApi(raw.kpi),
});

// ─── API helpers ──────────────────────────────────────────────────────────────

export const getAccountStats = async (): Promise<DetailResult<AccountStats>> => {
  const {data} = await oiFetch.get<DetailResult<AccountStats>>('/statistics');
  return data;
};

export const getMailListStats = async (
  {id}: {id: number},
): Promise<DetailResult<MailListStats>> => {
  const {data} = await oiFetch.get<DetailResult<MailListStats>>(`/statistics/lists/${id}`);
  return data;
};

export const getCampaignStats = async (id: number): Promise<DetailResult<CampaignStats>> => {
  const {data} = await oiFetch.get<DetailResult<CampaignStatsApiPayload>>(`/campaigns/${id}/stats`);
  return {
    ...data,
    item: data.item ? mapCampaignStatsFromApi(data.item) : undefined,
  };
};

export const getCampaignTimeline = async (
  id: number,
  metric: 'opens' | 'clicks' = 'opens',
  hours: number = 72,
  cumulative: boolean = false,
): Promise<TimelinePoint[]> => {
  const {data} = await oiFetch.get<DetailResult<TimelinePointApiPayload[]>>(
    `/campaigns/${id}/timeline`,
    {params: {metric, hours, cumulative}},
  );
  return (data.item ?? []).map(mapTimelinePointFromApi);
};

export const getCampaignLinks = async (id: number): Promise<LinkStats[]> => {
  const {data} = await oiFetch.get<DetailResult<LinkStatsApiPayload[]>>(`/campaigns/${id}/links`);
  return (data.item ?? []).map(mapLinkStatsFromApi);
};

export const getCampaignRecipients = async ({
  id,
  page = 1,
  perPage = 50,
  status,
}: {
  id: number;
  page?: number;
  perPage?: number;
  status?: 'sent' | 'opened' | 'clicked' | 'unsubscribed';
}): Promise<PaginatedResult<CampaignRecipient>> => {
  const {data} = await oiFetch.get<PaginatedResult<CampaignRecipientApiPayload>>(
    `/campaigns/${id}/recipients`,
    {params: {page, per_page: perPage, status}},
  );
  return {
    ...data,
    items: (data.items ?? []).map(mapCampaignRecipientFromApi),
  };
};

export const getCampaignRecipientsCsv = async (
  id: number,
  status?: 'sent' | 'opened' | 'clicked' | 'unsubscribed',
): Promise<void> => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${baseUrl}/campaigns/${id}/recipients/csv${qs}`, {
    method: 'GET',
    credentials: 'include',
    headers: {'Oi-Cookie-Auth': '1'},
  });
  if (!response.ok) {
    throw new Error(`CSV download failed: ${response.status}`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `campaign-${id}-recipients.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getAccountMonthly = async (months: number = 12): Promise<AccountMonthlyPoint[]> => {
  const {data} = await oiFetch.get<DetailResult<AccountMonthlyPointApiPayload[]>>(
    '/statistics/monthly',
    {params: {months}},
  );
  return (data.item ?? []).map(mapAccountMonthlyPointFromApi);
};

export const getContactHistory = async (id: number): Promise<ContactHistory> => {
  const {data} = await oiFetch.get<DetailResult<ContactHistoryApiPayload>>(
    `/contacts/${id}/history`,
  );
  return data.item
    ? mapContactHistoryFromApi(data.item)
    : {campaigns: [], kpi: {personal_open_rate: 0, personal_click_rate: 0, engagement_score: 0}};
};
