import { getAuthorizedEmails } from '@/lib/data/email';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';

/**
 * Email Authorization Service
 *
 * Encapsulates business logic for email authorization:
 * - Email validation and formatting
 * - Duplicate detection
 * - Authorization rules
 * - Email whitelist management
 *
 * @example
 * ```typescript
 * const result = await EmailAuthorizationService.authorizeEmail('user@example.com');
 * if (result.status === 200) {
 *   console.log('Email authorized successfully');
 * }
 * ```
 */
export class EmailAuthorizationService {
  /**
   * Email validation regex (RFC 5322 simplified)
   */
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Validate email format according to RFC 5322 (simplified)
   *
   * @param email - Email address to validate
   * @returns true if email format is valid
   *
   * @example
   * ```typescript
   * EmailAuthorizationService.isValidEmailFormat('user@example.com'); // true
   * EmailAuthorizationService.isValidEmailFormat('invalid.email'); // false
   * ```
   */
  static isValidEmailFormat(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  /**
   * Normalize email address (trim whitespace, lowercase)
   *
   * @param email - Raw email address
   * @returns Normalized email address
   *
   * @example
   * ```typescript
   * EmailAuthorizationService.normalizeEmail('  User@Example.COM  ');
   * // Returns: 'user@example.com'
   * ```
   */
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Check if email is already authorized in the database
   *
   * @param email - Email address to check
   * @returns true if email exists in authorized list
   *
   * @throws {Error} If database query fails
   */
  static async isEmailAlreadyAuthorized(email: string): Promise<boolean> {
    try {
      const existingEmail = await prisma.authorizedEmail.findUnique({
        where: { email },
      });
      return !!existingEmail;
    } catch (error) {
      logError(error, 'isEmailAlreadyAuthorized');
      throw error;
    }
  }

  /**
   * Check if email is authorized to access the application
   *
   * Used by Better Auth hook to validate user registration
   *
   * @param email - Email address to verify
   * @returns true if email is in the authorized list
   *
   * @example
   * ```typescript
   * const isAuthorized = await EmailAuthorizationService.isEmailAuthorized('user@example.com');
   * if (!isAuthorized) {
   *   throw new Error('Email not authorized');
   * }
   * ```
   */
  static async isEmailAuthorized(email: string): Promise<boolean> {
    try {
      const { mails, status } = await getAuthorizedEmails();

      if (status !== 200 || !mails) {
        logError({}, 'Failed to fetch authorized emails in isEmailAuthorized');
        return false;
      }

      return mails.some((item) => item.email === email);
    } catch (error) {
      logError(error, 'isEmailAuthorized');
      return false;
    }
  }

  /**
   * Authorize a new email address (add to whitelist)
   *
   * Business logic:
   * 1. Validate email is not empty
   * 2. Validate email format
   * 3. Normalize email (trim, lowercase)
   * 4. Check for duplicates
   * 5. Create authorized email record
   *
   * @param email - Email address to authorize
   * @returns Operation result with status and optional message
   *
   * @example
   * ```typescript
   * const result = await EmailAuthorizationService.authorizeEmail('newuser@example.com');
   * if (result.status === 200) {
   *   console.log('Email added to whitelist');
   * } else if (result.status === 409) {
   *   console.log('Email already authorized');
   * }
   * ```
   */
  static async authorizeEmail(
    email: string
  ): Promise<{ status: number; message?: string }> {
    try {
      // 1. Validate email is not empty
      if (!email?.trim()) {
        return { status: 400, message: 'Email is required' };
      }

      // 2. Normalize email
      const normalizedEmail = this.normalizeEmail(email);

      // 3. Validate email format
      if (!this.isValidEmailFormat(normalizedEmail)) {
        return { status: 400, message: 'Invalid email format' };
      }

      // 4. Check for duplicates
      const isDuplicate = await this.isEmailAlreadyAuthorized(normalizedEmail);
      if (isDuplicate) {
        return { message: 'User Already authorized', status: 409 };
      }

      // 5. Create authorized email record (via Adapter)
      await prisma.authorizedEmail.create({
        data: { email: normalizedEmail },
      });

      return { status: 200, message: 'Email authorized successfully' };
    } catch (error) {
      logError(error, 'EmailAuthorizationService.authorizeEmail');
      const appError = handlePrismaError(error);
      return {
        status: appError.statusCode,
        message: appError.message,
      };
    }
  }

  /**
   * Revoke email authorization (remove from whitelist)
   *
   * Business logic:
   * 1. Validate email is not empty
   * 2. Normalize email
   * 3. Delete authorized email record
   *
   * @param email - Email address to revoke
   * @returns Operation result with status
   *
   * @example
   * ```typescript
   * const result = await EmailAuthorizationService.revokeEmailAuthorization('user@example.com');
   * if (result.status === 200) {
   *   console.log('Email removed from whitelist');
   * }
   * ```
   */
  static async revokeEmailAuthorization(
    email: string
  ): Promise<{ status: number; message?: string }> {
    try {
      // 1. Validate email
      if (!email?.trim()) {
        return { status: 400, message: 'Email is required' };
      }

      // 2. Normalize email
      const normalizedEmail = this.normalizeEmail(email);

      // 3. Delete authorized email record (via Adapter)
      const emailDeleted = await prisma.authorizedEmail.delete({
        where: { email: normalizedEmail },
      });

      if (!emailDeleted) {
        return { status: 404, message: 'Email not found' };
      }

      return { status: 200, message: 'Email authorization revoked' };
    } catch (error) {
      logError(error, 'EmailAuthorizationService.revokeEmailAuthorization');
      const appError = handlePrismaError(error);
      return {
        status: appError.statusCode,
        message: appError.message,
      };
    }
  }

  /**
   * Validate email during Better Auth user creation hook
   *
   * This method is specifically designed for Better Auth integration.
   * It validates that a user's email is authorized before allowing registration.
   *
   * @param email - User's email from Better Auth
   * @returns Validation result with authorization status
   *
   * @throws {Error} If authorization check fails
   *
   * @example
   * ```typescript
   * // In Better Auth hook:
   * const validation = await EmailAuthorizationService.validateEmailForAuth(user.email);
   * if (!validation.isAuthorized) {
   *   throw new APIError('UNAUTHORIZED', { message: validation.message });
   * }
   * ```
   */
  static async validateEmailForAuth(
    email: string | undefined
  ): Promise<{ isAuthorized: boolean; message?: string }> {
    try {
      // Validate email exists
      if (!email) {
        return {
          isAuthorized: false,
          message: 'Email is required',
        };
      }

      // Normalize email
      const normalizedEmail = this.normalizeEmail(email);

      // Check authorization
      const isAuthorized = await this.isEmailAuthorized(normalizedEmail);

      if (!isAuthorized) {
        return {
          isAuthorized: false,
          message:
            'Your email is not authorized to access this application. Please contact an administrator.',
        };
      }

      return {
        isAuthorized: true,
        message: 'Email is authorized',
      };
    } catch (error) {
      logError(error, 'EmailAuthorizationService.validateEmailForAuth');
      return {
        isAuthorized: false,
        message: 'Authorization check failed',
      };
    }
  }
}
