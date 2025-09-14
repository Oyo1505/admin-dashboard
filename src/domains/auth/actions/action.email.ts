'use server';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { User } from '@/models/user/user';

export const postAuthorizedEmail = async (
  email: string
): Promise<{ status?: number | undefined; message?: string | undefined }> => {
  try {
    if (!email?.trim()) {
      return { status: 400, message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { status: 400, message: 'Invalid email format' };
    }

    const existingUser = await prisma.authorizedEmail.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { message: 'User Already authorized', status: 409 };
    }

    await prisma.authorizedEmail.create({
      data: { email },
    });

    return { status: 200 };
  } catch (error) {
    logError(error, 'postAuthorizedEmail');
    const appError = handlePrismaError(error);
    return {
      status: appError.statusCode,
      message: appError.message,
    };
  }
};

export const getAuthorizedEmails = async (): Promise<{
  status?: number | undefined;
  mails?: User[] | undefined;
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
};

export const getAuthorizedEmailsPagination = async ({
  pageParam,
}: {
  pageParam?: number;
}): Promise<{
  status?: number | undefined;
  mails?: User[] | undefined;
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

export const deleteEmailAuthorized = async (
  email: string
): Promise<{ status?: number | undefined }> => {
  try {
    const emailDeleted = await prisma.authorizedEmail.delete({
      where: { email },
    });

    if (!emailDeleted) {
      return { status: 400 };
    }

    return { status: 200 };
  } catch (error) {
    logError(error, 'deleteEmailAuthorized');
    return {
      status: 500,
    };
  }
};
