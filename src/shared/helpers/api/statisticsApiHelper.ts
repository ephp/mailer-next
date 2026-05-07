import {oiFetch} from '@/@oimmei/services/auth';
import {DetailResult} from '@Oimmei-Digital-Boutique/crema-components';
import {AccountStats, MailListStats} from '@/types/models/Statistics';

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
