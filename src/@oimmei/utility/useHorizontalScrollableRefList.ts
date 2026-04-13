import React from 'react';

export interface HorizontalScrollableRefListInput {
  /**
   * The list of ref for the elements to sync.
   * The scrollbar wrapper must be provided as well.
   *
   * **All elements must have the same width for this to work.**
   */
  refs: React.RefObject<HTMLDivElement>[];
}

export interface HorizontalScrollableRefListOutput {
  /**
   * onWheel listener for every element.
   */
  handleHorizontalScrollableWheel: React.WheelEventHandler<HTMLDivElement>;

  /**
   * onScroll listener for every element.
   */
  handleHorizontalScrollableScroll: React.UIEventHandler<HTMLDivElement>;
}

/**
 * Internal interface for the array wrapper.
 */
interface RefWrapper {
  ref: React.RefObject<HTMLDivElement>;

  ignoreNextScroll: boolean;
}

/**
 * Hook for common logic about synchronizing the horizontal scroll of two
 * or more div-s, with a single scrollbar shared between all of them.
 */
const useHorizontalScrollableRefList = (
  {refs}: HorizontalScrollableRefListInput,
): HorizontalScrollableRefListOutput => {
  const wrappers: RefWrapper[] = [];
  for (let i = 0; i < refs.length; i++) {
    wrappers.push({
      ref: refs[i],
      ignoreNextScroll: false,
    });
  }

  // Wheel callbacks for scrollable elements to sync.
  const handleHorizontalScrollableWheel:
    HorizontalScrollableRefListOutput['handleHorizontalScrollableWheel'] =
    (event) => {
      // Only considering X, as these can't scroll vertically.
      // Not considering units other than pixels, as they
      // can't happen in this situation as far as I'm aware.
      for (let i = 0; i < wrappers.length; i++) {
        if (wrappers[i].ref.current) {
          wrappers[i].ignoreNextScroll = true;
          wrappers[i].ref.current!.scrollLeft =
            (wrappers[i].ref.current!.scrollLeft ?? 0) + event.deltaX;
        }
      }
    };

  // Scroll callbacks for scrollable elements to sync.
  const handleHorizontalScrollableScroll:
    HorizontalScrollableRefListOutput['handleHorizontalScrollableScroll'] =
    (event) => {
      const divElement = event.target as HTMLDivElement;
      const wrapper = wrappers
        .find(wrapper => wrapper.ref.current === divElement);
      if (wrapper !== undefined) {
        if (!wrapper.ignoreNextScroll) {
          for (let i = 0; i < wrappers.length; i++) {
            if (
              wrappers[i].ref.current
              && wrappers[i].ref.current !== divElement
            ) {
              wrappers[i].ignoreNextScroll = true;
              wrappers[i].ref.current!.scrollLeft = divElement.scrollLeft;
            }
          }
        } else {
          wrapper.ignoreNextScroll = false;
        }
      }
    };

  return {
    handleHorizontalScrollableWheel,
    handleHorizontalScrollableScroll,
  };
};

export default useHorizontalScrollableRefList;
