'use client'
import React, {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useTranslations} from 'next-intl';
import {OptionsObject, useSnackbar} from 'notistack';
import {
  DetailResult,
  OiRequestError,
  OiResponse,
} from '@Oimmei-Digital-Boutique/crema-components';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface AsyncCallHelper2ActionsProps {
  performAsyncCall: <T = void>(
    /**
     * The promise to run.
     */
    promise: Promise<T>,
    /**
     * If TRUE, this promise does not trigger the loader to display.
     */
    preventLoaderActions?: boolean,
    /**
     * If given, this message will be displayed as a fallback when no other one is found.
     * Falling back to the project default if this is also empty.
     */
    defaultErrorMessage?: string,
    /**
     * If given, this callback will be used when an error occurs to extract an error
     * message out of the response. If the callback returns NULL, the function will
     * extract an error message as usual; if the callback returns FALSE, no error
     * message will be displayed at all.
     */
    extractErrorMessage?: (error: any) => string | null | false,
  ) => Promise<T>;
}

const asyncCallHelper2ActionsDefault: AsyncCallHelper2ActionsProps = {
  performAsyncCall: async (promise) => {
    return promise;
  },
};

const AsyncCallHelper2ActionsContext =
  createContext<AsyncCallHelper2ActionsProps>(
    asyncCallHelper2ActionsDefault,
  );

export const useAsyncCallHelper2Actions =
  () => useContext(AsyncCallHelper2ActionsContext);

/**
 * Extracts a message from an error response, or returns the default one.
 */
export const extractMessageFromErrorResponse = (
  error: any,
  defaultErrorMessage: string,
): string => {
  // Attempting to get the text message.
  const response =
    (error as OiRequestError<{ message?: string | { message?: string } }>).response;

  if (response !== undefined) {
    if (response.data?.message) {
      if (typeof response.data?.message === 'string') {
        return response.data?.message;
      } else if (response.data?.message?.message) {
        return response.data?.message?.message;
      }
    }
  }

  // Falling back to the default.
  return defaultErrorMessage;
};

/**
 * New version of the AsyncCallHelperProvider.
 *
 * It provides not only a helper to perform async call, but also a built-in spinner
 * loader that doesn't block the whole site and handles concurrent requests.
 */
const AsyncCallHelper2Provider = (
  {children}: {
    children: React.ReactNode
  },
): ReactElement | null => {
  const t = useTranslations('messages');

  const {enqueueSnackbar} = useSnackbar();

  // If this is TRUE, the non-blocking spinner loader will be displayed.
  const [loading, setLoading] = useState<boolean>(false);

  // If this is TRUE, the loader should fade so the user can see what's below it.
  const [pointerOnLoader, setPointerOnLoader] = useState<boolean>(false);

  // A counter to handle the state of the loader.
  const concurrentCallsRef = useRef<number>(0);

  const contextActions = useMemo<AsyncCallHelper2ActionsProps>(
    () => ({
      performAsyncCall: async (
        promise,
        preventLoaderActions,
        defaultErrorMessage,
        extractErrorMessage,
      ) => {
        if (!preventLoaderActions) {
          // Starting the loader.
          concurrentCallsRef.current++;
          setLoading(true);
        }

        try {
          const result = await promise;

          if ((result as OiResponse<DetailResult<any>>)?.data?.message?.message) {
            // There is a message: showing it.
            enqueueSnackbar({
              message: (
                result as OiResponse<DetailResult<any>>
              )?.data?.message?.message as string,
              variant: (
                (result as OiResponse<DetailResult<any>>)?.data?.message?.type ?? 'default'
              ) as OptionsObject['variant'],
            });
          }

          return result;
        } catch (error) {
          if (
            // Prevents throwing the error in case this call fails for a 401.
            // The user will be redirected to the signin page in case that happens.
            !(error as OiRequestError<any>).isAuthError
          ) {
            // If an error callback was performed, calling it.
            let errorMessage: string | null | false = null;
            if (extractErrorMessage) {
              errorMessage = extractErrorMessage(error);
            }

            if (errorMessage !== false) {
              // Displaying the error message.
              enqueueSnackbar({
                message: errorMessage ?? extractMessageFromErrorResponse(
                  error,
                  defaultErrorMessage ?? t("common.error.unknown"),
                ),
                variant: 'error',
              });
            }
          }

          // Re-throwing the error, the specific code will decide what to do with it.
          throw error;
        } finally {
          if (!preventLoaderActions) {
            // Managing the loader state, if needed.
            concurrentCallsRef.current--;
            if (concurrentCallsRef.current === 0) {
              setLoading(false);
            }
          }
        }
      },
    }),
    [
      enqueueSnackbar,
      t,
    ],
  );

  // Listen for mouse move, and fade out the loader if the pointer is over it.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // TODO: optimize in some way? The handler is pretty
      // lightweight already. Throttling? Using different areas?
      const handler = (event: MouseEvent): void => {
        if (
          event.clientY >= window.innerHeight - 88
          && event.clientX >= window.innerWidth - 88
        ) {
          // The pointer is inside the loader area.
          setPointerOnLoader(true);
        } else {
          // The pointer is outside the loader area.
          setPointerOnLoader(false);
        }
      };

      document.addEventListener('mousemove', handler);
      return () => {
        document.removeEventListener('mousemove', handler);
      };
    }
  }, []);

  return (
    <AsyncCallHelper2ActionsContext value={contextActions}>
      {children}

      {/* The loader. */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            borderRadius: '50%',
            background: (theme) => (theme.vars ?? theme).palette.background.paper,
            padding: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow:
              'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em',

            // Not clickable, so pointer events go through it.
            pointerEvents: 'none',
            zIndex: '2000',

            // Opacity, with a basic animation for when it changes.
            opacity: !pointerOnLoader ? 1 : 0.3,
            transition: 'opacity 0.2s',
          }}
        >
          <CircularProgress disableShrink/>
        </Box>
      )}
    </AsyncCallHelper2ActionsContext>
  );
};

export default AsyncCallHelper2Provider;
