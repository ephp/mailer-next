'use client';

import React, {ReactElement} from 'react';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {useRouter} from 'next/navigation';
import {CAMPAIGN_CRUD_LIST} from '@/shared/constants/AppRoutes';
import CampaignWizard from '@/components/campaign/CampaignWizard';

const CampaignNewContent = (): ReactElement => {
  const router = useRouter();

  const onOperationCompleted = (): void => {
    router.push(generatePathStorage(CAMPAIGN_CRUD_LIST));
  };

  return (
    <CampaignWizard
      campaign={null}
      editing={false}
      onOperationCompleted={onOperationCompleted}
    />
  );
};

export default CampaignNewContent;
