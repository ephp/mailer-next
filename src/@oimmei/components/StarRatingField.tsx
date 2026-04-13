import React, {ReactElement} from 'react';
import {Rating, RatingProps} from '@mui/material';
import Typography from '@mui/material/Typography';
import {useTranslations} from 'next-intl';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import {useTheme} from '@mui/material/styles';

export interface StarRatingFieldProps extends Omit<RatingProps, 'value'> {
  label: string;

  error?: boolean;

  helperText?: string;

  required?: boolean;

  // Re-defining this so it cannot be undefined (only controlled).
  value: number | null;
}

const StarRatingField = (
  {
    label,
    error,
    helperText,
    required,
    value,
    ...rest
  }: StarRatingFieldProps,
): ReactElement | null => {
  const t = useTranslations('messages');

  const theme = useTheme();

  // Hovered value, so the text string can change while the user selects it.
  const [hover, setHover] = React.useState<number>(-1);

  const labels: { [key: number]: string } = {
    0.5: 'half',
    1: 'one',
    1.5: 'one_and_half',
    2: 'two',
    2.5: 'two_and_half',
    3: 'three',
    3.5: 'three_and_half',
    4: 'four',
    4.5: 'four_and_half',
    5: 'five',
  };

  const getLabelText = (value: number): string => {
    return `${t('star_rating.label_text', {
      count: value,

      // Using the coercion to trick the typing system into validating this.
      label: t(`star_rating.rating.${labels[value] as 'half'}`),
    })}`;
  };

  return (
    <>
      <Typography
        component={'legend'}
        color={error ? (theme.vars ?? theme).palette.error.main : undefined}
      >
        {label}
        {required ? ' *' : ''}
      </Typography>

      <Box
        display={'flex'}
        alignItems={'flex-end'}
        sx={{
          '> .MuiRating-root .MuiRating-iconEmpty': {
            color: error ? (theme.vars ?? theme).palette.error.main : undefined,
          },
        }}
      >
        <Rating
          value={value}
          getLabelText={getLabelText}
          onChangeActive={(event, newHover) => {
            setHover(newHover);
          }}
          {...rest}
        />

        {(value !== null || hover !== -1) && (
          <Typography variant={'body2'} sx={{marginLeft: 2}}>
            {/* Using the coercion to trick the typing system into validating this.*/}
            {t(`star_rating.rating.${labels[(hover !== -1 ? hover : value)!] as 'half'}`)}
          </Typography>
        )}
      </Box>

      {helperText !== undefined && (
        <FormHelperText
          sx={{
            marginX: '4px',
            color: error ? (theme.vars ?? theme).palette.error.main : undefined,
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </>
  );
};

export default StarRatingField;
