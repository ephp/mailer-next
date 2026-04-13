import React, {ReactElement} from 'react';
import AppLoader from '@/@oimmei/core/AppLoader';

export default function Loading(): ReactElement {
  // You can add any UI inside Loading, including a Skeleton.
  return <AppLoader/>
}
