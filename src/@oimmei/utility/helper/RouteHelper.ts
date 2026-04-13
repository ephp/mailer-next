import {authRole, RoutePermittedRole} from '../../../shared/constants/AppConst';

/**
 * Returns TRUE if the user should be able to see the route.
 *
 * @param routeRole
 * @param userRole
 */
export const checkPermission = (
  routeRole?: RoutePermittedRole | RoutePermittedRole[],
  userRole?: RoutePermittedRole | RoutePermittedRole[],
): boolean => {
  if (!routeRole) {
    // No role for the route, always allowed.
    return true;
  }

  if (!userRole) {
    // The route has role restriction, but
    // the user has no role. Forbidden.
    return false;
  }

  // Considering every combination for role configuration.
  return (
    !Array.isArray(routeRole)
    && !Array.isArray(userRole)
    && authRole[userRole].indexOf(routeRole) !== -1
  ) || (
    Array.isArray(routeRole)
    && !Array.isArray(userRole)
    && routeRole.some(role => {
      return authRole[userRole].indexOf(role) !== -1;
    })
  ) || (
    !Array.isArray(routeRole)
    && Array.isArray(userRole)
    && userRole.some(role => {
      return authRole[role].indexOf(routeRole) !== -1;
    })
  ) || (
    Array.isArray(routeRole)
    && Array.isArray(userRole)
    && routeRole.some(role => {
      return userRole.some(r => {
        return authRole[r].indexOf(role) !== -1;
      });
    })
  );
};
