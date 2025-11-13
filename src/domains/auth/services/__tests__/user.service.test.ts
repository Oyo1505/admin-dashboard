import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IUser } from '@/models/user/user';
import { UserService } from '../user.service';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/lib/errors', () => ({
  handlePrismaError: jest.fn((error) => ({
    statusCode: 500,
    message: 'Database error',
  })),
  logError: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsersWithPageParam', () => {
    it('should return users without search filter', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'ADMIN',
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await UserService.getUsersWithPageParam('', 10);

      expect(result).toEqual({
        users: mockUsers,
        status: 200,
        newOffset: null,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({ take: 10 });
    });

    it('should return users with search filter', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await UserService.getUsersWithPageParam('John', 10);

      expect(result).toEqual({
        users: mockUsers,
        status: 200,
        newOffset: null,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'John',
            mode: 'insensitive',
          },
        },
        take: 10,
      });
    });

    it('should calculate correct offset when users length >= 20', async () => {
      const mockUsers = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: 'USER',
      }));

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await UserService.getUsersWithPageParam('', 20);

      expect(result).toEqual({
        users: mockUsers,
        status: 200,
        newOffset: 40, // 20 + 20
      });
    });

    it('should return 400 when search is not a string', async () => {
      const result = await UserService.getUsersWithPageParam(123 as any, 10);

      expect(result).toEqual({ status: 400 });
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should return 400 when pageParam is invalid', async () => {
      const result = await UserService.getUsersWithPageParam('', 0);

      expect(result).toEqual({ status: 400 });
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (prisma.user.findMany as jest.Mock).mockRejectedValue(mockError);

      const result = await UserService.getUsersWithPageParam('', 10);

      expect(result).toEqual({ status: 500 });
      expect(logError).toHaveBeenCalledWith(mockError, 'getUsersWithPageParam');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteUser', () => {
    const mockAdminUser: IUser = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    const mockRegularUser: IUser = {
      id: 'user-1',
      name: 'Regular User',
      email: 'user@example.com',
      role: 'USER',
    };

    it('should delete user successfully with ADMIN permissions', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'target-user',
        name: 'Target User',
      });
      (prisma.user.delete as jest.Mock).mockResolvedValue({
        id: 'target-user',
      });

      const result = await UserService.deleteUser({
        id: 'target-user',
        user: mockAdminUser,
      });

      expect(result).toEqual({
        status: 200,
        message: 'User deleted successfully',
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'target-user' },
      });
    });

    it('should return 400 when id is missing', async () => {
      const result = await UserService.deleteUser({
        id: '',
        user: mockAdminUser,
      });

      expect(result).toEqual({
        status: 400,
        message: 'User ID is required',
      });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not ADMIN', async () => {
      const result = await UserService.deleteUser({
        id: 'target-user',
        user: mockRegularUser,
      });

      expect(result).toEqual({
        status: 403,
        message: 'Unauthorized',
      });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should return 403 when user is missing', async () => {
      const result = await UserService.deleteUser({
        id: 'target-user',
        user: null as any,
      });

      expect(result).toEqual({
        status: 403,
        message: 'Unauthorized',
      });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should return 404 when user to delete does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserService.deleteUser({
        id: 'non-existent-user',
        user: mockAdminUser,
      });

      expect(result).toEqual({
        status: 404,
        message: 'User not found',
      });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'target-user',
      });

      const mockError = new Error('Database error');
      (prisma.user.delete as jest.Mock).mockRejectedValue(mockError);

      const result = await UserService.deleteUser({
        id: 'target-user',
        user: mockAdminUser,
      });

      expect(result.status).toBe(500);
      expect(logError).toHaveBeenCalledWith(mockError, 'deleteUserById');
      expect(handlePrismaError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteAccountFromUser', () => {
    it('should delete user account successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
      });
      (prisma.user.delete as jest.Mock).mockResolvedValue({ id: 'user-1' });

      const result = await UserService.deleteAccountFromUser('user-1');

      expect(result).toEqual({
        status: 200,
        message: 'User deleted successfully',
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should return 400 when id is missing', async () => {
      const result = await UserService.deleteAccountFromUser('');

      expect(result).toEqual({
        status: 400,
        message: 'User ID is required',
      });
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return 404 when user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserService.deleteAccountFromUser('non-existent');

      expect(result).toEqual({
        status: 404,
        message: 'User not found',
      });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
      });

      const mockError = new Error('Database error');
      (prisma.user.delete as jest.Mock).mockRejectedValue(mockError);

      const result = await UserService.deleteAccountFromUser('user-1');

      expect(result).toEqual({ status: 500 });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'deleteUserByIdFromUser'
      );
    });
  });
});
