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

// The backend returns plain PHP arrays, so the keys are already snake_case
// (Symfony Serializer doesn't reformat raw arrays). The mappers below are
// effectively identity maps but kept explicit for type safety.

type CampaignStatsApiPayload = CampaignStats;
type TimelinePointApiPayload = TimelinePoint;
type LinkStatsApiPayload = LinkStats;
type AccountMonthlyPointApiPayload = AccountMonthlyPoint;
type CampaignRecipientApiPayload = CampaignRecipient;
type ContactHistoryCampaignApiPayload = ContactHistoryCampaign;
type ContactHistoryKpiApiPayload = ContactHistoryKpi;
type ContactHistoryApiPayload = ContactHistory;

// ─── Mappers (snake_case → snake_case, identity for type safety) ─────────────

const mapCampaignStatsFromApi = (raw: CampaignStatsApiPayload): CampaignStats => ({...raw});
const mapTimelinePointFromApi = (raw: TimelinePointApiPayload): TimelinePoint => ({...raw});
const mapLinkStatsFromApi = (raw: LinkStatsApiPayload): LinkStats => ({...raw});
const mapAccountMonthlyPointFromApi = (raw: AccountMonthlyPointApiPayload): AccountMonthlyPoint => ({...raw});
const mapCampaignRecipientFromApi = (raw: CampaignRecipientApiPayload): CampaignRecipient => ({...raw});
const mapContactHistoryCampaignFromApi = (raw: ContactHistoryCampaignApiPayload): ContactHistoryCampaign => ({...raw});
const mapContactHistoryKpiFromApi = (raw: ContactHistoryKpiApiPayload): ContactHistoryKpi => ({...raw});

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
