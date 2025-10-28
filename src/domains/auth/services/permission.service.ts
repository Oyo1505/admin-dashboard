import { getServerSession } from '@/lib/auth';
import { SelectUser } from '@/lib/db';
import { logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { User } from '@/models/user/user';

/**
 * Permission Type Definition
 *
 * Format: action:resource
 * Examples: 'can:read:movie', 'can:create:user', 'can:delete:genre'
 */
export type Permission = `${string}:${string}`;

/**
 * User Role Enum
 * Matches Prisma schema UserRole
 */
export type UserRole = 'USER' | 'ADMIN';

/**
 * Permission Check Result
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  user?: SelectUser;
  message?: string;
}

/**
 * Session Validation Result
 */
export interface SessionValidationResult {
  isValid: boolean;
  status: number;
  user?: SelectUser;
  message?: string;
}

/**
 * Permission Service
 *
 * Encapsulates Role-Based Access Control (RBAC) logic:
 * - Permission checking based on user roles
 * - Session validation with role enrichment
 * - Admin-only operation guards
 * - Fine-grained permission management
 *
 * This service implements the principle of least privilege by default.
 * All operations require explicit permission checks.
 *
 * @example
 * ```typescript
 * // Check if user can create a movie
 * const canCreate = PermissionService.checkPermission(user, 'can:create:movie');
 *
 * // Validate session and check admin role
 * const result = await PermissionService.validateAdminSession();
 * if (result.status === 200) {
 *   console.log('Admin access granted');
 * }
 * ```
 */
export class PermissionService {
  /**
   * Permission Matrix
   *
   * Defines which roles have which permissions.
   * This is the single source of truth for access control.
   *
   * To add a new permission:
   * 1. Add it to the appropriate role array
   * 2. Document it in the auth-service-layer.md
   * 3. Use it in your actions with checkPermission()
   */
  private static readonly PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
    ADMIN: [
      // User Management
      'can:delete:user',
      'can:create:user',
      'can:update:user',
      'can:read:user',

      // Movie Management
      'can:delete:movie',
      'can:create:movie',
      'can:update:movie',
      'can:read:movie',

      // Genre Management
      'can:delete:genre',
      'can:create:genre',
      'can:update:genre',
      'can:read:genre',

      // Director Management
      'can:delete:director',
      'can:create:director',
      'can:update:director',
      'can:read:director',

      // Analytics & Dashboard
      'can:viewAnalyticsAdmin:dashboard',
      'can:viewAnalyticsUser:dashboard',

      // Email Authorization
      'can:create:authorizedEmail',
      'can:delete:authorizedEmail',
      'can:read:authorizedEmail',
    ],
    USER: [
      // Basic Read Access
      'can:read:user',
      'can:read:movie',

      // Self-Management
      'can:delete:hisAccount',
      'can:update:hisAccount',

      // User Analytics
      'can:viewAnalyticsUser:dashboard',

      // Favorites
      'can:create:favorite',
      'can:delete:favorite',
      'can:read:favorite',
    ],
  };

  /**
   * Check if a user has a specific permission
   *
   * Business logic:
   * 1. Validate user object and role
   * 2. Retrieve permissions for user's role
   * 3. Check if permission exists in role's permission array
   *
   * @param user - User object with role
   * @param action - Action to perform (e.g., 'can:create')
   * @param resource - Resource to act on (e.g., 'movie')
   * @returns true if user has permission, false otherwise
   *
   * @example
   * ```typescript
   * const user = { id: '123', role: 'USER', email: 'user@example.com' };
   *
   * // Check movie read permission
   * const canRead = PermissionService.checkPermission(user, 'can:read', 'movie');
   * // Returns: true (USER can read movies)
   *
   * // Check movie create permission
   * const canCreate = PermissionService.checkPermission(user, 'can:create', 'movie');
   * // Returns: false (USER cannot create movies)
   * ```
   */
  static checkPermission(
    user: User | SelectUser,
    action: string,
    resource: string
  ): boolean {
    try {
      // 1. Validate user and role
      if (!user?.role) {
        logError(
          { user },
          'PermissionService.checkPermission: User or role is missing'
        );
        return false;
      }

      // 2. Get permissions for role
      const rolePermissions = this.PERMISSION_MATRIX[user.role as UserRole];

      if (!rolePermissions) {
        logError(
          { role: user.role },
          'PermissionService.checkPermission: Invalid role'
        );
        return false;
      }

      // 3. Check if permission exists
      const permission: Permission = `${action}:${resource}`;
      return rolePermissions.includes(permission);
    } catch (error) {
      logError(error, 'PermissionService.checkPermission');
      return false;
    }
  }

  /**
   * Check if user has admin role
   *
   * Convenience method for common admin checks
   *
   * @param user - User object to check
   * @returns true if user is admin
   *
   * @example
   * ```typescript
   * if (PermissionService.isAdmin(user)) {
   *   // Admin-only code
   * }
   * ```
   */
  static isAdmin(user: User | SelectUser): boolean {
    return user?.role === 'ADMIN';
  }

  /**
   * Check if user has regular user role
   *
   * @param user - User object to check
   * @returns true if user has USER role
   */
  static isRegularUser(user: User | SelectUser): boolean {
    return user?.role === 'USER';
  }

  /**
   * Get all permissions for a user role
   *
   * Useful for debugging and UI permission displays
   *
   * @param role - User role to get permissions for
   * @returns Array of permissions for the role
   *
   * @example
   * ```typescript
   * const adminPerms = PermissionService.getPermissionsForRole('ADMIN');
   * console.log(adminPerms); // ['can:delete:user', 'can:create:user', ...]
   * ```
   */
  static getPermissionsForRole(role: UserRole): Permission[] {
    return this.PERMISSION_MATRIX[role] || [];
  }

  /**
   * Validate current session and enrich with user role
   *
   * Business logic:
   * 1. Get session from Better Auth
   * 2. Validate session exists and has user
   * 3. Fetch full user data from database (including role)
   * 4. Return enriched user object with role
   *
   * Note: Better Auth session doesn't include role by default,
   * so we need to fetch from database
   *
   * @returns Session validation result with user data
   *
   * @example
   * ```typescript
   * const validation = await PermissionService.validateSession();
   * if (validation.status === 200 && validation.user) {
   *   console.log(`User ${validation.user.email} is ${validation.user.role}`);
   * }
   * ```
   */
  static async validateSession(): Promise<SessionValidationResult> {
    try {
      // 1. Get session from Better Auth
      const session = await getServerSession();

      if (!session?.user) {
        return {
          isValid: false,
          status: 401,
          message: 'Invalid session - not authenticated',
        };
      }

      // 2. Fetch user with role from database
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
        },
      });

      if (!dbUser) {
        return {
          isValid: false,
          status: 404,
          message: 'User not found in database',
        };
      }

      // 3. Create SelectUser object with role
      const user: SelectUser = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image ?? undefined,
        role: dbUser.role as UserRole,
      };

      return {
        isValid: true,
        status: 200,
        user,
        message: 'Session valid',
      };
    } catch (error) {
      logError(error, 'PermissionService.validateSession');
      return {
        isValid: false,
        status: 500,
        message: 'Session validation failed',
      };
    }
  }

  /**
   * Validate session and check for admin role
   *
   * Business logic:
   * 1. Validate session (get user with role)
   * 2. Check if user has ADMIN role
   * 3. Return validation result
   *
   * This is a common pattern for protecting admin-only actions
   *
   * @returns Session validation result with admin check
   *
   * @example
   * ```typescript
   * // In a Server Action:
   * export const deleteMovie = async (movieId: string) => {
   *   const authCheck = await PermissionService.validateAdminSession();
   *   if (authCheck.status !== 200) {
   *     return { status: authCheck.status, message: authCheck.message };
   *   }
   *   // Proceed with admin operation
   * };
   * ```
   */
  static async validateAdminSession(): Promise<SessionValidationResult> {
    try {
      // 1. Validate session
      const validation = await this.validateSession();

      if (!validation.isValid || !validation.user) {
        return validation;
      }

      // 2. Check admin role
      if (!this.isAdmin(validation.user)) {
        return {
          isValid: false,
          status: 403,
          user: validation.user,
          message: 'Admin rights required',
        };
      }

      return {
        isValid: true,
        status: 200,
        user: validation.user,
        message: 'Admin session valid',
      };
    } catch (error) {
      logError(error, 'PermissionService.validateAdminSession');
      return {
        isValid: false,
        status: 500,
        message: 'Admin session validation failed',
      };
    }
  }

  /**
   * Check if user has permission and return detailed result
   *
   * Combines permission checking with detailed result object.
   * Useful for actions that need to return permission check details.
   *
   * @param user - User to check permissions for
   * @param action - Action to perform
   * @param resource - Resource to act on
   * @returns Detailed permission check result
   *
   * @example
   * ```typescript
   * const result = PermissionService.checkPermissionDetailed(
   *   user,
   *   'can:delete',
   *   'movie'
   * );
   * if (!result.hasPermission) {
   *   return { status: 403, message: result.message };
   * }
   * ```
   */
  static checkPermissionDetailed(
    user: User | SelectUser,
    action: string,
    resource: string
  ): PermissionCheckResult {
    const hasPermission = this.checkPermission(user, action, resource);

    if (!hasPermission) {
      return {
        hasPermission: false,
        message: `Permission denied: ${action}:${resource} requires ${user.role === 'USER' ? 'ADMIN' : 'higher'} privileges`,
      };
    }

    return {
      hasPermission: true,
      user: user as SelectUser,
      message: `Permission granted: ${action}:${resource}`,
    };
  }

  /**
   * Validate user can perform action on their own account
   *
   * Business logic:
   * 1. Check if user is trying to act on their own account
   * 2. Verify they have the self-management permission
   *
   * @param currentUser - User making the request
   * @param targetUserId - User ID being acted upon
   * @param action - Action to perform (e.g., 'can:update', 'can:delete')
   * @returns true if user can act on their own account
   *
   * @example
   * ```typescript
   * // User updating their own profile
   * const canUpdate = PermissionService.canActOnOwnAccount(
   *   user,
   *   user.id,
   *   'can:update'
   * );
   * ```
   */
  static canActOnOwnAccount(
    currentUser: User | SelectUser,
    targetUserId: string,
    action: 'can:update' | 'can:delete'
  ): boolean {
    // Check if acting on own account
    if (currentUser.id !== targetUserId) {
      return false;
    }

    // Check if user has self-management permission
    const resource = action === 'can:delete' ? 'hisAccount' : 'hisAccount';
    return this.checkPermission(currentUser, action, resource);
  }
}
