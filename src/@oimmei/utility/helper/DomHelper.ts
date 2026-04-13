/**
 * Returns the width of the browser (and OS) scrollbar in pixels.
 * In server environment, returns zero.
 *
 * This creates a new DOM element and removes it every time.
 * Please, **PLEASE**, call it in a useMemo or something.
 *
 * Borrowed from {@link https://stackoverflow.com/a/13382873/10197327}
 * and slightly reworked.
 */
export const getScrollbarWidth = (): number => {
  if (typeof document === 'undefined') {
    // Server environment.
    // Returning an arbitrary base value.
    return 16;
  } else {
    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    (outer.style as unknown as { msOverflowStyle: string })
      .msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

    // Removing temporary elements from the DOM
    outer.parentNode?.removeChild(outer);

    return scrollbarWidth;
  }
};
