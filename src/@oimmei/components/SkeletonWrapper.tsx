import React, {ReactElement} from 'react';
import Skeleton, {SkeletonProps} from '@mui/material/Skeleton';

export interface SkeletonWrapperProps extends SkeletonProps {
  /**
   * Children to wrap.
   *
   * Using this type because it defines children in a more strict term.
   */
  children: ReactElement;

  /**
   * TRUE if a loading is occurring, meaning the skeleton should be animated.
   */
  loading: boolean;

  /**
   * TRUE if the component should be wrapped in the skeleton.
   */
  wrapping: boolean;
}

/**
 * Conditionally wraps its children into a skeleton so
 * the size can be inferred and they can be wrapped
 * without having to redefine them or use a variable.
 */
const SkeletonWrapper = (
  {children, loading, wrapping, ...rest}: SkeletonWrapperProps,
): ReactElement | null => {
  return !wrapping ? (
    children
  ) : (
    <Skeleton animation={loading ? 'pulse' : false} {...rest}>
      {children}
    </Skeleton>
  )
}

export default SkeletonWrapper;
