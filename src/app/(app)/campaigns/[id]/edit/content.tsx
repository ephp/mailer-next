'use client';

import React, {ReactElement, useCallback, useEffect} from 'react';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {useParams, useRouter} from 'next/navigation';
import {CAMPAIGN_CRUD_LIST} from '@/shared/constants/AppRoutes';
import useAsyncLoader from '@/@oimmei/utility/useAsyncLoader';
import {findCampaign} from '@/shared/helpers/api/campaignApiHelper';
import CampaignWizard from '@/components/campaign/CampaignWizard';

const CampaignEditContent = (): ReactElement => {
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();

  const {
    result: campaignWrapper,
    perform: fetchCampaign,
  } = useAsyncLoader(findCampaign, true);

  const onOperationCompleted = useCallback(() => {
    router.push(generatePathStorage(CAMPAIGN_CRUD_LIST));
  }, [router]);

  useEffect(() => {
    fetchCampaign({id: parseInt(idParam)}).catch(console.error);
  }, [fetchCampaign, idParam]);

  return (
    <CampaignWizard
      campaign={campaignWrapper?.item ?? null}
      editing={true}
      onOperationCompleted={onOperationCompleted}
    />
  );
};

export default CampaignEditContent;
