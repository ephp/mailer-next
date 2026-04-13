import React, {createContext, ReactNode, useContext, useMemo, useState} from 'react';
import defaultConfig, {SidebarData} from './defaultConfig';

// TODO: double-check if all this stuff is actually needed (spoiler: probably not).
export interface SidebarContextData {
  sidebarBgColor: string;
  sidebarTextColor: string;
  sidebarHeaderColor: string;
  sidebarMenuSelectedBgColor: string;
  sidebarMenuSelectedTextColor: string;
  isSidebarBgImage: boolean;
  sidebarBgImage: string | number;
  borderColor?: string;
  sidebarWidth: number | string;

  // Added to handle the sidebar without Redux.
  navCollapsed: boolean;
}

export interface SidebarActions {
  updateSidebarColorSet: (color: SidebarData) => void;
  setSidebarBgImage: (isImage: boolean) => void;
  updateSidebarBgImage: (image: number) => void;
  updateSidebarWidth: (width: SidebarContextData['sidebarWidth']) => void;
  updateNavCollapsed: (newNavCollapsed: boolean) => void;
  toggleNavCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextData>({
  ...defaultConfig.sidebar.colorSet,
  isSidebarBgImage: defaultConfig.sidebar.isSidebarBgImage,
  sidebarBgImage: defaultConfig.sidebar.sidebarBgImage,
  borderColor: defaultConfig.sidebar.borderColor,
  sidebarWidth: defaultConfig.sidebar.sidebarWidth,
  navCollapsed: false,
});

const SidebarActionsContext = createContext<SidebarActions>({
  updateSidebarColorSet: () => {
  },
  setSidebarBgImage: () => {
  },
  updateSidebarBgImage: () => {
  },
  updateSidebarWidth: () => {
  },
  updateNavCollapsed: () => {
  },
  toggleNavCollapsed: () => {
  },
});

export const useSidebarContext =
  () => useContext(SidebarContext);

export const useSidebarActionsContext =
  () => useContext(SidebarActionsContext);

interface SidebarContextProviderProps {
  children: ReactNode;
}

const SidebarContextProvider: React.FC<SidebarContextProviderProps> = (
  {children},
) => {
  const [sidebarColorSet, updateSidebarColorSet] = useState<SidebarData>(
    defaultConfig.sidebar.colorSet,
  );
  const [isSidebarBgImage, updateImage] = useState<boolean>(
    defaultConfig.sidebar.isSidebarBgImage,
  );
  const [sidebarBgImage, setSidebarImage] = useState<string | number>(
    defaultConfig.sidebar.sidebarBgImage,
  );
  const [sidebarWidth, setSidebarWidth] =
    useState<SidebarContextData['sidebarWidth']>(defaultConfig.sidebar.sidebarWidth);

  const [
    navCollapsed,
    setNavCollapsed,
  ] = useState<SidebarContextData['navCollapsed']>(false);

  const actions = useMemo<SidebarActions>(() => ({
    updateSidebarColorSet,
    setSidebarBgImage: (isSidebarBgImage) => {
      updateImage(isSidebarBgImage);
    },
    updateSidebarBgImage: (sidebarBgImage) => {
      setSidebarImage(sidebarBgImage);
    },
    updateNavCollapsed: (newNavCollapsed) => {
      setNavCollapsed(newNavCollapsed);
    },
    updateSidebarWidth: (width) => {
      setSidebarWidth(width);
    },
    toggleNavCollapsed: () => {
      setNavCollapsed(n => !n);
    },
  }), []);

  return (
    <SidebarContext
      value={{
        ...sidebarColorSet,
        isSidebarBgImage,
        sidebarBgImage,
        borderColor: defaultConfig.sidebar.borderColor,
        sidebarWidth,
        navCollapsed,
      }}
    >
      <SidebarActionsContext
        value={actions}
      >
        {children}
      </SidebarActionsContext>
    </SidebarContext>
  );
};

export default SidebarContextProvider;
