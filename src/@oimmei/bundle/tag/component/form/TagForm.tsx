import {ReactElement} from "react";
import * as yup from "yup";
import {useTranslations} from "next-intl";
import {useAsyncCallHelper2Actions} from "@/@oimmei/services/context/AsyncCallHelper2Provider";
import {useFormik} from "formik";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import SkeletonWrapper from "@/@oimmei/components/SkeletonWrapper";
import TextField from "@mui/material/TextField";
import {generatePathStorage, DetailResult} from "@Oimmei-Digital-Boutique/crema-components";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Link from "next/link";
import {Tag} from "@/@oimmei/bundle/tag/type/model/Tag";

interface TagFormProps<T extends Tag = Tag> {
  tag: T | null;

  /**
   * TRUE if the entity is being loaded for the first time.
   */
  loading?: boolean;

  /**
   * Route to navigate back to the list
   */
  listRoute: string;

  /**
   * Function to save (create or update) a tag
   */
  saveTagAction: (params: { entity: T }) => Promise<DetailResult<T>>;

  /**
   * Callback executed when operation is completed successfully
   */
  onOperationCompleted: () => void;
}

export default function TagForm<T extends Tag = Tag>(
  {
    tag,
    loading = false,
    listRoute,
    saveTagAction,
    onOperationCompleted,
  }: TagFormProps<T>,
): ReactElement | null {
  const t = useTranslations();

  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const isEdit = tag !== null && tag.id > 0;

  const validationSchema = yup.object({
    label: yup.string()
      .nullable()
      .required(t('tag.field.label') + ' è richiesto'),
    color: yup.string()
      .nullable()
      .matches(/^#[0-9A-F]{6}$/i, 'Colore non valido')
      .required(t('tag.field.color') + ' è richiesto'),
  });

  const {
    values,
    errors,
    isSubmitting,
    handleSubmit,
    touched,
    setFieldValue,
  } = useFormik<T>(
    {
      validateOnBlur: true,
      validationSchema,
      initialValues: tag ?? {
        id: 0,
        label: '',
        color: '#000000',
      } as T,
      enableReinitialize: true,
      onSubmit: async (data, {setSubmitting}) => {
        let operationCompleted = false;

        setSubmitting(true);
        try {
          await performAsyncCall(saveTagAction({entity: {...data}}));
          operationCompleted = true;
        } finally {
          setSubmitting(false);
        }

        if (operationCompleted) {
          onOperationCompleted();
        }
      },
    },
  );

  const skeletonWrapping = tag === null;

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
              name={'label'}
              label={t('tag.field.label')}
              value={values.label}
              onChange={event => {
                setFieldValue('label', event.target.value);
              }}
              error={touched.label && !!errors.label}
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: !!values.label,
                },
              }}
            />
          </SkeletonWrapper>
        </Grid>

        <Grid size={12}>
          <SkeletonWrapper loading={loading} wrapping={skeletonWrapping} width={'100%'}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                name={'color'}
                label={t('tag.field.color')}
                value={values.color}
                onChange={event => {
                  setFieldValue('color', event.target.value);
                }}
                error={touched.color && !!errors.color}
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: !!values.color,
                  },
                }}
              />
              <Box
                sx={{
                  minWidth: 56,
                  height: 56,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="color"
                  value={values.color}
                  onChange={(e) => setFieldValue('color', e.target.value)}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              </Box>
            </Stack>
          </SkeletonWrapper>
        </Grid>

        <Grid size={12} marginTop={4}>
          <Stack
            direction={'row'}
            justifyContent={'flex-end'}
            alignItems={'center'}
            flexWrap={'wrap'}
            gap={1}
            useFlexGap
            marginBottom={3}
          >
            <Button
              component={Link}
              variant="outlined"
              href={generatePathStorage(listRoute)}
              sx={{
                position: "relative",
                minWidth: 100,
              }}
            >
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
              disabled={isSubmitting || tag === null}
            >
              {isEdit ? t("tag.btn.edit") : t("tag.btn.create")}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}