import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXTAUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const signInGoole = () =>
  signIn.social({
    provider: 'google',
    callbackURL: '/home',
  });
