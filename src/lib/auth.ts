import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import authConfig from './auth.config';
import NextAuth, { User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { getAuthorizedEmails } from '@/domains/auth/actions/action.email';
import {
  updateAnalyticsApplicationVisits,
  updateAnalyticsLastLogin,
} from '@/domains/auth/actions/action.analytics';

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days (plus sécurisé)
    updateAge: 60 * 60, // 1 hour (réduit les requêtes)
  },
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user?.email) return false;

        const { mails, status } = await getAuthorizedEmails();

        if (status !== 200 || !mails) {
          console.error('Failed to fetch authorized emails');
          return false;
        }

        const usersEmail = mails.map((item) => item.email);

        if (!usersEmail.includes(user.email)) {
          console.warn(`Unauthorized sign-in attempt: ${user.email}`);
          return false;
        }

        // Update analytics in background
        if (user.id) {
          updateAnalyticsLastLogin(user.id).catch(console.error);
        }
        updateAnalyticsApplicationVisits().catch(console.error);

        return true;
      } catch (error) {
        console.error('Sign-in error:', error);
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      if (account) {
        // First login, save the `access_token`, `refresh_token`, and other
        // details into the JWT

        const userProfile: User = {
          id: token.sub,
          name: profile?.name,
          email: profile?.email,
          image: token?.picture,
        };

        return {
          id_token: account.id_token,
          access_token: account.access_token,
          expires_at:
            Math.floor(Date.now() / 1000) + (account.expires_in || 60 * 60),
          refresh_token: account.refresh_token,
          user: userProfile,
        };
      } else if (
        token.expires_at &&
        Date.now() < Number(token.expires_at) * 1000
      ) {
        // Subsequent logins, if the `access_token` is still valid, return the JWT

        return token;
      } else {
        // Subsequent logins, if the `access_token` has expired, try to refresh it
        if (!token.access_token) throw new Error('Missing refresh token');

        try {
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: 'refresh_token',
              refresh_token: token.refresh_token! as string,
            }),
          });

          const tokensOrError = await response.json();

          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          token.access_token = newTokens.access_token;
          token.expires_at = Math.floor(
            Date.now() / 1000 + newTokens.expires_in
          );
          // Some providers only issue refresh tokens once, so preserve if we did not get a new one
          if (newTokens.refresh_token)
            token.refresh_token = newTokens.refresh_token;
          return token;
        } catch (error) {
          console.error(
            'Error refreshing access_token:',
            error instanceof Error ? error.message : 'Unknown error'
          );
          // If we fail to refresh the token, return an error so we can handle it on the page
          token.error = 'RefreshTokenError';
          return token;
        }
      }
    },
    async redirect({ url }) {
      return process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL}/home`
        : url;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      session.accessToken = token.access_token;
      session.idToken = token.id_token;
      session.refreshToken = token.refresh_token;
      session.error = token.error;
      session.expiresAt = token.expires_at;
      session.user = token.user;

      return session;
    },
  },
});
