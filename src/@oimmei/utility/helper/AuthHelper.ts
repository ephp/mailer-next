import {authRole, RoutePermittedRole} from "../../../shared/constants/AppConst";
import {AuthUser} from "../../../types/models/AuthUser";

/**
 * User interface for the front end user structure.
 *
 * This has no link to any API user, it's
 * just a helper structure for the front end.
 */
export interface FrontUser {
  id: number | string;
  uid: number | string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: RoutePermittedRole[] | null;
  mainRole: RoutePermittedRole | null;
}

const getUserFromAuthUser = (user: AuthUser | null): FrontUser | null => {
  if (user) {
    // Picking the front end roles from the dashboard.
    let role: RoutePermittedRole[] | null = null;
    let mainRole: RoutePermittedRole | null = null;

    if (user.roles.length > 0) {
      for (let i = 0; i < user.roles.length; i++) {
        if (user.oimmei || user.admin) {
          role = authRole.admin;
          mainRole = RoutePermittedRole.Admin;
        } else {
          role = authRole.user;
          mainRole = RoutePermittedRole.User;
        }
      }
    } else {
      role = authRole.user;
      mainRole = RoutePermittedRole.User;
    }

    return {
      id: user.id,
      uid: user.id,
      displayName: user.email,
      email: user.email,
      photoURL: undefined,
      role: role,
      mainRole: mainRole,
    };
  }
  return null;
};

export const getUserFromCookieAuth = (user: AuthUser | null) => {
  return getUserFromAuthUser(user);
};
