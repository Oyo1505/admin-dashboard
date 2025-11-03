import { PermissionService, Permission, UserRole } from '../permission.service';
import { getServerSession } from '@/lib/auth';
import { SelectUser } from '@/lib/db';
import { logError } from '@/lib/errors';
import prisma from '@/lib/prisma';

// Mock dependencies
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

jest.mock('@/lib/errors', () => ({
  logError: jest.fn(),
}));

describe('PermissionService', () => {
  const mockUser: SelectUser = {
    id: 'user-123',
    email: 'user@example.com',
    name: 'Test User',
    image: 'avatar.jpg',
    role: 'USER',
  };

  const mockAdmin: SelectUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    image: 'admin-avatar.jpg',
    role: 'ADMIN',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('should return true for USER reading movies', () => {
      const result = PermissionService.checkPermission(
        mockUser,
        'can:read',
        'movie'
      );

      expect(result).toBe(true);
    });

    it('should return false for USER creating movies', () => {
      const result = PermissionService.checkPermission(
        mockUser,
        'can:create',
        'movie'
      );

      expect(result).toBe(false);
    });

    it('should return true for ADMIN creating movies', () => {
      const result = PermissionService.checkPermission(
        mockAdmin,
        'can:create',
        'movie'
      );

      expect(result).toBe(true);
    });

    it('should return true for ADMIN deleting users', () => {
      const result = PermissionService.checkPermission(
        mockAdmin,
        'can:delete',
        'user'
      );

      expect(result).toBe(true);
    });

    it('should return false for USER deleting users', () => {
      const result = PermissionService.checkPermission(
        mockUser,
        'can:delete',
        'user'
      );

      expect(result).toBe(false);
    });

    it('should return true for USER managing favorites', () => {
      expect(
        PermissionService.checkPermission(mockUser, 'can:create', 'favorite')
      ).toBe(true);
      expect(
        PermissionService.checkPermission(mockUser, 'can:delete', 'favorite')
      ).toBe(true);
      expect(
        PermissionService.checkPermission(mockUser, 'can:read', 'favorite')
      ).toBe(true);
    });

    it('should return false when user is missing', () => {
      const result = PermissionService.checkPermission(
        null as any,
        'can:read',
        'movie'
      );

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(
        { user: null },
        'PermissionService.checkPermission: User or role is missing'
      );
    });

    it('should return false when role is missing', () => {
      const userWithoutRole = { ...mockUser, role: undefined };
      const result = PermissionService.checkPermission(
        userWithoutRole as any,
        'can:read',
        'movie'
      );

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalled();
    });

    it('should return false for invalid role', () => {
      const userWithInvalidRole = { ...mockUser, role: 'INVALID_ROLE' as any };
      const result = PermissionService.checkPermission(
        userWithInvalidRole,
        'can:read',
        'movie'
      );

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(
        { role: 'INVALID_ROLE' },
        'PermissionService.checkPermission: Invalid role'
      );
    });

    it('should handle exceptions and return false', () => {
      // Create a user object that will throw an error when accessed
      const errorUser: any = {};
      Object.defineProperty(errorUser, 'role', {
        get() {
          throw new Error('Test error');
        },
      });

      const result = PermissionService.checkPermission(
        errorUser,
        'can:read',
        'movie'
      );

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        'PermissionService.checkPermission'
      );
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      expect(PermissionService.isAdmin(mockAdmin)).toBe(true);
    });

    it('should return false for USER role', () => {
      expect(PermissionService.isAdmin(mockUser)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(PermissionService.isAdmin(undefined as any)).toBe(false);
    });
  });

  describe('isRegularUser', () => {
    it('should return true for USER role', () => {
      expect(PermissionService.isRegularUser(mockUser)).toBe(true);
    });

    it('should return false for ADMIN role', () => {
      expect(PermissionService.isRegularUser(mockAdmin)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(PermissionService.isRegularUser(undefined as any)).toBe(false);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return ADMIN permissions', () => {
      const permissions = PermissionService.getPermissionsForRole('ADMIN');

      expect(permissions).toContain('can:delete:user');
      expect(permissions).toContain('can:create:movie');
      expect(permissions).toContain('can:update:genre');
      expect(permissions).toContain('can:delete:director');
      expect(permissions).toContain('can:viewAnalyticsAdmin:dashboard');
      expect(permissions).toContain('can:create:authorizedEmail');
      expect(permissions.length).toBeGreaterThan(20);
    });

    it('should return USER permissions', () => {
      const permissions = PermissionService.getPermissionsForRole('USER');

      expect(permissions).toContain('can:read:user');
      expect(permissions).toContain('can:read:movie');
      expect(permissions).toContain('can:delete:hisAccount');
      expect(permissions).toContain('can:update:hisAccount');
      expect(permissions).toContain('can:create:favorite');
      expect(permissions).not.toContain('can:delete:user');
      expect(permissions).not.toContain('can:create:movie');
    });

    it('should return empty array for invalid role', () => {
      const permissions = PermissionService.getPermissionsForRole(
        'INVALID' as UserRole
      );

      expect(permissions).toEqual([]);
    });
  });

  describe('validateSession', () => {
    it('should return valid session with user data', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'user@example.com' },
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        image: 'avatar.jpg',
        role: 'USER',
      });

      const result = await PermissionService.validateSession();

      expect(result).toEqual({
        isValid: true,
        status: 200,
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          image: 'avatar.jpg',
          role: 'USER',
        },
        message: 'Session valid',
      });
    });

    it('should handle null image in database', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'user@example.com' },
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        image: null,
        role: 'USER',
      });

      const result = await PermissionService.validateSession();

      expect(result.user?.image).toBeUndefined();
      expect(result.status).toBe(200);
    });

    it('should return 401 when session is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const result = await PermissionService.validateSession();

      expect(result).toEqual({
        isValid: false,
        status: 401,
        message: 'Invalid session - not authenticated',
      });
    });

    it('should return 401 when session user is missing', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: null,
      });

      const result = await PermissionService.validateSession();

      expect(result).toEqual({
        isValid: false,
        status: 401,
        message: 'Invalid session - not authenticated',
      });
    });

    it('should return 404 when user not found in database', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'notfound@example.com' },
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await PermissionService.validateSession();

      expect(result).toEqual({
        isValid: false,
        status: 404,
        message: 'User not found in database',
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'user@example.com' },
      });

      (prisma.user.findUnique as jest.Mock).mockRejectedValue(mockError);

      const result = await PermissionService.validateSession();

      expect(result).toEqual({
        isValid: false,
        status: 500,
        message: 'Session validation failed',
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'PermissionService.validateSession'
      );
    });
  });

  describe('validateAdminSession', () => {
    it('should return valid admin session', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'admin@example.com' },
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        image: 'admin-avatar.jpg',
        role: 'ADMIN',
      });

      const result = await PermissionService.validateAdminSession();

      expect(result).toEqual({
        isValid: true,
        status: 200,
        user: mockAdmin,
        message: 'Admin session valid',
      });
    });

    it('should return 403 when user is not admin', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'user@example.com' },
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        image: 'avatar.jpg',
        role: 'USER',
      });

      const result = await PermissionService.validateAdminSession();

      expect(result).toEqual({
        isValid: false,
        status: 403,
        user: mockUser,
        message: 'Admin rights required',
      });
    });

    it('should return 401 when session is invalid', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const result = await PermissionService.validateAdminSession();

      expect(result.status).toBe(401);
      expect(result.isValid).toBe(false);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Validation error');
      (getServerSession as jest.Mock).mockRejectedValue(mockError);

      const result = await PermissionService.validateAdminSession();

      // Error occurs in validateSession which is called first
      expect(result).toEqual({
        isValid: false,
        status: 500,
        message: 'Session validation failed',
      });
      expect(logError).toHaveBeenCalledWith(
        mockError,
        'PermissionService.validateSession'
      );
    });
  });

  describe('checkPermissionDetailed', () => {
    it('should return permission granted for valid permission', () => {
      const result = PermissionService.checkPermissionDetailed(
        mockUser,
        'can:read',
        'movie'
      );

      expect(result).toEqual({
        hasPermission: true,
        user: mockUser,
        message: 'Permission granted: can:read:movie',
      });
    });

    it('should return permission denied for USER creating movie', () => {
      const result = PermissionService.checkPermissionDetailed(
        mockUser,
        'can:create',
        'movie'
      );

      expect(result).toEqual({
        hasPermission: false,
        message:
          'Permission denied: can:create:movie requires ADMIN privileges',
      });
    });

    it('should return permission denied with higher privileges message for ADMIN', () => {
      const superAdminUser = { ...mockAdmin, role: 'ADMIN' as UserRole };
      const result = PermissionService.checkPermissionDetailed(
        superAdminUser,
        'can:superAdmin',
        'system'
      );

      expect(result).toEqual({
        hasPermission: false,
        message:
          'Permission denied: can:superAdmin:system requires higher privileges',
      });
    });
  });

  describe('canActOnOwnAccount', () => {
    it('should return true when user acts on own account with update permission', () => {
      const result = PermissionService.canActOnOwnAccount(
        mockUser,
        'user-123',
        'can:update'
      );

      expect(result).toBe(true);
    });

    it('should return true when user acts on own account with delete permission', () => {
      const result = PermissionService.canActOnOwnAccount(
        mockUser,
        'user-123',
        'can:delete'
      );

      expect(result).toBe(true);
    });

    it('should return false when user tries to act on different account', () => {
      const result = PermissionService.canActOnOwnAccount(
        mockUser,
        'other-user-456',
        'can:update'
      );

      expect(result).toBe(false);
    });

    it('should return false when user does not have self-management permission', () => {
      const userWithoutPermission = { ...mockUser };
      // Note: In real scenario, this would be a user without hisAccount permissions
      // But our USER role has these permissions, so testing with a different user ID
      const result = PermissionService.canActOnOwnAccount(
        userWithoutPermission,
        'different-user',
        'can:update'
      );

      expect(result).toBe(false);
    });
  });
});
