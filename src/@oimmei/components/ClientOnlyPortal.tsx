import React, {useRef, useEffect, useState} from "react";
import {createPortal} from "react-dom";

/**
 * A client-only portal for use with Next.js, to prevent messing with SSR.
 *
 * Borrowed from the official example:
 * https://github.com/vercel/next.js/tree/canary/examples/with-portals
 */
export default function ClientOnlyPortal(
  {
    children,
    selector,
  }: {
    children: React.ReactNode

    selector: string
  },
): React.ReactPortal | null {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector(selector);
    setMounted(true);
  }, [selector]);

  return mounted && ref.current !== null ? createPortal(children, ref.current) : null;
}
