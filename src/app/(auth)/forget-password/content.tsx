'use client';

import React from 'react';
import Button from '@mui/material/Button';
import {useFormik} from 'formik';
import {object as yupObject, string as yupString} from 'yup';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {SIGNIN} from '@/shared/constants/AppRoutes';
import {useAuthMethod} from '@/@oimmei/utility/AuthHooks';
import TextField from '@mui/material/TextField';
import {useTranslations} from 'next-intl';
import {Fonts} from '@/shared/constants/AppEnums';

const ForgetPasswordContent = () => {
  const t = useTranslations('security');

  const {forgotPassword} = useAuthMethod();

  const validationSchema = yupObject({
    email: yupString()
      .email(t('forgot_password_form.error.email.email'))
      .required(t('forgot_password_form.error.email.required')),
  });

  const {
    values,
    setValues,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFormik<{ email: string }>(
    {
      validationSchema,
      validateOnChange: true,
      initialValues: {email: ''},
      onSubmit: (data, {setSubmitting}) => {
        setSubmitting(true);
        forgotPassword(data)
          .finally(() => {
            setSubmitting(false);
          });
      },
    },
  );

  return (
    <Box sx={{width: '100%'}}>
      <Box sx={{mb: {xs: 8, xl: 10}}} textAlign={'center'}>
        <Typography
          variant="h2"
          component="h2"
          sx={{
            mb: 1.5,
            color: (theme) => (theme.vars ?? theme).palette.text.primary,
            fontWeight: Fonts.REGULAR,
            fontSize: {xs: 14, xl: 16},
          }}
        >
          {t("forgot_password_form.title")}
        </Typography>

        <Typography
          sx={{
            pt: 3,
            fontSize: 15,
            color: 'grey.500',
          }}
        >
            <span style={{marginRight: 4}}>
              {t(
                "forgot_password_form.messages.already_have_password",
              )}
            </span>
          <Box
            component="span"
            sx={{
              fontWeight: Fonts.MEDIUM,
              '& a': {
                color: (theme) => (theme.vars ?? theme).palette.primary.main,
                textDecoration: 'none',
              },
            }}
          >
            <Link href={SIGNIN}>
              {t(
                "forgot_password_form.messages.sign_in",
              )}
            </Link>
          </Box>
        </Typography>
      </Box>

      <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <Box
          component={'form'}
          onSubmit={handleSubmit}
          style={{textAlign: 'center'}}
          noValidate
          autoComplete="off"
        >
          <Box sx={{mb: {xs: 5, lg: 8}}}>
            <TextField
              placeholder={t("user.field.email")}
              name="email"
              label={t("user.field.email")}
              value={values.email}
              onChange={(event) => {
                setValues(v => ({
                  ...v,
                  email: event.target.value,
                }));
              }}
              error={!!errors.email}
              helperText={errors.email}
              sx={{
                width: '100%',
                '& .MuiInputBase-input': {
                  fontSize: 14,
                },
              }}
              variant="outlined"
            />
          </Box>

          <Box textAlign={"center"} mb={4}>
            <Button
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{
                fontWeight: Fonts.REGULAR,
                textTransform: 'none',
                fontSize: 16,
                minWidth: 160,
              }}
              type="submit"
            >
              {t("btn.send_new_password")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgetPasswordContent;
