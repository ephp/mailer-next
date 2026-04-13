import React, {ReactElement, useMemo} from "react";
import {
  object as yupObject,
  string as yupString,
  ref as yupRef,
} from "yup";
import {AuthUser} from "@/types/models/AuthUser";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {DASHBOARD} from "@/shared/constants/AppRoutes";
import Link from 'next/link';
import {FormikErrors, useFormik} from 'formik';
import {AuthUserSignup} from '@/types/models/Auth/AuthUserSignup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextPasswordField from '@/@oimmei/components/TextPasswordField';
import {useTranslations} from 'next-intl';

function UserForm<Editing extends boolean = false>(
  {
    user,
    editing,
    onSubmit,
    onDeleteProfileClicked,
    type,
  }: {
    user: Editing extends true ? AuthUser : AuthUserSignup
    editing: Editing
    onSubmit: (
      data: Editing extends true ? AuthUser : AuthUserSignup,
    ) => Promise<void>
    onDeleteProfileClicked?: () => void
    type: string
  },
): ReactElement | number {
  const t = useTranslations();

  const validationSchema =
    useMemo<ReturnType<typeof yupObject>>(
      () => {
        return yupObject({
          email: yupString()
            .email(
              t("security.user.error.email.email"),
            ).required(
              t("security.user.error.email.required"),
            ),

          ...(editing ? {} : {
            password: yupString()
              .required(
                t('security.common_password_form.error.password.required'),
              ),
            password_confirmation: yupString()
              .when('password', {
                is: (val: string) => val !== '',
                then: schema => schema
                  .required(
                    t('security.common_password_form.error.password_confirmation.required'),
                  )
                  .oneOf(
                    [yupRef('password')],
                    t('security.common_password_form.error.password_confirmation.match'),
                  ),
              })
            ,
          }),
        });
      },
      [t, editing],
    );

  const {
    values,
    setValues,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFormik<typeof user>(
    {
      validateOnBlur: true,
      validateOnChange: true,
      validationSchema,
      initialValues: {...user},
      onSubmit: (
        data,
        {setSubmitting},
      ) => {
        setSubmitting(true);

        onSubmit(data)
          .finally(() => {
            setSubmitting(false);
          });
      },
    },
  );

  return (
    <Box
      component={'form'}
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
    >
      <Grid container spacing={4}>
        <Grid size={12}>
          <TextField
            name={"email"}
            fullWidth
            label={t(`security.${type}.field.email` as Parameters<typeof t>[0])}
            value={values.email}
            onChange={(event) => {
              setValues(v => ({
                ...v,
                email: event.target.value,
              }));
            }}
            error={!!errors.email}
            helperText={errors.email as string}
            // Prevents visual issues with Chrome autofill:
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Grid>

        {!editing && (
          <>
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextPasswordField
                placeholder={t("security.user.field.password")}
                label={t("security.user.field.password")}
                name="password"
                variant="outlined"
                value={(values as AuthUserSignup).password}
                onChange={(event) => {
                  setValues(v => ({
                    ...v,
                    password: event.target.value,
                  }));
                }}
                error={!!(errors as FormikErrors<AuthUserSignup>).password}
                helperText={(errors as FormikErrors<AuthUserSignup>).password}
                // Prevents visual issues with Chrome autofill:
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-input": {
                    fontSize: 14,
                  },
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextPasswordField
                placeholder={
                  t("security.common_password_form.field.password_confirmation")
                }
                label={
                  t("security.common_password_form.field.password_confirmation")
                }
                name="password_confirmation"
                variant="outlined"
                value={(values as AuthUserSignup).password_confirmation}
                onChange={(event) => {
                  setValues(v => ({
                    ...v,
                    password_confirmation: event.target.value,
                  }));
                }}
                error={
                  !!(errors as FormikErrors<AuthUserSignup>).password_confirmation
                }
                helperText={
                  (errors as FormikErrors<AuthUserSignup>).password_confirmation
                }
                sx={{
                  width: "100%",
                  "& .MuiInputBase-input": {
                    fontSize: 14,
                  },
                }}
              />
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    id="remember_me"
                    name="remember_me"
                    checked={(values as AuthUserSignup).remember_me}
                    onChange={(
                      event,
                      checked,
                    ) => {
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
                    {t("security.login_form.messages.remember_me")}
                  </Box>
                }
              />
            </Grid>
          </>
        )}

        <Grid
          size={{
            xs: 12,
            md: 12,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: editing ? "flex-end" : "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            {onDeleteProfileClicked && (
              <Button
                sx={{
                  position: "relative",
                  minWidth: 100,
                }}
                variant="text"
                type="button"
                color="error"
                onClick={onDeleteProfileClicked}
              >
                {t("security.btn.delete_profile")}
              </Button>
            )}
            {editing && (
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
            )}
            <Button
              sx={{
                position: "relative",
                minWidth: 100,
                textTransform: editing ? undefined : 'capitalize',
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
  );
}

export default UserForm;
