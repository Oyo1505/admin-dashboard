import { User } from "../user/user"

export type Session = {
  user:User
  expires:Date
}

export type EmailAuthorized = {
  email: string;
  id?: string;
}
