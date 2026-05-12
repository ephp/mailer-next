// Disabling the check to avoid warning before setting up the routes.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {ReactNode} from 'react';
import {RoutePermittedRole} from '@/shared/constants/AppConst';

import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import ListIcon from '@mui/icons-material/List';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArticleIcon from '@mui/icons-material/Article';
import BarChartIcon from '@mui/icons-material/BarChart';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import {
  ACCOUNT_SETTINGS,
  API_DOCS,
  CAMPAIGN_CRUD_LIST,
  CAMPAIGN_TEMPLATES,
  MAIL_LIST_CRUD_LIST,
  STATISTICS,
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
    icon: <SettingsIcon/>,
    permittedRole: RoutePermittedRole.User,
    url: ACCOUNT_SETTINGS,
  },

  {
    id: "api_docs",
    type: "item",
    messageId: "messages.sidebar.api_docs",
    icon: <IntegrationInstructionsIcon/>,
    permittedRole: RoutePermittedRole.User,
    url: API_DOCS,
  },

  {
    id: "account_divider",
    type: "divider",
  },

  {
    id: "mailing",
    type: "title",
    titleId: "messages.sidebar.mailing",
  },

  {
    id: "mail_list_crud",
    type: "item",
    messageId: "messages.sidebar.lists",
    icon: <ListIcon/>,
    permittedRole: RoutePermittedRole.User,
    url: MAIL_LIST_CRUD_LIST,
    matches: [
      {url: MAIL_LIST_CRUD_LIST},
    ],
  },

  {
    id: "campaign_crud",
    type: "item",
    messageId: "messages.sidebar.campaigns",
    icon: <CampaignIcon/>,
    permittedRole: RoutePermittedRole.User,
    url: CAMPAIGN_CRUD_LIST,
    matches: [
      {url: CAMPAIGN_CRUD_LIST},
    ],
  },

  {
    id: "campaign_templates",
    type: "item",
    messageId: "messages.sidebar.templates",
    icon: <ArticleIcon/>,
    permittedRole: RoutePermittedRole.User,
    url: CAMPAIGN_TEMPLATES,
    matches: [
      {url: CAMPAIGN_TEMPLATES},
    ],
  },

  {
    id: "statistics",
    type: "item",
    messageId: "messages.sidebar.statistics",
    icon: <BarChartIcon/>,
    permittedRole: RoutePermittedRole.User,
    url: STATISTICS,
    matches: [
      {url: STATISTICS},
    ],
  },

  {
    id: "mailing_divider",
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
