'use client';

import React, {useState} from 'react';
import Button from '@mui/material/Button';
import {useRouter} from 'next/navigation';
import {useSnackbar} from 'notistack';
import {useTranslations} from 'next-intl';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {WIZARD_STEP_1} from '@/shared/constants/AppRoutes';
import {createCampaign} from '@/shared/helpers/api/campaignApiHelper';

export default function NewCampaignButton() {
  const router = useRouter();
  const {enqueueSnackbar} = useSnackbar();
  const t = useTranslations('campaign');
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await createCampaign();
      if (res?.item?.id) {
        router.push(generatePathStorage(WIZARD_STEP_1, {id: res.item.id.toString()}));
      }
    } catch {
      enqueueSnackbar({message: t('error.not_found'), variant: 'error'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="contained" onClick={handleClick} disabled={loading}>
      {t('btn.create')}
    </Button>
  );
}
