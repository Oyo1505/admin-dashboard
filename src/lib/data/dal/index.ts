/**
 * Data Access Layer (DAL) - Security Layer
 *
 * This layer provides centralized authentication and authorization
 * following Next.js best practices for data security.
 *
 * @see https://nextjs.org/docs/app/guides/authentication#creating-a-data-access-layer-dal
 */

// Core authentication functions
export {
  getCurrentUser,
  verifyAdmin,
  verifyOwnership,
  verifySession,
} from './core/auth';

// Error handling
export { DALError, type DALErrorType } from './core/errors';

// Helper functions for Actions
export { withAuth, withDALAuth } from './helpers';
