import {styled} from '@mui/material/styles';
import MuiPopper from '@mui/material/Popper';

/**
 * A popper with an arrow. Borrowed from here and slightly changed for the arrow border.
 *
 * {@link https://github.com/mui/material-ui/blob/v5.15.20/docs
 * /data/material/components/popper/ScrollPlayground.js#L125}
 */
const Popper = styled(MuiPopper, {
  shouldForwardProp: (prop) => prop !== 'arrow',
})<{
  arrow?: boolean
}>(({theme, arrow}) => ({
  zIndex: 1,
  '& > div': {
    position: 'relative',
  },
  '&[data-popper-placement*="bottom"]': {
    '& > div': {
      marginTop: arrow ? 2 : 0,
    },
    '& .MuiPopper-arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before, &::after': {
        borderWidth: '0 1em 1em 1em',
      },
      '&::before': {
        borderColor: `transparent transparent ${(theme.vars ?? theme).palette.divider} transparent`,
      },
      '&::after': {
        borderColor: `transparent transparent ${(theme.vars ?? theme).palette.background.paper} transparent`,

        // Negative margin so it goes above the before.
        marginTop: '-0.8em',
      },
    },
  },
  '&[data-popper-placement*="top"]': {
    '& > div': {
      marginBottom: arrow ? 2 : 0,
    },
    '& .MuiPopper-arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-1em',
      width: '3em',
      height: '1em',
      '&::before, &::after': {
        borderWidth: '1em 1em 0 1em',
      },
      '&::before': {
        borderColor: `${(theme.vars ?? theme).palette.divider} transparent transparent transparent`,
      },
      '&::after': {
        borderColor: `${(theme.vars ?? theme).palette.background.paper} transparent transparent transparent`,

        // Negative margin so it goes above the before.
        marginTop: '-1.2em',
      },
    },
  },
  '&[data-popper-placement*="right"]': {
    '& > div': {
      marginLeft: arrow ? 2 : 0,
    },
    '& .MuiPopper-arrow': {
      left: 0,
      marginLeft: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before, &::after': {
        borderWidth: '1em 1em 1em 0',
      },
      '&::before': {
        borderColor: `transparent ${(theme.vars ?? theme).palette.divider} transparent transparent`,
      },
      '&::after': {
        borderColor: `transparent ${(theme.vars ?? theme).palette.background.paper} transparent transparent`,

        // Negative margin so it goes above the before.
        // TODO: to be tested
        marginTop: '-3em',
      },
    },
  },
  '&[data-popper-placement*="left"]': {
    '& > div': {
      marginRight: arrow ? 2 : 0,
    },
    '& .MuiPopper-arrow': {
      right: 0,
      marginRight: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before, &::after': {
        borderWidth: '1em 0 1em 1em',
      },
      '&::before': {
        borderColor: `transparent transparent transparent ${(theme.vars ?? theme).palette.divider}`,
      },
      '&::after': {
        borderColor: `transparent transparent transparent ${(theme.vars ?? theme).palette.background.paper}`,

        // Negative margin so it goes above the before.
        // TODO: to be tested
        marginTop: '-3em',
      },
    },
  },
}));

export const Arrow = styled('div')({
  position: 'absolute',
  fontSize: 7,
  width: '3em',
  height: '3em',
  '&::before, &::after': {
    content: '""',
    margin: 'auto',
    display: 'block',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
});

export default Popper;
