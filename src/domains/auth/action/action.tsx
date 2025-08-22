'use server';
import prisma from '@/lib/prisma';
import { IAnalytics, User, UserRole } from '@/models/user/user';

export interface IUserAnalytics extends User {
  analytics?: IAnalytics[];
}

export const getUserConnected = async (
  email: string
): Promise<{
  user?: IUserAnalytics | undefined;
  status?: number | undefined;
}> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    const analytics = await prisma.analytics.findMany({
      where: {
        userId: user?.id as string,
      },
    });
    return {
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            role: user.role as UserRole,
            analytics: analytics.map((a) => ({
              id: a.id,
              lastLogin: a.lastLogin,
              lastMovieWatched: a.lastMovieWatched ?? undefined,
            })),
          }
        : undefined,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
    };
  }
};

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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
    return {
      status: 500,
    };
  }
};

export const updateAnalyticsLastLogin = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { status: 400 };
    }

    const analytics = await prisma.analytics.findFirst({
      where: { userId },
    });

    if (!analytics) {
      await prisma.analytics.create({
        data: {
          userId,
          lastLogin: new Date(),
        },
      });
    } else {
      await prisma.analytics.update({
        where: { id: analytics.id },
        data: {
          lastLogin: new Date(),
        },
      });
    }

    return { status: 200 };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
    };
  }
};

export const updateAnalyticsLastMovieWatched = async (
  userId: string,
  lastMovieWatched: string
): Promise<{ status?: number | undefined }> => {
  try {
    await prisma.analytics.updateMany({
      where: { userId },
      data: {
        lastMovieWatched,
      },
    });
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
    };
  }
};

export const getAllAnalytics = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        analytics: {
          some: {},
        },
      },
      include: {
        analytics: {
          orderBy: {
            lastLogin: 'desc',
          },
        },
      },
    });

    return { users, status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
};
