import { IUser } from '../user/user';

export type Session = {
  user: IUser;
  expires: Date;
};

export type EmailAuthorized = {
  email: string;
  id?: string;
};
