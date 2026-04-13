import React, {ReactElement} from 'react';

/**
 * A completely blank layout, with no header and no menu.
 *
 * Created to display a QRCode for Ciclostazione.
 */
const BlankLayout = (
  {children}: {
    children: React.ReactNode
  },
): ReactElement | null => {
  return (
    <>
      {children}
    </>
  );
};

export default BlankLayout;
