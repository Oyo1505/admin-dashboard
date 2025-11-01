// Mock dependencies MUST be before imports to avoid ESM issues with Better Auth
jest.mock('@/lib/auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  getCurrentUser,
  verifyAdmin,
  verifyOwnership,
  verifySession,
} from '../auth';
import { DALError } from '../errors';

describe('DAL Core - Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifySession', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = {
        user: { email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-123' },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const result = await verifySession();

      expect(result).toEqual(mockSession);
      expect(getServerSession).toHaveBeenCalledTimes(1);
    });

    it('should throw UNAUTHORIZED when no session exists', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      await expect(verifySession()).rejects.toThrow(DALError);
      await expect(verifySession()).rejects.toMatchObject({
        type: 'UNAUTHORIZED',
        message: 'No active session',
      });
    });

    it('should throw UNAUTHORIZED when session has no user', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: null });

      await expect(verifySession()).rejects.toThrow(DALError);
    });

    it('should throw UNAUTHORIZED when user has no email', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { name: 'Test' },
      });

      await expect(verifySession()).rejects.toThrow(DALError);
    });
  });

  describe('getCurrentUser', () => {
    const mockSession = {
      user: { email: 'test@example.com', name: 'Test User' },
      session: { id: 'session-123' },
    };

    const mockDbUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      role: 'USER',
    };

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    it('should return user with all fields when found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);

      const result = await getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        role: 'USER',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
        },
      });
    });

    it('should handle null image correctly', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockDbUser,
        image: null,
      });

      const result = await getCurrentUser();

      expect(result.image).toBeUndefined();
    });

    it('should throw NOT_FOUND when user not in database', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getCurrentUser()).rejects.toThrow(DALError);
      await expect(getCurrentUser()).rejects.toMatchObject({
        type: 'NOT_FOUND',
        message: 'User not found in database',
      });
    });

    it('should throw UNAUTHORIZED when no session', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      await expect(getCurrentUser()).rejects.toThrow(DALError);
      await expect(getCurrentUser()).rejects.toMatchObject({
        type: 'UNAUTHORIZED',
      });
    });

    it('should return ADMIN role correctly', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockDbUser,
        role: 'ADMIN',
      });

      const result = await getCurrentUser();

      expect(result.role).toBe('ADMIN');
    });
  });

  describe('verifyAdmin', () => {
    const mockSession = {
      user: { email: 'admin@example.com', name: 'Admin User' },
      session: { id: 'session-123' },
    };

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    it('should return user when user is ADMIN', async () => {
      const adminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        image: null,
        role: 'ADMIN',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const result = await verifyAdmin();

      expect(result).toEqual({
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        image: undefined,
        role: 'ADMIN',
      });
    });

    it('should throw FORBIDDEN when user is not ADMIN', async () => {
      const regularUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Regular User',
        image: null,
        role: 'USER',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(regularUser);

      await expect(verifyAdmin()).rejects.toThrow(DALError);
      await expect(verifyAdmin()).rejects.toMatchObject({
        type: 'FORBIDDEN',
        message: 'Admin privileges required',
      });
    });

    it('should throw when no session exists', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      await expect(verifyAdmin()).rejects.toThrow(DALError);
      await expect(verifyAdmin()).rejects.toMatchObject({
        type: 'UNAUTHORIZED',
      });
    });

    it('should throw when user not found in database', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(verifyAdmin()).rejects.toThrow(DALError);
      await expect(verifyAdmin()).rejects.toMatchObject({
        type: 'NOT_FOUND',
      });
    });
  });

  describe('verifyOwnership', () => {
    const mockSession = {
      user: { email: 'user@example.com', name: 'Test User' },
      session: { id: 'session-123' },
    };

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    it('should return user when accessing own resource', async () => {
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        image: null,
        role: 'USER',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await verifyOwnership('user-123');

      expect(result).toEqual({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        image: undefined,
        role: 'USER',
      });
    });

    it('should throw FORBIDDEN when accessing another user resource as USER', async () => {
      const user = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        image: null,
        role: 'USER',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      await expect(verifyOwnership('other-user-456')).rejects.toThrow(DALError);
      await expect(verifyOwnership('other-user-456')).rejects.toMatchObject({
        type: 'FORBIDDEN',
        message: 'Access to resource denied',
      });
    });

    it('should allow ADMIN to access any user resource', async () => {
      const adminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        image: null,
        role: 'ADMIN',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const result = await verifyOwnership('other-user-456');

      expect(result.role).toBe('ADMIN');
      expect(result.id).toBe('admin-123');
    });

    it('should throw when no session exists', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      await expect(verifyOwnership('user-123')).rejects.toThrow(DALError);
      await expect(verifyOwnership('user-123')).rejects.toMatchObject({
        type: 'UNAUTHORIZED',
      });
    });

    it('should throw when user not found in database', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(verifyOwnership('user-123')).rejects.toThrow(DALError);
      await expect(verifyOwnership('user-123')).rejects.toMatchObject({
        type: 'NOT_FOUND',
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete admin workflow', async () => {
      const mockSession = {
        user: { email: 'admin@example.com' },
        session: { id: 'session-123' },
      };

      const adminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin',
        image: null,
        role: 'ADMIN',
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(adminUser);

      // Verify session works
      await expect(verifySession()).resolves.toBeDefined();

      // Verify admin check passes
      await expect(verifyAdmin()).resolves.toMatchObject({
        role: 'ADMIN',
      });

      // Verify ownership check passes for any resource
      await expect(verifyOwnership('any-user-id')).resolves.toMatchObject({
        role: 'ADMIN',
      });
    });

    it('should handle complete regular user workflow', async () => {
      const mockSession = {
        user: { email: 'user@example.com' },
        session: { id: 'session-123' },
      };

      const regularUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'User',
        image: null,
        role: 'USER',
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(regularUser);

      // Verify session works
      await expect(verifySession()).resolves.toBeDefined();

      // Verify admin check fails
      await expect(verifyAdmin()).rejects.toThrow(DALError);

      // Verify ownership check passes for own resources
      await expect(verifyOwnership('user-123')).resolves.toMatchObject({
        id: 'user-123',
      });

      // Verify ownership check fails for other resources
      await expect(verifyOwnership('other-user')).rejects.toThrow(DALError);
    });
  });
});
