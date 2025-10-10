/**
 * Manual mock for @/lib/auth-client
 *
 * This mock avoids loading better-auth/react which uses nanostores (ES modules)
 * that cause Jest parsing errors.
 */

export const useSession = jest.fn();
export const signIn = jest.fn();
export const signOut = jest.fn();
