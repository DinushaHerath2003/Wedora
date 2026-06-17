import { UserRole } from '../constants';

export type JwtPayload = {
  sub: string | number;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequestUser = JwtPayload;
