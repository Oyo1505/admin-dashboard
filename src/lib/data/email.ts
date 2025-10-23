import { cache } from 'react';
import 'server-only';
import { logError } from '../errors';
import prisma from '../prisma';

export const getAuthorizedEmails = cache(
  async (): Promise<{
    status?: number | undefined;
    mails?: { id: string; email: string | null }[] | undefined;
    prevCursor?: string | undefined;
    nextCursor?: string | undefined;
    total?: number | undefined;
  }> => {
    try {
      const userauthorizedEmails = await prisma.authorizedEmail.findMany({
        orderBy: {
          email: 'asc',
        },
      });

      if (!userauthorizedEmails) {
        return { status: 400 };
      }

      return {
        mails: userauthorizedEmails,
        status: 200,
      };
    } catch (error) {
      logError(error, 'getAuthorizedEmails');
      return {
        status: 500,
      };
    }
  }
);

export const getAuthorizedEmailsPagination = async ({
  pageParam,
}: {
  pageParam?: number;
}): Promise<{
  status?: number | undefined;
  mails?: { id: string; email: string | null }[] | undefined;
  prevCursor?: string | undefined;
  nextCursor?: string | undefined;
  total?: number | undefined;
}> => {
  try {
    const userauthorizedEmails = await prisma.authorizedEmail.findMany({
      orderBy: {
        email: 'asc',
      },
      skip: pageParam,
      take: 5,
    });

    if (!userauthorizedEmails) {
      return { status: 400 };
    }

    return {
      mails: userauthorizedEmails,
      status: 200,
    };
  } catch (error) {
    logError(error, 'getAuthorizedEmailsPagination');
    return {
      status: 500,
    };
  }
};
