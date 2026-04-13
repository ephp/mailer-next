import React from 'react';

export interface VerticalScrollableRefListInput {
  /**
   * The list of ref for the elements to sync.
   * The scrollbar wrapper must be provided as well.
   *
   * **All elements must have the same height for this to work.**
   */
  refs: React.RefObject<HTMLDivElement>[];
}

export interface VerticalScrollableRefListOutput {
  /**
   * onWheel listener for every element.
   */
  handleVerticalScrollableWheel: React.WheelEventHandler<HTMLDivElement>;

  /**
   * onScroll listener for every element.
   */
  handleVerticalScrollableScroll: React.UIEventHandler<HTMLDivElement>;
}

/**
 * Internal interface for the array wrapper.
 */
interface RefWrapper {
  ref: React.RefObject<HTMLDivElement>;

  ignoreNextScroll: boolean;
}

/**
 * Hook for common logic about synchronizing the vertical scroll of two
 * or more div-s, with a single scrollbar shared between all of them.
 */
const useVerticalScrollableRefList = (
  {refs}: VerticalScrollableRefListInput,
): VerticalScrollableRefListOutput => {
  const wrappers: RefWrapper[] = [];
  for (let i = 0; i < refs.length; i++) {
    wrappers.push({
      ref: refs[i],
      ignoreNextScroll: false,
    });
  }

  // Wheel callbacks for scrollable elements to sync.
  const handleVerticalScrollableWheel:
    VerticalScrollableRefListOutput['handleVerticalScrollableWheel'] =
    (event) => {
      // Only considering Y, as these can't scroll horizontally.
      // Not considering units other than pixels, as they
      // can't happen in this situation as far as I'm aware.
      for (let i = 0; i < wrappers.length; i++) {
        if (wrappers[i].ref.current) {
          wrappers[i].ignoreNextScroll = true;
          wrappers[i].ref.current!.scrollTop =
            (wrappers[i].ref.current!.scrollTop ?? 0) + event.deltaY;
        }
      }
    };

  // Scroll callbacks for scrollable elements to sync.
  const handleVerticalScrollableScroll:
    VerticalScrollableRefListOutput['handleVerticalScrollableScroll'] =
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
              wrappers[i].ref.current!.scrollTop = divElement.scrollTop;
            }
          }
        } else {
          wrapper.ignoreNextScroll = false;
        }
      }
    };

  return {
    handleVerticalScrollableWheel,
    handleVerticalScrollableScroll,
  };
};

export default useVerticalScrollableRefList;
