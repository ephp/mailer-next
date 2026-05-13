'use client';

import React, {ReactElement} from "react";
import {useFormik} from "formik";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Link from "next/link";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {newUser, User} from '@/types/models/User';
import {USER_CRUD_LIST} from '@/shared/constants/AppRoutes';
import TextField from '@mui/material/TextField';
import {
  useAsyncCallHelper2Actions,
} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {createUser, updateUser} from '@/shared/helpers/api/userApiHelper';
import {useTranslations} from 'next-intl';
import SkeletonWrapper from '@/@oimmei/components/SkeletonWrapper';

const UserForm = (
  {
    user,
    editing,
    loading = false,
    onOperationCompleted,
  }: {
    /**
     * The user may be NULL, to display skeletons in loading states.
     */
    user: User | null

    editing: boolean

    /**
     * TRUE if the user is being loaded for the first time.
     */
    loading?: boolean

    onOperationCompleted: () => void
  },
): ReactElement | null => {
  const t = useTranslations();

  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const validationSchema = yup.object({
    email: yup.string()
      .email(
        t("security.user.error.email.email"),
      ).required(
        t("security.user.error.email.required"),
      ),
  });

  const {
    values,
    setValues,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFormik<User>(
    {
      validateOnBlur: true,
      validationSchema,
      initialValues: user ?? newUser,
      enableReinitialize: true,
      onSubmit: async (data, {setSubmitting}) => {
        let operationCompleted = false;

        setSubmitting(true);
        try {
          if (!editing) {
            await performAsyncCall(createUser({entity: {...data}}));
          } else {
            await performAsyncCall(updateUser({entity: {...data}}));
          }

          operationCompleted = true;
        } catch (error) {
          console.error(error);
        } finally {
          setSubmitting(false);
        }

        if (operationCompleted) {
          onOperationCompleted();
        }
      },
    },
  );

  const skeletonWrapping = user === null;

  return (
    <Box
      component={'form'}
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
    >
      <Grid container spacing={4}>
        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={skeletonWrapping} width={'100%'}>
            <TextField
              name={"email"}
              fullWidth
              label={t("security.user.field.email")}
              value={values.email}
              onChange={(event) => {
                setValues(v => ({
                    ...v,
                    email: event.target.value,
                  }),
                );
              }}
              error={!!errors.email}
              helperText={errors.email}
              slotProps={{
                inputLabel: {
                  // To prevent style issues with browser autocomplete.
                  shrink: true,
                },
              }}
            />
          </SkeletonWrapper>
        </Grid>
        <Grid
          mt={4}
          size={{
            xs: 12,
            md: 12,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              mb: 3,
            }}
          >
            <Button
              component={Link}
              variant="outlined"
              href={
                generatePathStorage(USER_CRUD_LIST)
              }
              sx={{
                position: "relative",
                minWidth: 100,
              }}>
              {t("messages.btn.back_to_list")}
            </Button>
            <Button
              sx={{
                position: "relative",
                minWidth: 100,
              }}
              color="primary"
              variant="contained"
              type="submit"
              disabled={isSubmitting || user === null}
            >
              {
                !editing ?
                  t("security.btn.create_user") :
                  t("messages.btn.edit")
              }
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserForm;
