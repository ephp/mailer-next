import React, {useMemo, useState} from 'react';
import {useAsyncCallHelper2Actions} from '../services/context/AsyncCallHelper2Provider';

export interface AsyncLoaderResultWrapper<Fn extends (...args: any[]) => Promise<any>> {
  /**
   * Performs the call to fetch the result.
   */
  perform: Fn;

  /**
   * TRUE if it's loading (the call is flying).
   */
  loading: boolean;

  /**
   * The fetched result; NULL if it wasn't fetched.
   *
   * NOTE: this makes it impossible to distinguish cases when the result
   * is **actually** null; that's pretty rare for async calls though.
   */
  result: Awaited<ReturnType<Fn>> | null;

  /**
   * The setter for the result.
   *
   * Useful in specific use cases when you need to "force" the result from outside.
   */
  setResult: React.Dispatch<React.SetStateAction<Awaited<ReturnType<Fn>> | null>>;
}

/**
 * A helper loader to provide a loading state for asynchronous calls.
 *
 * Relies on the {@link AsyncCallHelper2Provider} for the spinner and the message displaying.
 */
function useAsyncLoader<Fn extends (...args: any[]) => Promise<any>>(
  fn: Fn,
  preventLoaderActions = false,
): AsyncLoaderResultWrapper<Fn> {
  const {performAsyncCall} = useAsyncCallHelper2Actions();

  // The result of the provided call, if any.
  const [result, setResult] = useState<AsyncLoaderResultWrapper<Fn>['result']>(null);

  // The loading state of the result.
  const [loading, setLoading] = useState<boolean>(false);

  // Wrapper function for the provided call; handles the loading state.
  const perform = useMemo<Fn>(
    () => {
      return (async (...args) => {
        setLoading(true);
        try {
          const res = await performAsyncCall(fn(...args), preventLoaderActions);

          setResult(res);

          return res;
        } finally {
          setLoading(false);
        }
      }) as Fn;
    },
    [fn, performAsyncCall, preventLoaderActions],
  );

  return {
    perform,
    loading,
    result,
    setResult,
  };
}

export default useAsyncLoader;
