'use server';
import prisma from '@/lib/prisma';
import { User } from '@/models/user/user';

export const postAuthorizedEmail = async (
  email: string
): Promise<{ status?: number | undefined; message?: string | undefined }> => {
  try {
    const user = await prisma.authorizedEmail.findUnique({
      where: { email },
    });
    if (!user) {
      await prisma.authorizedEmail.create({
        data: {
          email: email,
        },
      });

      return { status: 200 };
    }
    return { message: 'User Already authorized', status: 409 };
  } catch (error) {
    console.error(
      'Auth action error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return {
      status: 500,
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
    console.error(
      'Auth action error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
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
    console.error(
      'Auth action error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
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
    console.error(
      'Auth action error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return {
      status: 500,
    };
  }
};
