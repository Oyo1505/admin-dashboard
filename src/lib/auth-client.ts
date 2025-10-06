import { createAuthClient } from 'better-auth/react';

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXTAUTH_URL,
});
