import { User } from "../user/user"

export type Session = {
  user:User
  expires:Date
}

