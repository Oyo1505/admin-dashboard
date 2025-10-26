/**
 * Auth Domain Services
 *
 * Centralized export for all authentication and authorization services.
 * This provides a clean interface for importing services throughout the application.
 *
 * @module auth/services
 *
 * @example
 * ```typescript
 * // Import all services
 * import {
 *   EmailAuthorizationService,
 *   UserAnalyticsService,
 *   PermissionService
 * } from '@/domains/auth/services';
 *
 * // Use in actions
 * const result = await EmailAuthorizationService.authorizeEmail(email);
 * ```
 */

export { EmailAuthorizationService } from './email-authorization.service';
export { UserAnalyticsService } from './user-analytics.service';
export {
  PermissionService,
  type Permission,
  type UserRole,
  type PermissionCheckResult,
  type SessionValidationResult,
} from './permission.service';
