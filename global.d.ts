import tag from './src/@oimmei/bundle/tag/messages/it/tag.json';
import dashboard from './messages/it/dashboard.json';
import error from './messages/it/error.json';
import geojson from './messages/it/geojson.json';
import gmaps from './messages/it/gmaps.json';
import language from './messages/it/language.json';
import messages from './messages/it/messages.json';
import security from './messages/it/security.json';
import translation from './messages/it/translation.json';

/**
 * TypeScript integration for next-intl, in
 * order to statically validate the messages.
 *
 * @link https://next-intl.dev/docs/workflows/typescript#messages
 */
interface Messages {
  tag: typeof tag;
  dashboard: typeof dashboard;
  error: typeof error;
  geojson: typeof geojson;
  gmaps: typeof gmaps;
  language: typeof language;
  messages: typeof messages;
  security: typeof security;
  translation: typeof translation;
}

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {
  }
}
