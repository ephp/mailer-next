/**
 * User model used in the authentication for the current user.
 */
export interface AuthUser {
  id: number;
  email: string;
  oimmei: boolean;
  admin: boolean;
  roles: string[];
}
