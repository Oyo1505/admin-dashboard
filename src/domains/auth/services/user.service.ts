import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { User } from '@/models/user/user';
import { URL_DASHBOARD_ROUTE, URL_HOME } from '@/shared/route';
import { revalidatePath } from 'next/cache';

/**
 * Service managing user-related operations
 */
export class UserService {
  /**
   * Retrieves a list of users with pagination and search
   * @param search - Search term (username)
   * @param pageParam - Number of users to retrieve
   * @returns List of users, next offset, and HTTP status
   */
  static async getUsersWithPageParam(
    search: string,
    pageParam: number
  ): Promise<{ users?: User[]; newOffset?: number | null; status: number }> {
    try {
      if (typeof search !== 'string') {
        return { status: 400 };
      }

      if (typeof pageParam !== 'number' || pageParam <= 0) {
        return { status: 400 };
      }

      const users =
        search.trim() === ''
          ? await prisma.user.findMany({ take: pageParam })
          : await prisma.user.findMany({
              where: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              take: pageParam,
            });

      const newOffset = users.length >= 20 ? pageParam + 20 : null;
      return {
        users: users as User[],
        status: 200,
        newOffset: newOffset,
      };
    } catch (error) {
      logError(error, 'getUsersWithPageParam');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
  static async deleteUser({
    id,
    user,
  }: {
    id: string;
    user: User;
  }): Promise<{ status: number; message?: string }> {
    try {
      if (!id?.trim()) {
        return { status: 400, message: 'User ID is required' };
      }

      if (!user || user.role !== 'ADMIN') {
        return { status: 403, message: 'Unauthorized' };
      }

      const userToDelete = await prisma.user.findUnique({
        where: { id },
      });

      if (!userToDelete) {
        return { status: 404, message: 'User not found' };
      }

      await prisma.user.delete({
        where: { id },
      });

      revalidatePath(URL_DASHBOARD_ROUTE.users);
      return { status: 200, message: 'User deleted successfully' };
    } catch (error) {
      logError(error, 'deleteUserById');
      const appError = handlePrismaError(error);
      return {
        status: appError.statusCode,
        message: appError.message,
      };
    }
  }
  static async deleteAccountFromUser(
    id: string
  ): Promise<{ status: number; message?: string }> {
    if (!id) {
      return {
        status: 400,
        message: 'User ID is required',
      };
    }

    try {
      const userToDelete = await prisma.user.findUnique({
        where: { id },
      });

      if (!userToDelete) {
        return {
          status: 404,
          message: 'User not found',
        };
      }

      await prisma.user.delete({
        where: { id },
      });

      revalidatePath(URL_HOME);
      return { status: 200, message: 'User deleted successfully' };
    } catch (error) {
      logError(error, 'deleteUserByIdFromUser');
      const appError = handlePrismaError(error);
      return { status: appError.statusCode };
    }
  }
}
