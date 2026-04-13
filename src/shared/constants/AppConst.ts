import {DASHBOARD} from './AppRoutes';

export enum RoutePermittedRole {
  Admin = "admin",
  User = "user",
}

export const authRole: { [key: string]: RoutePermittedRole[] } = {
  admin: [RoutePermittedRole.Admin, RoutePermittedRole.User],
  user: [RoutePermittedRole.User],
};

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export const dayjsDateValueFormat = 'YYYY-MM-DD';
export const dayjsDateTimeValueFormat = 'YYYY-MM-DD HH:mm:ss';

export const initialUrl = DASHBOARD;
