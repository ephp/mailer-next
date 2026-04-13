import {lazy} from 'react';

export default function asyncComponent(importComponent: any) {
  // Using the native lazy instead of next/dynamic because the latter
  // sometimes doesn't work with SSR for whatever reason.
  return lazy(importComponent);
}
