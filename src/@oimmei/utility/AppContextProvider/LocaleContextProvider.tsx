import React, {createContext, ReactNode, useContext, useState} from 'react';
import defaultConfig from './defaultConfig';

export interface LanguageProps {
  languageId: string;
  locale: string;
  name: string;
}

export interface LocaleContextData {
  locale: LanguageProps;
  rtlLocale: string[];
}

export interface LocaleActionsData {
  updateLocale: (locale: LanguageProps) => void;
}

export const LocaleContext = createContext<LocaleContextData>({
  locale: defaultConfig.locale,
  rtlLocale: defaultConfig.rtlLocale,
});
export const LocaleActionsContext = createContext<LocaleActionsData>({
  updateLocale: () => {
  },
});

export const useLocaleContext =
  () => useContext(LocaleContext);

export const useLocaleActionsContext =
  () => useContext(LocaleActionsContext);

interface LocaleContextProviderProps {
  children: ReactNode;
}

const LocaleContextProvider: React.FC<LocaleContextProviderProps> = (
  {children},
) => {
  const [locale, updateLocale] =
    useState<LanguageProps>(defaultConfig.locale);

  // TODO implement a logic to make the theme RTL if the context requires it.

  return (
    <LocaleContext
      value={{
        locale,
        rtlLocale: defaultConfig.rtlLocale,
      }}
    >
      <LocaleActionsContext
        value={{
          updateLocale,
        }}
      >
        {children}
      </LocaleActionsContext>
    </LocaleContext>
  );
};

export default LocaleContextProvider;
