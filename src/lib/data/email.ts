import HttpStatus from '@/shared/constants/httpStatus';
import { cache } from 'react';
import 'server-only';
import { logError } from '../errors';
import prisma from '../prisma';

export class EmailData {
  static getAuthorizedEmails = cache(
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
          return { status: HttpStatus.BAD_REQUEST };
        }

        return {
          mails: userauthorizedEmails,
          status: HttpStatus.OK,
        };
      } catch (error) {
        logError(error, 'getAuthorizedEmails');
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      }
    }
  );

  static async getAuthorizedEmailsPagination({
    pageParam,
  }: {
    pageParam?: number;
  }): Promise<{
    status?: number | undefined;
    mails?: { id: string; email: string | null }[] | undefined;
    prevCursor?: string | undefined;
    nextCursor?: string | undefined;
    total?: number | undefined;
  }> {
    try {
      const userauthorizedEmails = await prisma.authorizedEmail.findMany({
        orderBy: {
          email: 'asc',
        },
        skip: pageParam,
        take: 5,
      });

      if (!userauthorizedEmails) {
        return { status: HttpStatus.BAD_REQUEST };
      }

      return {
        mails: userauthorizedEmails,
        status: HttpStatus.OK,
      };
    } catch (error) {
      logError(error, 'getAuthorizedEmailsPagination');
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
