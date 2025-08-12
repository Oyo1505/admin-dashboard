import { User } from '@/models/user/user';

export const userNotUnautorized = (user: User) => {
  if (user.role !== 'ADMIN')
    return {
      status: 403,
      message: 'Unautorized',
    };
};
