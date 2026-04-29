import {getRequestConfig} from 'next-intl/server';
import defaultConfig from '@/@oimmei/utility/AppContextProvider/defaultConfig';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const locale = defaultConfig.locale.locale;

  return {
    locale,
    messages: {
      account: (await import(`../../messages/${locale}/account.json`)).default,
      campaign: (await import(`../../messages/${locale}/campaign.json`)).default,
      contact: (await import(`../../messages/${locale}/contact.json`)).default,
      dashboard: (await import(`../../messages/${locale}/dashboard.json`)).default,
      error: (await import(`../../messages/${locale}/error.json`)).default,
      geojson: (await import(`../../messages/${locale}/geojson.json`)).default,
      gmaps: (await import(`../../messages/${locale}/gmaps.json`)).default,
      language: (await import(`../../messages/${locale}/language.json`)).default,
      maillist: (await import(`../../messages/${locale}/maillist.json`)).default,
      messages: (await import(`../../messages/${locale}/messages.json`)).default,
      security: (await import(`../../messages/${locale}/security.json`)).default,
      translation: (await import(`../../messages/${locale}/translation.json`)).default,
    },
  };
});
