'use server';

import { verifyAdmin } from '@/lib/data/dal/core/auth';
import { withAuth } from '@/lib/data/dal/helpers';
import { EmailAuthorizationService } from '../services';

/**
 * Email Authorization Actions
 *
 * These are Server Actions that serve as Controllers for email authorization.
 * They delegate business logic to EmailAuthorizationService.
 *
 * Architecture:
 * - Actions (this file): HTTP validation + orchestration
 * - Service: Business logic
 * - Adapter (lib/data/email.ts): Database access
 */

/**
 * Add email to authorized whitelist
 *
 * Controller action that delegates to EmailAuthorizationService
 *
 * @param email - Email address to authorize
 * @returns Operation result with status and message
 *
 * @example
 * ```typescript
 * const result = await postAuthorizedEmail('user@example.com');
 * if (result.status === 200) {
 *   console.log('Email authorized');
 * }
 * ```
 */
export const postAuthorizedEmail = async (
  email: string
): Promise<{ status?: number | undefined; message?: string | undefined }> => {
  // Delegate to Service for business logic
  return await EmailAuthorizationService.authorizeEmail(email);
};

/**
 * Remove email from authorized whitelist
 *
 * Controller action that delegates to EmailAuthorizationService
 *
 * @param email - Email address to revoke authorization
 * @returns Operation result with status
 *
 * @example
 * ```typescript
 * const result = await deleteEmailAuthorized('user@example.com');
 * if (result.status === 200) {
 *   console.log('Email authorization revoked');
 * }
 * ```
 */
export const deleteEmailAuthorized = withAuth(
  verifyAdmin,
  async (
    email: string
  ): Promise<{ status?: number | undefined; message?: string | undefined }> => {
    return await EmailAuthorizationService.revokeEmailAuthorization(email);
  }
);
