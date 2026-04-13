import React, {
  ChangeEventHandler,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import {TextFieldProps} from '@mui/material';
import TextField from '@mui/material/TextField';

/**
 * Setting the value here as a static type.
 *
 * I previously tried making the component generic (as in: letting the user
 * decide whether NULL was allowed or not), but encountered some issues doing so.
 */
type Value = number | null;

export interface TextNumberFieldProps extends Omit<
  TextFieldProps, 'value' | 'onChange'> {
  /**
   * The current minutes value.
   */
  value: Value;

  /**
   * The value change callback.
   */
  onChange: (
    newValue: Value,
  ) => void;
}

/**
 * A text field that only accepts numeric input, including floating point ones.
 */
function TextNumberField(
  {
    value,
    onChange,
    ...rest
  }: TextNumberFieldProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement | null {
  // The string value being displayed on the input.
  const [
    displayValue,
    setDisplayValue,
  ] = useState<string>(value?.toString() ?? '');

  const handleDisplayTextFieldChange: ChangeEventHandler<HTMLInputElement> =
    (event) => {
      setDisplayValue(event.target.value);
    };

  // Propagating the change to the original value when the input loses focus.
  const handleDisplayTextFieldBlur = (): void => {
    // Getting the raw value and checking its validity.
    const newRawValue = displayValue;

    if (/^[0-9]+(?:[,.]?[0-9]+)?$/.test(newRawValue)) {
      // Valid.
      onChange(parseFloat(newRawValue
        .replace(',', '.')));
    } else {
      // Not valid, setting NULL.
      onChange(null);
    }
  };

  // Changing the display value when the value changes.
  useEffect(() => {
    setDisplayValue(value?.toString() ?? '');
  }, [value]);

  return (
    <TextField
      ref={ref}
      value={displayValue}
      onChange={handleDisplayTextFieldChange}
      onBlur={handleDisplayTextFieldBlur}
      onKeyDown={event => {
        // In Enter is pressed, triggering the blur handler so
        // the form can submit with the actual current value.
        if (event.key === 'Enter') {
          handleDisplayTextFieldBlur();
        }
      }}
      inputMode={'decimal'}
      {...rest}
    />
  );
}

export default React.forwardRef<HTMLDivElement, TextNumberFieldProps>(
  TextNumberField,
);
