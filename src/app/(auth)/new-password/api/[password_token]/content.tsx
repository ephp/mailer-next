'use client';

import React from "react";
import Button from "@mui/material/Button";
import {useFormik} from "formik";
import {
  object as yupObject,
  string as yupString,
  ref as yupRef,
} from "yup";
import Box from "@mui/material/Box";
import {default as MuiLink} from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import {Fonts} from "@/shared/constants/AppEnums";
import Link from 'next/link';
import {useAuthMethod} from '@/@oimmei/utility/AuthHooks';
import {SIGNIN} from '@/shared/constants/AppRoutes';
import TextPasswordField from '@/@oimmei/components/TextPasswordField';
import {useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';

const ResetPasswordComponent = () => {
  const t = useTranslations('security');

  const {password_token: passwordToken} = useParams<{ password_token: string }>();

  const {resetPassword} = useAuthMethod();

  const validationSchema = yupObject({
    password: yupString()
      .required(
        t("common_password_form.error.password.required"),
      ),
    password_confirmation: yupString()
      .required(
        t("common_password_form.error.password_confirmation.required"),
      )
      .oneOf(
        [yupRef('password')],
        t("common_password_form.error.password_confirmation.match"),
      ),
  });

  const {
    values,
    setValues,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFormik<{
    password: string
    password_confirmation: string
  }>(
    {
      validationSchema,
      validateOnChange: true,
      initialValues: {
        password: "",
        password_confirmation: "",
      },
      onSubmit: (data, {setSubmitting}) => {
        setSubmitting(true);
        resetPassword(
          {
            passwordToken,
            password: data.password,
            passwordConfirmation: data.password_confirmation,
          },
        ).finally(() => {
          setSubmitting(false);
        });
      },
    },
  );

  return (
    <Box sx={{width: "100%"}}>
      <Box sx={{mb: {xs: 8, xl: 10}}} textAlign={"center"}>
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
          {t("reset_password_form.title")}
        </Typography>

        <Typography
          sx={{
            pt: 3,
            fontSize: 15,
            color: "grey.500",
          }}
        >
            <span style={{marginRight: 4}}>
              {t("reset_password_form.description")}
            </span>
        </Typography>
      </Box>

      <Box sx={{flex: 1, display: "flex", flexDirection: "column"}}>
        <Box sx={{flex: 1, display: "flex", flexDirection: "column"}}>
          <Box
            component={'form'}
            onSubmit={handleSubmit}
            autoComplete={'off'}
            noValidate
          >
            <Box sx={{mb: {xs: 5, xl: 8}}}>
              <TextPasswordField
                placeholder={
                  t("user.field.password")
                }
                label={t("user.field.password")}
                name="password"
                value={values.password}
                onChange={(event) => {
                  setValues(v => ({
                    ...v,
                    password: event.target.value,
                  }));
                }}
                error={!!errors.password}
                helperText={errors.password}
                variant="outlined"
                sx={{
                  width: "100%",
                  "& .MuiInputBase-input": {
                    fontSize: 14,
                  },
                }}
              />
            </Box>
            <Box sx={{mb: {xs: 5, lg: 8}}}>
              <TextPasswordField
                placeholder={
                  t("common_password_form.field.password_confirmation")
                }
                label={
                  t("common_password_form.field.password_confirmation")
                }
                name="password_confirmation"
                value={values.password_confirmation}
                onChange={(event) => {
                  setValues(v => ({
                    ...v,
                    password_confirmation: event.target.value,
                  }));
                }}
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation}
                variant="outlined"
                sx={{
                  width: "100%",
                  "& .MuiInputBase-input": {
                    fontSize: 14,
                  },
                }}
              />
            </Box>

            <Box textAlign={"center"}>
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{
                  fontWeight: Fonts.REGULAR,
                  textTransform: "none",
                  fontSize: 16,
                  minWidth: 160,
                }}
                type="submit"
              >
                {t("btn.reset_password")}
              </Button>
            </Box>

            <Box
              textAlign={"center"}
              mt={4}
            >
              <MuiLink
                component={Link}
                href={SIGNIN}
                sx={{
                  color: (theme) => (theme.vars ?? theme).palette.primary.main,
                  fontWeight: Fonts.MEDIUM,
                  cursor: "pointer",
                  display: "block",
                  textDecoration: "none",
                }}
              >
                {t("common_password_form.messages.sign_in")}
              </MuiLink>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPasswordComponent;
