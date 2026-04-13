import {AuthUser} from "../AuthUser";

export interface AuthUserSignup extends AuthUser {
  password: string;
  password_confirmation: string;
  remember_me: boolean;
}

// The empty user for creation.
export const newAuthUserSignup: AuthUserSignup = {
  id: 0,
  email: '',
  password: '',
  password_confirmation: '',
  remember_me: true,
  oimmei: false,
  admin: false,
  roles: [],
};
