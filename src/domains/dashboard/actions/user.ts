'use server';
import { UserService } from '@/domains/auth/services/user.service';
import { User } from '@/models/user/user';
import { EmailService } from '../services';

export const getUsersWithPageParam = async (
  search: string,
  pageParam: number
): Promise<{ users?: User[]; newOffset?: number | null; status: number }> => {
  return await UserService.getUsersWithPageParam(search, pageParam);
};

export const deleteUserByIdFromUser = async (
  id: string
): Promise<{ status: number; message?: string }> => {
  return await UserService.deleteAccountFromUser(id);
};

export const deleteUserById = async ({
  id,
  user,
}: {
  id: string;
  user: User;
}): Promise<{ status: number; message?: string }> => {
  return await UserService.deleteUser({
    id,
    user,
  });
};

export const sendEmail = async ({
  message,
  topic,
  emailUser,
}: {
  message: string;
  topic: string;
  emailUser: string;
}): Promise<{ status: number }> => {
  return await EmailService.sendMail({
    message,
    topic,
    emailUser,
  });
};
