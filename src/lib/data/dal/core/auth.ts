'use server';

import { getServerSession } from '@/lib/auth';
import { SelectUser } from '@/lib/db';
import prisma from '@/lib/prisma';
import { cache } from 'react';
import { DALError } from './errors';

/**
 * Vérifie qu'une session existe et retourne le user
 * @throws DALError si pas de session
 */
export async function verifySession() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new DALError('UNAUTHORIZED', 'No active session');
  }

  return session;
}

/**
 * Cached helper to get current user from database
 * Using React cache() prevents duplicate queries within the same request
 * This discourages passing user data from Server Component to Server Component
 * which minimizes risk of passing it to a Client Component
 */
export const getCurrentUser = cache(async (): Promise<SelectUser> => {
  const session = await verifySession();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
    },
  });

  if (!user) {
    throw new DALError('NOT_FOUND', 'User not found in database');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image ?? undefined,
    role: user.role as 'USER' | 'ADMIN',
  };
});

/**
 * Vérifie que l'user connecté est ADMIN
 * @throws DALError si pas admin
 */
export async function verifyAdmin(): Promise<SelectUser> {
  const user = await getCurrentUser();

  if (user.role !== 'ADMIN') {
    // Log unauthorized admin access attempts for security audit
    console.warn(
      `Unauthorized admin access attempt by user ${user.id} (${user.email})`
    );
    throw new DALError('FORBIDDEN', 'Admin privileges required');
  }

  return user;
}

/**
 * Vérifie que l'user connecté est le propriétaire des données
 * @throws DALError si pas le propriétaire (sauf si ADMIN)
 */
export async function verifyOwnership(
  resourceUserId: string
): Promise<SelectUser> {
  const user = await getCurrentUser();

  if (user.id !== resourceUserId && user.role !== 'ADMIN') {
    // Log unauthorized resource access attempts for security audit
    console.warn(
      `Unauthorized resource access attempt by user ${user.id} to resource owned by ${resourceUserId}`
    );
    throw new DALError('FORBIDDEN', 'Access to resource denied');
  }

  return user;
}
