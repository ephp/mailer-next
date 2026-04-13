import React, {ReactElement} from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const AppSearchBar2 = (
  props: React.ComponentProps<typeof TextField>,
): ReactElement | null => {
  return (
    <TextField
      size={'small'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon/>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
};

export default AppSearchBar2;
