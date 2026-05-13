'use client';

import React, {ReactElement, useEffect} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

/**
 * Curated list of fonts that work reasonably well in HTML emails.
 * The first group is Google Fonts (loaded via @import on focus); the second
 * is system fonts available on most platforms.
 */
const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans 3',
  'Raleway',
  'Nunito',
  'Work Sans',
  'Merriweather',
  'Playfair Display',
  'Lora',
  'PT Serif',
  'Roboto Slab',
  'Roboto Mono',
  'JetBrains Mono',
];

const SYSTEM_FONTS = [
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Tahoma',
];

const ALL_FONTS = [...GOOGLE_FONTS, ...SYSTEM_FONTS];

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  helperText?: string;
}

const GoogleFontAutocomplete = ({value, onChange, label, helperText}: Props): ReactElement => {
  // Lazy-load Google Fonts only when the component mounts so the user sees previews.
  useEffect(() => {
    const id = 'google-fonts-preview';
    if (typeof document === 'undefined' || document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?'
      + GOOGLE_FONTS.map(f => `family=${f.replace(/ /g, '+')}`).join('&')
      + '&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <Autocomplete
      value={value}
      onChange={(_e, v) => onChange(v)}
      options={ALL_FONTS}
      freeSolo
      onInputChange={(_e, v, reason) => {
        if (reason === 'input' || reason === 'clear') onChange(v || null);
      }}
      renderOption={(props, option) => {
        const {key, ...rest} = props as {key: React.Key} & React.HTMLAttributes<HTMLLIElement>;
        return (
          <Box component="li" key={key} {...rest} sx={{fontFamily: `'${option}', sans-serif`, fontSize: 16}}>
            {option}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={helperText}
          slotProps={{
            inputLabel: {shrink: true},
            input: {
              ...params.InputProps,
              style: value ? {fontFamily: `'${value}', sans-serif`} : undefined,
            },
          }}
        />
      )}
    />
  );
};

export default GoogleFontAutocomplete;
