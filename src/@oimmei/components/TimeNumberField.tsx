import React, {ChangeEventHandler, ReactElement, useEffect, useState} from 'react';
import {TextFieldProps} from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {getHourOfDayFromMinutes, getTimeStringFromMinutes} from '../utility/helper/TimeHelper';

export interface TimeNumberFieldProps extends Omit<
  TextFieldProps, 'value' | 'onChange'> {
  /**
   * The current minutes value.
   */
  value: number | null;

  /**
   * The value change callback.
   */
  onChange: (newMinutes: number | null) => void;

  /**
   * Whether the hours should be limited at 24 or not
   * (meaning if a value of 1470 is 0:30 or 24:30),
   * default TRUE.
   *
   * This does **not** mean the minutes value can't
   * go beyond 1440 (24 * 60), only that the display
   * value will be corrected to be an actual
   * hour of the day.
   */
  isHourOfDay?: boolean;
}

/**
 * A text field displaying a time, managing the value as the
 * number of minutes since midnight (e.g. 510 for 8:10 AM).
 */
const TimeNumberField = (
  {
    value,
    onChange,
    isHourOfDay = true,
    ...rest
  }: TimeNumberFieldProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement | null => {
  // The string value being displayed on the input.
  const [
    displayValue,
    setDisplayValue,
  ] = useState<string>('');

  const handleDisplayTextFieldChange: ChangeEventHandler<HTMLInputElement> =
    (event) => {
      setDisplayValue(event.target.value);
    };

  // Propagating the change to the original value when the input loses focus.
  const handleDisplayTextFieldBlur = (): void => {
    // Getting the raw value and normalizing it to a minutes count.
    const newRawValue = displayValue;

    // If any not allowed value is in the string, refusing it.
    if (/^[0-9:]+$/.test(newRawValue)) {
      // Splitting the string on the : characters, if any.
      const newRawValueParts = newRawValue.split(':');

      // Taking the first two non-empty parts at most.
      let firstPart: string | null = null;
      let secondPart: string | null = null;
      while (newRawValueParts.length > 0) {
        const p = newRawValueParts.shift()!;

        if (p !== '') {
          if (firstPart === null) {
            // This is the first part.
            firstPart = p;
          } else {
            // This is the second part.
            secondPart = p;
            break;
          }
        }
      }

      if (isHourOfDay) {
        // Hour of day mode.
        if (firstPart !== null) {
          if (secondPart === null) {
            // No second part is defined; using only the first.
            // Getting the first four characters at
            // most and turning them into a time.
            const potentialHour1 = parseInt(firstPart.slice(0, 2));
            const potentialHour2 = parseInt(firstPart.slice(0, 1));

            if (!isNaN(potentialHour1) && potentialHour1 < 24) {
              const potentialMinutes = parseInt(firstPart.slice(2, 4));

              const minutes = potentialHour1 * 60
                + (!isNaN(potentialMinutes) && potentialMinutes < 60 ?
                  potentialMinutes : 0);

              onChange(minutes);
            } else if (!isNaN(potentialHour2) && potentialHour2 < 24) {
              const potentialMinutes = parseInt(firstPart.slice(1, 3));

              const minutes = potentialHour2 * 60
                + (!isNaN(potentialMinutes) && potentialMinutes < 60 ?
                  potentialMinutes : 0);

              onChange(minutes);
            } else {
              // No valid value, refused.
              onChange(null);
            }
          } else {
            // A second part is defined. Using the first for
            // hours and the second for minutes in that hour.
            const potentialHour = parseInt(firstPart.slice(0, 2));
            const potentialMinutes = parseInt(secondPart.slice(0, 2));

            if (!isNaN(potentialHour) && potentialHour < 24) {
              const minutes = potentialHour * 60
                + (!isNaN(potentialMinutes) && potentialMinutes < 60 ?
                  potentialMinutes : 0);

              onChange(minutes);
            } else {
              // No valid value, refused.
              onChange(null);
            }
          }
        } else {
          // No parts defined, refused.
          onChange(null);
        }
      } else {
        // Free amount of hours mode.
        if (firstPart !== null) {
          if (secondPart === null) {
            // Only the first part defined.
            // Using it as the amount of hours.
            const potentialHours = parseInt(firstPart);

            if (!isNaN(potentialHours)) {
              const minutes = potentialHours * 60;

              onChange(minutes);
            } else {
              // No valid value, refused.
              onChange(null);
            }
          } else {
            // A second part is defined. Using the first
            // one as hours and the second one as minutes.
            const potentialHours = parseInt(firstPart);
            const potentialMinutes = parseInt(secondPart);

            if (!isNaN(potentialHours)) {
              const minutes = potentialHours * 60
                + (!isNaN(potentialMinutes) ? potentialMinutes : 0);

              onChange(minutes);
            } else {
              // No valid value, refused.
              onChange(null);
            }
          }
        } else {
          // No parts defined, refused.
          onChange(null);
        }
      }
    } else {
      // Refused.
      onChange(null);
    }
  };

  // Changing the display value when the value changes.
  useEffect(() => {
    setDisplayValue(
      isHourOfDay ?
        getHourOfDayFromMinutes(value) :
        getTimeStringFromMinutes(value),
    );
  }, [value, isHourOfDay]);

  return (
    <TextField
      ref={ref}
      value={displayValue}
      onChange={handleDisplayTextFieldChange}
      onBlur={handleDisplayTextFieldBlur}
      placeholder={'hh:mm'}
      onKeyDown={event => {
        // In Enter is pressed, triggering the blur handler so
        // the form can submit with the actual current value.
        if (event.key === 'Enter') {
          handleDisplayTextFieldBlur();
        }
      }}
      {...rest}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position={'start'}>
              <AccessTimeIcon/>
            </InputAdornment>
          ),
          ...(rest.slotProps?.input ?? {}),
        },
      }}
    />
  );
};

export default React.forwardRef(TimeNumberField);
