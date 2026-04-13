'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Link from 'next/link';
import {default as MuiLink} from '@mui/material/Link';
import {SIGNIN} from '@/shared/constants/AppRoutes';
import {newAuthUserSignup} from '@/types/models/Auth/AuthUserSignup';
import {useAuthMethod} from '@/@oimmei/utility/AuthHooks';
import UserForm from '@/components/auth/UserForm';
import {useTranslations} from 'next-intl';

const SignupContent = () => {
  const t = useTranslations('security');

  const {signUpUser} = useAuthMethod();

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <UserForm<false>
        user={{...newAuthUserSignup}}
        editing={false}
        onSubmit={signUpUser}
        type={'user'}
      />

      <Box
        sx={{
          color: 'grey.500',
          textAlign: 'center',
          marginTop: 2,
        }}
      >
        <span style={{marginRight: 4}}>
          {t("sign_up_form.messages.already_have_account")}
        </span>
        <MuiLink
          component={Link}
          href={SIGNIN}
          sx={{
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          {t("sign_up_form.messages.sign_in")}
        </MuiLink>
      </Box>
    </Box>
  );
};

export default SignupContent;
