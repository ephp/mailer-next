// For cookie Auth
import {FrontUser, getUserFromCookieAuth} from "./helper/AuthHelper";
import {
  useCookieAuth,
  useCookieAuthActions,
} from "../services/auth/cookie-auth/CookieAuthProvider";
import {AuthUser} from '../../types/models/AuthUser';

export interface AuthUserData {
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: FrontUser | null;
  rawUser: AuthUser | null;
}

export const useAuthUser = (): AuthUserData => {
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
  } = useCookieAuth();
  return {
    isLoading,
    isInitialized,
    isAuthenticated,
    user: getUserFromCookieAuth(user),
    rawUser: user,
  };
};

export const useAuthMethod = (): ReturnType<typeof useCookieAuthActions> => {
  const actions = useCookieAuthActions();

  return {
    ...actions,
  };
};
