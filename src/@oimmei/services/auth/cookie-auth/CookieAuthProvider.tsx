'use client';

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import oiFetchInstance from './index';
import {AuthUser} from '@/types/models/AuthUser';
import {useTranslations} from 'next-intl';
import {SIGNIN} from '@/shared/constants/AppRoutes';
import {useRouter} from 'next/navigation';
import {initialUrl} from '@/shared/constants/AppConst';
import {
  AUTH_EXPIRED_EVENT,
  OiRequestError,
} from '@Oimmei-Digital-Boutique/crema-components';
import {useAsyncCallHelper2Actions} from '../../context/AsyncCallHelper2Provider';
import {useSnackbar} from 'notistack';

interface CookieAuthContextProps {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /**
   * OIMMEI Added to correctly handle SSR. If this is FALSE,
   * the auth is not initialized yet, meaning all unauthenticated
   * pages can be displayed and no authenticated page can.
   */
  isInitialized: boolean;
}

interface SignInProps {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface ForgotPasswordProps {
  email: string;
}

interface FirstLoginProps {
  firstLoginToken: string;
  password: string;
  passwordConfirmation: string;
}

interface ResetPasswordProps {
  passwordToken: string;
  password: string;
  passwordConfirmation: string;
}

interface ChangePasswordProps {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

interface CookieAuthActionsProps {
  signInUser: (data: SignInProps) => Promise<void>;
  forgotPassword: (data: ForgotPasswordProps) => Promise<void>;
  firstLogin: (data: FirstLoginProps) => Promise<void>;
  resetPassword: (data: ResetPasswordProps) => Promise<void>;
  signUpUser: (user: AuthUser) => Promise<void>;
  updateProfile: (user: AuthUser) => Promise<void>;
  changePassword: (data: ChangePasswordProps) => Promise<void>;
  deleteProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const CookieAuthContext =
  createContext<CookieAuthContextProps>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
  });
const CookieAuthActionsContext =
  createContext<CookieAuthActionsProps>({
    signInUser: async () => {
    },
    forgotPassword: async () => {
    },
    firstLogin: async () => {
    },
    resetPassword: async () => {
    },
    signUpUser: async () => {
    },
    updateProfile: async () => {
    },
    changePassword: async () => {
    },
    deleteProfile: async () => {
    },
    logout: async () => {
    },
  });

export const useCookieAuth = () => useContext(CookieAuthContext);

export const useCookieAuthActions = () => useContext(CookieAuthActionsContext);

interface CookieAuthProviderProps {
  children: ReactNode;
}

const CookieAuthProvider: React.FC<CookieAuthProviderProps> = (
  {
    children,
  },
) => {
  const [
    cookieAuthData,
    setCookieAuthData,
  ] = useState<CookieAuthContextProps>(
    {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
    });

  const {enqueueSnackbar} = useSnackbar();

  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const router = useRouter();

  const t = useTranslations('security');

  useEffect(() => {
    const getAuthUser = () => {
      // Attempting the profile call to check if the user is logged in.
      oiFetchInstance
        .get<AuthUser>('/user')
        .then(({data}) => {
          // The user is logged in.
          setCookieAuthData(d => ({
            ...d,
            user: data,
            isLoading: false,
            isAuthenticated: true,
          }));
        })
        .catch(() => {
          setCookieAuthData(d => ({
            ...d,
            user: null,
            isLoading: false,
            isAuthenticated: false,
          }));
        });
    };

    setCookieAuthData(d => ({
      ...d,
      isLoading: true,
      isInitialized: true,
    }));

    getAuthUser();
  }, []);

  useEffect(() => {
    // When the session expires, clearing the data.
    const onAuthExpired = () => {
      setCookieAuthData(d => ({
        ...d,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }));
    };

    document.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);

    return () => {
      document.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    };
  }, []);

  const signInUser: CookieAuthActionsProps['signInUser'] = async (
    {
      username,
      password,
      rememberMe,
    },
  ) => {
    try {
      const performLogin = async (): Promise<AuthUser> => {
        await oiFetchInstance.post(
          '/auth/login',
          {username, password, remember_me: rememberMe},
        );

        const {data} = await oiFetchInstance.get<AuthUser>('/user');

        return data;
      };

      // Performing the call, with a custom fallback error message.
      const data = await performAsyncCall(
        performLogin(),
        false,
        t('login_form.error.unknown'),
      );

      setCookieAuthData(d => ({
        ...d,
        user: data,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      setCookieAuthData({
        ...cookieAuthData,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const forgotPassword: CookieAuthActionsProps['forgotPassword'] = async (
    {
      email,
    },
  ) => {
    try {
      await performAsyncCall(
        oiFetchInstance.post('/auth/forgot-password', {username: email}),
        false,
        t('forgot_password_form.error.unknown'),
        (error) => {
          if ((error as OiRequestError).response?.status === 404) {
            // Overriding the error message for this case.
            return t('forgot_password_form.error.not_found');
          } else {
            // Letting the async helper extract a message.
            return null;
          }
        },
      );

      enqueueSnackbar({
        message: t('forgot_password_form.success.email_sent'),
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const firstLogin: CookieAuthActionsProps['firstLogin'] = async (
    {
      firstLoginToken,
      password,
      passwordConfirmation,
    },
  ) => {
    try {
      const {data} = await performAsyncCall(
        oiFetchInstance
          .post<{
            message?: string
          }>(
            '/auth/first-login/' + firstLoginToken,
            {
              password: password,
              password_confirmation: passwordConfirmation,
            },
          ),
        false,
        t('common_password_form.error.unknown'),
      );

      enqueueSnackbar({
        message: data.message ?? t('first_login_form.success.password_reset'),
        variant: 'success',
      });

      // Redirecting the user.
      setTimeout(() => {
        router.push(SIGNIN);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const resetPassword: CookieAuthActionsProps['resetPassword'] = async (
    {
      passwordToken,
      password,
      passwordConfirmation,
    },
  ) => {
    try {
      const {data} = await performAsyncCall(
        oiFetchInstance
          .post<{
            message?: string
          }>(
            '/auth/new-password/' + passwordToken,
            {
              password: password,
              password_confirmation: passwordConfirmation,
            },
          ),
      );

      enqueueSnackbar({
        message: data.message ?? t('reset_password_form.success.password_reset'),
        variant: 'success',
      });

      // Redirecting the user.
      setTimeout(() => {
        router.push(SIGNIN);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const signUpUser: CookieAuthActionsProps['signUpUser'] = async (
    user,
  ) => {
    try {
      const requestData: Partial<typeof user> = {...user};

      delete requestData.id;

      // TODO add project/user-specific code here.

      const {data} = await performAsyncCall(
        oiFetchInstance
          .post<AuthUser>('/auth/register', {
            ...requestData,
          }),
        false,
        undefined,
        (error) => {
          if (
            (error as OiRequestError).response?.headers &&
            'error-message' in (error as OiRequestError).response?.headers!
          ) {
            switch ((error as OiRequestError).response?.headers['error-message']) {
              case 'UniqueConstraintViolation':
                return t('profile.profile_form.error.email_already_used');
              default:
                return null;
            }
          } else {
            return null;
          }
        },
      );

      setCookieAuthData(d => ({
        ...d,
        user: data,
        isAuthenticated: true,
        isLoading: false,
      }));

      // Redirecting the user.
      router.push(initialUrl);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProfile = async (
    user: AuthUser,
  ) => {
    try {
      const requestData: Partial<typeof user> = {...user};

      delete requestData.id;

      // TODO add project/user-specific code here.

      const {data, headers} =
        await performAsyncCall(
          oiFetchInstance.post<AuthUser>('/user/edit', {
            ...requestData,
          }),
          false,
          undefined,
          (error) => {
            if (
              (error as OiRequestError).response?.headers &&
              'error-message' in (error as OiRequestError).response?.headers!
            ) {
              switch ((error as OiRequestError).response?.headers['error-message']) {
                case 'UniqueConstraintViolation':
                  return t('profile.profile_form.error.email_already_used');
                default:
                  return null;
              }
            } else {
              return null;
            }
          },
        );

      enqueueSnackbar({
        message: t('profile.profile_form.success.profile_updated'),
        variant: 'success',
      });

      setCookieAuthData(d => ({
        ...d,
        user: headers['auth-status'] !== 'LoggedOut' ? data : null,
        isAuthenticated: headers['auth-status'] !== 'LoggedOut',
        isLoading: false,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const changePassword: CookieAuthActionsProps['changePassword'] = async (
    {
      oldPassword,
      newPassword,
    },
  ) => {
    try {
      const {data} = await performAsyncCall(
        oiFetchInstance
          .post<AuthUser>('/user/change-password', {
            old_password: oldPassword,
            new_password: newPassword,
          }),
        false,
        undefined,
        (error) => {
          if (
            (error as OiRequestError).response?.headers &&
            'error-message' in (error as OiRequestError).response?.headers!
          ) {
            switch ((error as OiRequestError).response?.headers['error-message']) {
              case 'WrongPassword':
                return t('profile.change_password_form.error.old_password_invalid');
              default:
                return null;
            }
          } else {
            return null;
          }
        },
      );

      enqueueSnackbar({
        message: t('profile.change_password_form.success.password_changed'),
        variant: 'success',
      });

      setCookieAuthData(d => ({
        ...d,
        user: data,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProfile: CookieAuthActionsProps['deleteProfile'] = async () => {
    try {
      await performAsyncCall(
        oiFetchInstance.post('/user/immediately-delete'),
        false,
        undefined,
        (error) => {
          if (
            (error as OiRequestError).response?.headers &&
            'error-message' in (error as OiRequestError).response?.headers!
          ) {
            switch ((error as OiRequestError).response?.headers['error-message']) {
              case 'CannotDeleteUser':
                return t('profile.delete_profile.error.cannot_delete_user');
              default:
                return null;
            }
          } else {
            return null;
          }
        },
      );

      setCookieAuthData(d => ({
        ...d,
        user: null,
        isAuthenticated: false,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const logout: CookieAuthActionsProps['logout'] = async () => {
    try {
      await performAsyncCall(
        oiFetchInstance.post('/auth/logout'),
        false,
        undefined,

        // The logout errors are irrelevant for the user; never displaying them.
        () => false,
      );
    } catch (error) {
      // Catching this in order to avoid Next.js errors.
      console.error(error);
    } finally {
      // Logging out the user either way.
      setCookieAuthData(d => ({
        ...d,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  };

  return (
    <CookieAuthContext
      value={{
        ...cookieAuthData,
      }}
    >
      <CookieAuthActionsContext
        value={{
          signInUser,
          forgotPassword,
          firstLogin,
          resetPassword,
          signUpUser,
          updateProfile,
          changePassword,
          deleteProfile,
          logout,
        }}
      >
        {children}
      </CookieAuthActionsContext>
    </CookieAuthContext>
  );
};
export default CookieAuthProvider;
