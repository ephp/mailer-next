import {OiFetch} from '@Oimmei-Digital-Boutique/crema-components';
import {baseUrl} from '@/shared/constants/AppConst';

// Excludes URLs that don't need the bearer token.
// TODO insert the project-specific ones here.
const anonymousPathRegex = /\/auth.*/;

const oiFetchInstance = new OiFetch(
  baseUrl,
  {
    credentials:
      (process.env.NEXT_PUBLIC_REQUEST_SAME_ORIGIN ?? 'same-origin') as RequestCredentials,
    headers: {
      // Enables cookie-based JWT authentication and refresh:
      'Oi-Cookie-Auth': '1',
    },
  },
  {
    refreshAuth: true,
    anonymousPathRegex,
  },
);

export default oiFetchInstance;
