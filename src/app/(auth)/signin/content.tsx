'use client';

import React from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import {useFormik} from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import {FORGET_PASSWORD} from '@/shared/constants/AppRoutes';
import FormControlLabel from '@mui/material/FormControlLabel';
import {useAuthMethod} from '@/@oimmei/utility/AuthHooks';
import Link from 'next/link';
import TextPasswordField from '@/@oimmei/components/TextPasswordField';
import {useTranslations} from 'next-intl';


const SigninContent = () => {
  const t = useTranslations('security');

  const {signInUser} = useAuthMethod();

  const validationSchema = yup.object({
    email: yup.string()
      .email(t('login_form.error.email.email'))
      .required(t('login_form.error.email.required')),
    password: yup.string()
      .required(t('login_form.error.password.required')),
  });

  const {
    values,
    setValues,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFormik<{ email: string, password: string, remember_me: boolean }>(
    {
      validateOnChange: true,
      validationSchema,
      initialValues: {
        email: '',
        password: '',
        remember_me: true,
      },
      onSubmit: (
        data,
        {setSubmitting},
      ) => {
        setSubmitting(true);
        signInUser(
          {
            username: data.email,
            password: data.password,
            rememberMe: data.remember_me,
          },
        )
          .finally(() => {
            setSubmitting(false);
          });
      },
    },
  );

  return (
    <>
      <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', mb: 5}}>
          <Box
            component={'form'}
            onSubmit={handleSubmit}
            style={{textAlign: 'center'}}
            noValidate
            autoComplete="off"
          >
            <Box sx={{mb: {xs: 5, xl: 8}}}>
              <TextField
                placeholder={t('user.field.email')}
                name="email"
                label={t("user.field.email")}
                variant="outlined"
                value={values.email}
                onChange={(event) => {
                  setValues(v => ({
                    ...v,
                    email: event.target.value,
                  }));
                }}
                autoFocus
                slotProps={{
                  inputLabel: {
                    // Prevents visual issues with Chrome autofill:
                    shrink: true,
                  },
                }}
                error={!!errors.email}
                helperText={errors.email}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-input': {
                    fontSize: 14,
                  },
                }}
              />
            </Box>

            <Box sx={{mb: {xs: 3, xl: 4}}}>
              <TextPasswordField
                placeholder={t('user.field.password')}
                label={t("user.field.password")}
                name="password"
                variant="outlined"
                value={values.password}
                onChange={(event) => {
                  setValues(v => ({
                    ...v,
                    password: event.target.value,
                  }));
                }}
                slotProps={{
                  inputLabel: {
                    // Prevents visual issues with Chrome autofill:
                    shrink: true,
                  },
                }}
                error={!!errors.password}
                helperText={errors.password}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-input': {
                    fontSize: 14,
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                mb: {xs: 3, xl: 4},
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      id="remember_me"
                      name="remember_me"
                      checked={values.remember_me}
                      onChange={(event, checked) => {
                        setValues(v => ({
                          ...v,
                          remember_me: checked,
                        }));
                      }}
                    />
                  }
                  label={
                    <Box
                      component="span"
                      sx={{
                        color: 'grey.500',
                      }}
                    >
                      {t("login_form.messages.remember_me")}
                    </Box>
                  }
                />
              </Box>
            </Box>

            <div>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                sx={{
                  minWidth: 160,
                  fontSize: 16,
                  textTransform: 'capitalize',
                  padding: '4px 16px 8px',
                }}
              >
                {t("btn.login")}
              </Button>
            </div>

            <Box
              textAlign={"center"}
              sx={{mt: 3}}
            >
              <Button
                component={Link}
                variant={"link"}
                color={'primary'}
                href={FORGET_PASSWORD}
              >
                {t("login_form.messages.forgot_password")}
              </Button>
              {/* TODO: signup button, uncomment if needed. */}
              {/*<Button*/}
              {/*  component={Link}*/}
              {/*  variant={"link"}*/}
              {/*  color={'primary'}*/}
              {/*  href={SIGNUP}*/}
              {/*  sx={{marginTop: 1}}*/}
              {/*>*/}
              {/*  {t("btn.register", {ns: 'messages'})}*/}
              {/*</Button>*/}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* TODO: signup button, uncomment if needed. */}
      {/*<Box sx={{ width: "100%", textAlign: "center" }}>*/}
      {/*  <Button*/}
      {/*    component={Link}*/}
      {/*    variant={"text"}*/}
      {/*    href={SIGNUP}*/}
      {/*  >*/}
      {/*    {t("btn.register", {ns: 'messages'})}*/}
      {/*  </Button>*/}
      {/*</Box>*/}
    </>
  );
};

export default SigninContent;
