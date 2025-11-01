'use server';

import { getServerSession } from '@/lib/auth';
import { SelectUser } from '@/lib/db';
import prisma from '@/lib/prisma';
import { cache } from 'react';
import { DALError } from './errors';

export async function verifySession() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    throw new DALError('UNAUTHORIZED', 'No active session');
  }

  return session;
}

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
export async function verifyAdmin(): Promise<SelectUser> {
  const user = await getCurrentUser();

  if (user.role !== 'ADMIN') {
    throw new DALError('FORBIDDEN', 'Admin privileges required');
  }

  return user;
}
export async function verifyOwnership(
  resourceUserId: string
): Promise<SelectUser> {
  const user = await getCurrentUser();

  if (user.id !== resourceUserId && user.role !== 'ADMIN') {
    throw new DALError('FORBIDDEN', 'Access to resource denied');
  }

  return user;
}
