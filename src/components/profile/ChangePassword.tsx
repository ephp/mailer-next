'use client';

import React, {useMemo} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import {useFormik} from "formik";
import {DASHBOARD} from "@/shared/constants/AppRoutes";
import Link from 'next/link';
import {
  object as yupObject,
  string as yupString,
  ref as yupRef,
} from 'yup';
import {useAuthMethod} from '@/@oimmei/utility/AuthHooks';
import TextPasswordField from '@/@oimmei/components/TextPasswordField';
import {useTranslations} from 'next-intl';

const ChangePassword = () => {
  const t = useTranslations();

  const {changePassword} = useAuthMethod();

  const validationSchema =
    useMemo<ReturnType<typeof yupObject>>(
      () => {
        return yupObject({
          oldPassword: yupString()
            .required(
              t("security.profile.change_password_form.error.old_password.required"),
            ),
          newPassword: yupString()
            .required(
              t("security.profile.change_password_form.error.new_password.required"),
            )
            .min(
              8,
              t(
                "security.profile.change_password_form.error.new_password.min",
                {
                  n: 8,
                },
              ),
            ),
          retypeNewPassword: yupString()
            .oneOf(
              [yupRef("newPassword"), ''],
              t("security.profile.change_password_form.error.new_password_confirmation.match"),
            ),
        });
      },
      [t],
    );

  const {
    values,
    setValues,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFormik<{
    oldPassword: string
    newPassword: string
    retypeNewPassword: string
  }>(
    {
      validationSchema,
      validateOnChange: true,
      validateOnBlur: true,
      initialValues: {
        oldPassword: "",
        newPassword: "",
        retypeNewPassword: "",
      },
      onSubmit: (
        data,
        {setSubmitting},
      ) => {
        setSubmitting(true);
        changePassword({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          newPasswordConfirmation: data.retypeNewPassword,
        })
          .finally(() => {
            setSubmitting(false);
          });
      },
    },
  );

  return (
    <Box
      sx={{
        position: "relative",
      }}
    >
      <Box
        component={'form'}
        onSubmit={handleSubmit}
        autoComplete="off"
        noValidate
      >
        <Grid container spacing={4}>
          <Grid
            size={{
              xs: 12,
              md: 12,
            }}
          >
            <TextPasswordField
              name="oldPassword"
              fullWidth
              label={t("security.profile.change_password_form.field.old_password")}
              value={values.oldPassword}
              onChange={(event) => {
                setValues(v => ({
                  ...v,
                  oldPassword: event.target.value,
                }));
              }}
              error={!!errors.oldPassword}
              helperText={errors.oldPassword}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextPasswordField
              name="newPassword"
              fullWidth
              label={t("security.profile.change_password_form.field.new_password")}
              value={values.newPassword}
              onChange={(event) => {
                setValues(v => ({
                  ...v,
                  newPassword: event.target.value,
                }));
              }}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextPasswordField
              name="retypeNewPassword"
              fullWidth
              label={t("security.profile.change_password_form.field.new_password_confirmation")}
              value={values.retypeNewPassword}
              onChange={(event) => {
                setValues(v => ({
                  ...v,
                  retypeNewPassword: event.target.value,
                }));
              }}
              error={!!errors.retypeNewPassword}
              helperText={errors.retypeNewPassword}
            />
          </Grid>
          <Grid
            marginTop={3}
            size={{
              xs: 12,
              md: 12,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Button
                component={Link}
                sx={{
                  position: "relative",
                  minWidth: 100,
                }}
                color="primary"
                variant="outlined"
                href={DASHBOARD}
              >
                {t("messages.btn.cancel")}
              </Button>
              <Button
                sx={{
                  position: "relative",
                  minWidth: 100,
                }}
                color="primary"
                variant="contained"
                type="submit"
                disabled={isSubmitting}
              >
                {t("messages.btn.save")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ChangePassword;
