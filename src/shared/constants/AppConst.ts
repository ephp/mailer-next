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

/**
 * Origin where static media (uploaded logos, images, etc.) is hosted.
 * Stripped of any trailing slash so consumers can safely concatenate
 * `${mediaUrl}${path}` where `path` already starts with "/".
 */
export const mediaUrl = (process.env.NEXT_PUBLIC_MEDIA_URL ?? '').replace(/\/$/, '');

/**
 * Prefixes a relative server-stored URL with the media origin.
 * Pass-through if the value is already absolute (http://, https://, //).
 */
export const resolveMediaUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (/^(https?:)?\/\//.test(url)) return url;
  return `${mediaUrl}${url.startsWith('/') ? url : `/${url}`}`;
};

export const dayjsDateValueFormat = 'YYYY-MM-DD';
export const dayjsDateTimeValueFormat = 'YYYY-MM-DD HH:mm:ss';

export const initialUrl = DASHBOARD;
