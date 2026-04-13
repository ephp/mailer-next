'use client';

import {createTheme} from '@mui/material/styles';
import {Roboto} from 'next/font/google';
import {red} from '@mui/material/colors';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Module augmentation to create a new button variant "link".
declare module '@mui/material/Button' {
  // eslint-disable-next-line
  interface ButtonPropsVariantOverrides {
    link: true;
  }
}

// Create a theme instance.
const theme = createTheme({
  // TODO: enable and handle dark mode if needed.
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#556cd6',
        },
        secondary: {
          main: '#19857b',
        },
        info: {
          main: '#ffffff',
        },
        error: {
          main: red.A400,
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
      },
    },
    dark: false,
  },
  defaultColorScheme: 'light',
  cssVariables: {
    // TODO: change for dark mode.
    disableCssColorScheme: true,
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    // Used in the title/breadcrumbs.
    h2: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    // Used in form subtitles.
    h6: {
      fontSize: '1.1rem',
    },
    // Used for sidebar titles.
    caption: {
      fontSize: '0.8rem',
      fontWeight: '500',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: {severity: 'info'},
              style: (
                {theme},
              ) => ({
                // Makes the alert the primary color with a white text.
                // TODO: this background thing is experimental. Does it actually work?
                backgroundColor: (theme.vars ?? theme).palette.primary.main,
                color: '#ffffff',
                fontWeight: '500',
              }),
            },
          ],
        },
      },
    },
    MuiButton: {
      variants: [
        {
          // A button with no uppercase text.
          props: {variant: 'link'},
          style: ({theme}) => ({
            textTransform: 'none',
            color: (theme.vars ?? theme).palette.primary.main,
          }),
        },
      ],
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: () => ({
          // Makes the input background color white.
          backgroundColor: '#ffffff',
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: () => ({
          // Makes the helper text not uppercase and smaller.
          textTransform: 'none',
        }),
      },
    },
  },
});

export default theme;
