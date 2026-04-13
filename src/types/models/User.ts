import {
  object as yupObject,
  number as yupNumber,
  string as yupString,
  boolean as yupBoolean,
  array as yupArray,
} from "yup";

/**
 * User model used in the user CRUD.
 */
export interface User {
  id: number;
  email: string;
  enabled: boolean;
  first_login_completed: boolean;
  oimmei: boolean;
  admin: boolean;
  roles: string[];
}

export const userSchema = yupObject({
  id: yupNumber().required(),
  email: yupString().required(),
  enabled: yupBoolean().required(),
  first_login_completed: yupBoolean().required(),
  oimmei: yupBoolean().required(),
  admin: yupBoolean().required(),
  roles: yupArray().of(
    yupString(),
  ),
});

// The new empty user.
export const newUser: User = {
  id: 0,
  email: "",
  enabled: true,
  first_login_completed: true,
  oimmei: false,
  admin: false,
  roles: [],
};
