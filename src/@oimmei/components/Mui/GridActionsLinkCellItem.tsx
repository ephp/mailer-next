import React from 'react';
import {GridActionsCellItem} from '@mui/x-data-grid';
import {Url} from 'next/dist/shared/lib/router/router';

/**
 * NOTE: this is a hack created to define GridActionsCellItem
 * that are actually link components. It's necessary because of
 * a bug in MUI, that will fail to recalculate the type for the
 * props of this specific component when using a Next.js link.
 *
 * I'd normally be able to work around this using TypeScript
 * module augmentation, but that's apparently not possible
 * on MUI components by design, so I have to use a hack.
 *
 * @link https://github.com/mui/mui-x/issues/9913
 * @link https://github.com/mui/material-ui/issues/31094
 */
const GridActionsLinkCellItem =
  GridActionsCellItem as unknown as React.FC<React.ComponentProps<typeof GridActionsCellItem> & {
    href: Url
  }>;

export default GridActionsLinkCellItem;
