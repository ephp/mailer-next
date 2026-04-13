import {styled} from '@mui/material/styles';
import {TableRow} from '@mui/material';

/**
 * A TableRow to get the striped table effect.
 *
 * Borrowed from https://mui.com/material-ui/react-table/#customization
 */
const StripedTableRow = styled(TableRow)(
  ({theme}) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: (theme.vars ?? theme).palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }),
);

export default StripedTableRow;
