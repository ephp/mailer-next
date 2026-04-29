// Disabling the check to avoid warning before setting up the routes.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {ReactNode} from 'react';
import {RoutePermittedRole} from '@/shared/constants/AppConst';

import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import {
  ACCOUNT_SETTINGS,
  USER_CRUD_LIST,
} from "@/shared/constants/AppRoutes";

/**
 * A title.
 */
export interface RouterConfigTitle {
  id: string;
  type: 'title';
  titleId: string;
  permittedRole?:
    | RoutePermittedRole
    | RoutePermittedRole[];
}

/**
 * A link item.
 */
export interface RouterConfigItem {
  id: string;
  type: 'item',
  messageId: string;
  icon?: string | ReactNode;
  permittedRole?:
    | RoutePermittedRole
    | RoutePermittedRole[];
  color?: string;
  url?: string;
  exact?: boolean;

  /**
   * Additional route that should mark this item as active.
   */
  matches?: {
    url?: string;
    exact?: boolean;
  }[];
}

/**
 * A divider.
 */
export interface RouterConfigDivider {
  id: string;
  type: 'divider';
  permittedRole?:
    | RoutePermittedRole
    | RoutePermittedRole[];
}

export type RouterConfigData =
  | RouterConfigTitle
  | RouterConfigItem
  | RouterConfigDivider

const routesConfig: RouterConfigData[] = [
  // {
  //   id: "app",
  //   title: "Sample",
  //   messageId: "sidebar.sample",
  //   type: "group",
  //   children: [
  // {
  //   id: "dashboard",
  //   title: "Dashboard",
  //   messageId: "messages.sidebar.dashboard",
  //   type: "item",
  //   icon: <FaHome/>,
  //   permittedRole: RoutePermittedRole.User,
  //   url: DASHBOARD,
  // },

  {
    id: "account",
    type: "title",
    titleId: "messages.sidebar.account",
  },

  {
    id: "account_settings",
    type: "item",
    messageId: "messages.sidebar.account_settings",
    icon: <BusinessIcon/>,
    permittedRole: RoutePermittedRole.User,
    url: ACCOUNT_SETTINGS,
  },

  {
    id: "account_divider",
    type: "divider",
  },

  {
    id: "admin",
    type: "title",
    titleId: "messages.sidebar.admin",
  },

  {
    id: "user_crud",
    type: "item",
    messageId: "messages.sidebar.users",
    icon: <PersonIcon/>,
    permittedRole: RoutePermittedRole.Admin,
    url: USER_CRUD_LIST,
  },

  {
    id: "admin_divider",
    type: "divider",
  },
  //   ],
  // },
];
export default routesConfig;
