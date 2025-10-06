import { getAuthorizedEmails } from '@/domains/auth/actions/action.email';
import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { logError } from './errors';
import prisma from './prisma';

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {},
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 * 60,
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
          if (!user.email) {
            throw new APIError('BAD_REQUEST', {
              message: 'Email is required',
            });
          }

          try {
            const { mails, status } = await getAuthorizedEmails();
            if (status !== 200 || !mails) {
              logError({}, 'Failed to fetch authorized emails');
              throw new APIError('INTERNAL_SERVER_ERROR', {
                message: 'Authorization check failed',
              });
            }

            const isAuthorized = mails.some(
              (item) => item.email === user.email
            );
            if (!isAuthorized) {
              console.warn(`Unauthorized sign-in attempt: ${user.email}`);
              throw new APIError('UNAUTHORIZED', {
                message:
                  'Your email is not authorized to access this application. Please contact an administrator.',
              });
            }

            return { data: user };
          } catch (error) {
            logError(error, 'Better Auth email authorization');
            throw new APIError('INTERNAL_SERVER_ERROR', {
              message: 'Authorization check failed',
            });
          }
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
