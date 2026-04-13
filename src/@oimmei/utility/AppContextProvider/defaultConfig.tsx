export interface HeaderData {
  /**
   * Header height, in pixels.
   */
  headerHeight: number;
}

export const Header: HeaderData = {
  headerHeight: 48,
};

export interface SidebarData {
  sidebarBgColor: string;
  sidebarTextColor: string;
  sidebarHeaderColor: string;
  sidebarMenuSelectedBgColor: string;
  sidebarMenuSelectedTextColor: string;
}

export const LightSidebar: SidebarData = {
  sidebarBgColor: '#fff',
  sidebarTextColor: 'rgba(0, 0, 0, 0.60)',
  sidebarHeaderColor: '#fff',
  sidebarMenuSelectedBgColor: '#F4F7FE',
  sidebarMenuSelectedTextColor: 'rgba(0, 0, 0, 0.87)',
};

const defaultConfig = {
  header: {
    headerHeight: Header.headerHeight,
  },
  sidebar: {
    borderColor: '#757575',
    isSidebarBgImage: false,
    sidebarBgImage: 1,
    sidebarWidth: 240,
    colorSet: LightSidebar,
  },
  locale: {
    languageId: 'italian',
    locale: 'it',
    name: 'Italiano',
    icon: 'it',
  },
  rtlLocale: ['ar'],
};
export default defaultConfig;
