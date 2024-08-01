export interface  User  {
  id: string;
  name: string | undefined;
  email: string | undefined;
  emailVerified?: Date | undefined;
  image: string | undefined;
  role?: UserRole
}

enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}