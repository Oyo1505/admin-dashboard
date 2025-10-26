import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { EmailAuthorizationService } from '@/domains/auth/services';
import { logError } from './errors';
import prisma from './prisma';

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  session: {
    expiresIn: 604800, // 7 days
    updateAge: 86400, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 1800, // 30 minutes
    },
  },
  socialProviders: {
    google: {
      prompt: 'select_account consent',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: 'offline',
    },
  },
  trustedOrigins: [process.env.NEXTAUTH_URL as string],
  plugins: [nextCookies()],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Validate email authorization using Service Layer
          const validation =
            await EmailAuthorizationService.validateEmailForAuth(user.email);

          if (!validation.isAuthorized) {
            if (!user.email) {
              throw new APIError('BAD_REQUEST', {
                message: 'Email is required',
              });
            }

            // Log unauthorized attempt
            console.warn(`Unauthorized sign-in attempt: ${user.email}`);

            throw new APIError('UNAUTHORIZED', {
              message:
                validation.message ||
                'Your email is not authorized to access this application. Please contact an administrator.',
            });
          }

          return { data: user };
        },
      },
    },
  },
});
type Session = typeof auth.$Infer.Session;
/**
 * Helper function for server components to get session
 * Compatible with Better Auth - replaces NextAuth's auth() function
 */

export async function getServerSession() {
  const { headers } = await import('next/headers');

  return auth.api.getSession({
    headers: await headers(),
  });
}

export { auth };
export type { Session };
