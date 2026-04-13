import React, {ReactElement, useState} from 'react';
import {TextFieldProps} from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * A text field for a password, with an adornment to display it to the user.
 * Inspired by https://mui.com/material-ui/react-text-field/#input-adornments
 */
const TextPasswordField = (
  {...rest}: TextFieldProps,
): ReactElement | null => {
  const [showPassword, setShowPassword] =
    useState<boolean>(false);

  const handleClickShowPassword = (): void => {
    setShowPassword((show) => !show);
  };

  /**
   * Not sure about this one. It was in the example.
   */
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();
  };

  return (
    <TextField
      {...rest}
      type={showPassword ? 'text' : 'password'}
      slotProps={{
        ...(rest.slotProps ?? {}),
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff/> : <Visibility/>}
              </IconButton>
            </InputAdornment>
          ),
          ...(rest.slotProps?.input ?? {}),
        },
      }}
    />
  );
};

export default TextPasswordField;
