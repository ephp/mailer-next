import React, {ReactElement} from 'react';
import {a11yTabPanelProps} from '../utility/helper/TabHelper';

/**
 * Base tab panel, with all the related props for accessibility.
 */
function TabPanel<TabValue extends string | number = string>(
  {prefix, index, currentTab, children, ...rest}: {
    prefix: string

    index: TabValue

    currentTab: TabValue

    children?: React.ReactNode
  } & React.ComponentProps<'div'>,
): ReactElement | null {
  return (
    <div
      role={'tabpanel'}
      hidden={index !== currentTab}
      {...a11yTabPanelProps<TabValue>(prefix, index)}
      {...rest}
    >
      {index === currentTab && children}
    </div>
  );
}

export default TabPanel;
