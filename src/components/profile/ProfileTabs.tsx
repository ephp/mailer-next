'use client';

import React, {ReactElement} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Link from 'next/link';

interface TabItem {
  id: number;
  icon: ReactElement;
  name: string;
  href: string;
}

interface Props {
  value: number;
  tabs: TabItem[];
  ariaLabel: string;
}

const ProfileTabs = ({value, tabs, ariaLabel}: Props): ReactElement => (
  <Tabs
    className="account-tabs"
    value={value}
    variant="scrollable"
    scrollButtons="auto"
    aria-label={ariaLabel}
  >
    {tabs.map((tab, index) => (
      <Tab
        key={tab.id}
        label={tab.name}
        className="account-tab"
        component={Link}
        href={tab.href}
        id={`simple-tab-${index}`}
        aria-controls={`simple-tabpanel-${index}`}
      />
    ))}
  </Tabs>
);

export default ProfileTabs;
