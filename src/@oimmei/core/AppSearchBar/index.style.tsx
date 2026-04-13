import {inputBaseClasses, lighten} from '@mui/material';
import {styled, Theme} from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import {Fonts} from '../../../shared/constants/AppEnums';

interface SearchWrapperProps {
  theme?: Theme;
  position: string;

  [x: string]: any;
}

export const SearchWrapper = styled('div')(
  ({position}: SearchWrapperProps) => ({
    borderRadius: 4,
    display: 'block',
    cursor: 'pointer',
    '& .searchRoot .MuiInputBase-input': {
      // OIMMEI: changed from 20 to 80 because the old template mysteriously had 80.
      // OIMMEI: changed to 20 again because the search was pretty much hidden otherwise.
      paddingLeft: position === 'right' ? 20 : 'calc(1em + 28px)',
      paddingRight: position === 'right' ? 'calc(1em + 28px)' : 20,
    },
  }),
);

export const SearchInputBase = styled(InputBase)((
  {theme},
) => ({
  fontWeight: Fonts.MEDIUM,

  [`& .${inputBaseClasses.root}`]: {
    color: 'inherit',
    width: '100%',
  },
  [`& .${inputBaseClasses.input}`]: {
    border: '0 none',
    // Changed from background.default to background.paper.
    backgroundColor: lighten((theme.vars ?? theme).palette.background.paper, 0.25),
    color: (theme.vars ?? theme).palette.text.primary,
    borderRadius: 30,
    padding: theme.spacing(2, 2, 2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(6)})`,
    transition: theme.transitions.create('width'),
    width: 200,
    height: 40,
    boxSizing: 'border-box',
    [theme.breakpoints.down('md')]: {
      width: 110,
    },
    '&:focus': {
      // Changed from background.default to background.paper.
      backgroundColor: lighten((theme.vars ?? theme).palette.background.paper, 0.25),
      width: 240,
      [theme.breakpoints.down('md')]: {
        width: 162,
      },
    },
    '&:hover': {
      // Changed from background.default to background.paper.
      backgroundColor: lighten((theme.vars ?? theme).palette.background.paper, 0.2),
    },
  },
}));

interface SearchIconBoxProps {
  theme?: Theme;
  align?: string;

  [x: string]: any;
}

export const SearchIconBox = styled('div')(
  ({align}: SearchIconBoxProps) => ({
    position: 'relative',
    marginLeft: align === 'right' ? 'auto' : 0,
    '& .searchIconBox': {
      position: 'relative',
      '& $inputInput': {
        width: 220,
        borderRadius: 50,
        paddingLeft: 27,
        '&:focus': {
          width: 235,
          borderRadius: 50,
          paddingLeft: `calc(1em + ${4})`,
        },
      },
    },
    '&.hs-disableFocus': {
      '& .MuiInputBase-root': {
        width: '100%',
      },
      '& .MuiInputBase-input': {
        width: '100%',
        '&:focus': {
          width: '100%',
        },
      },
    },
  }),
);
export const SearchIconWrapper = styled('div')((
  {theme},
) => ({
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 12,
  zIndex: 1,
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&.right': {
    left: 'auto',
    right: 12,
    '& + $inputRoot $inputInput': {
      paddingLeft: theme.spacing(5),
      paddingRight: `calc(1em + ${theme.spacing(7)})`,
    },
  },
}));
