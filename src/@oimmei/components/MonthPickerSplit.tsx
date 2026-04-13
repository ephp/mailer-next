import React, {ReactElement} from 'react';
import {useTranslations} from 'next-intl';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  DatePicker,
  DatePickerFieldProps,
  DatePickerProps,
  LocalizationProvider, usePickerContext, usePickerTranslations,
} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {
  useLocaleContext,
} from '../utility/AppContextProvider/LocaleContextProvider';
import dayjs from '@/shared/utils/dayjs';
import {Dayjs} from 'dayjs';
import EventIcon from '@mui/icons-material/Event';

export interface MonthPickerSplitProps {
  value: Dayjs | null;

  onChange: (newValue: Dayjs | null) => void;

  mode?: 'week' | 'month' | 'year';

  /**
   * Renders the component is a more compact mode when small.
   */
  size?: 'small' | 'medium';

  /**
   * If FALSE, the "today" button won't be displayed.
   */
  useTodayButton?: boolean;
}

/**
 * Subcomponents necessary for rendering a non-editable, button field date picker.
 *
 * Borrowed from {@link https://mui.com/x/react-date-pickers/custom-field/#using-a-button}.
 */
interface ButtonFieldProps extends DatePickerFieldProps {
  label?: React.ReactNode;

  disabled?: boolean;

  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ButtonField = (
  props: ButtonFieldProps,
): ReactElement | null => {
  const t = useTranslations('messages');

  // TODO: this is after the upgrade. Does it work?
  const pickerContext = usePickerContext();

  const translations = usePickerTranslations();
  const ariaLabel = translations.openDatePickerDialogue(null);

  const {
    setOpen,
    label,
    id,
    disabled,
  } = props;

  return (
    <Button
      variant={'outlined'}
      id={id}
      disabled={disabled}
      ref={pickerContext.triggerRef}
      aria-label={ariaLabel}
      onClick={() => setOpen?.((prev) => !prev)}
      disableElevation
      endIcon={<EventIcon/>}
    >
      {label ?? t('common.placeholders.select')}
    </Button>
  );
};

const ButtonDatePicker = (
  props: Omit<DatePickerProps, 'open' | 'onOpen' | 'onClose'>,
): ReactElement | null => {
  const [
    open,
    setOpen,
  ] = React.useState<boolean>(false);

  const {label, disabled} = props;

  return (
    <DatePicker
      {...props}
      slots={{...props.slots, field: ButtonField}}
      slotProps={{
        ...props.slotProps,

        field: {
          setOpen,
          label,
          disabled,
          ...props.slotProps?.field,
        } as ButtonFieldProps,
      }}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    />
  );
};

/**
 * A month picker, dealing with Dayjs objects.
 *
 * The maximum granularity is week; also picks months and years.
 *
 * Suggested usage is with dayjs().startOf('month'), but
 * it should work fine even with regular dayjs dates.
 */
const MonthPickerSplit = (
  {
    value,
    onChange,
    mode = 'month',
    size = 'medium',
    useTodayButton = true,
  }: MonthPickerSplitProps,
): ReactElement | null => {
  const {locale} = useLocaleContext();

  const t = useTranslations('messages');

  // Checking if the given value is in the current time span or not.
  const checkValueInCurrentTimeSpan = (): boolean => {
    const today = dayjs();

    switch (mode) {
      case 'week':
        return value !== null
          && value.startOf('week').isSame(today.startOf('week'), 'days');
      case 'month':
        return value !== null
          && value.month() === today.month()
          && value.year() === today.year();
      case 'year':
        return value !== null
          && value.year() === today.year();
    }
  };
  const isValueInCurrentTimeSpan =
    checkValueInCurrentTimeSpan();

  const handleTodayButtonClicked = (): void => {
    onChange(dayjs().startOf(mode));
  };

  const handlePreviousButtonClicked = (): void => {
    onChange(value?.subtract(1, mode) ?? null);
  };

  const handleNextButtonClicked = (): void => {
    onChange(value?.add(1, mode) ?? null);
  };

  return (
    <Stack direction={'row'} spacing={1} useFlexGap>
      {useTodayButton && (
        <Button
          variant={'outlined'}
          onClick={handleTodayButtonClicked}
          color={'primary'}
          size={'small'}
          disabled={isValueInCurrentTimeSpan}
        >
          {t('date_picker_split.today')}
        </Button>
      )}

      {size !== 'small' && (
        <IconButton
          onClick={handlePreviousButtonClicked}
          size={'small'}
        >
          <NavigateBeforeIcon/>
        </IconButton>
      )}

      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale={locale.locale}
      >
        <ButtonDatePicker
          value={value}
          onChange={onChange}
          // Using the label to display the format I'm interested in.
          label={value !== null ? (
            mode === 'week' ? (
                size !== 'small' ?
                  t('date_picker_split.week_format', {
                    week_number: value?.week(),
                    start_date: value?.startOf('week').format('L'),
                    end_date: value?.endOf('week').format('L'),
                  }) :
                  `${value?.startOf('week').format('L')} - ${
                    value?.endOf('week').format('L')}`
              ) :
              (mode === 'month' ? value?.format('MMMM YYYY') :
                value?.year().toString())
          ) : '-'}
          views={mode === 'week' ? ['year', 'month', 'day'] :
            (mode === 'month' ? ['year', 'month'] : ['year'])}
          openTo={mode === 'week' ? 'day' : (mode === 'month' ? 'month' : 'year')}
          displayWeekNumber
        />
      </LocalizationProvider>

      {size !== 'small' && (
        <IconButton
          onClick={handleNextButtonClicked}
          size={'small'}
        >
          <NavigateNextIcon/>
        </IconButton>
      )}
    </Stack>
  );
};

export default MonthPickerSplit;
