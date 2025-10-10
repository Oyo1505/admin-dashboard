'use server';
import { validateId } from '@/lib/api-wrapper';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';

export const updateAnalyticsLastLogin = async (userId: string) => {
  try {
    validateId(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { status: 404 };
    }

    const analytics = await prisma.analyticsUser.findFirst({
      where: { userId },
    });

    if (!analytics) {
      await prisma.analyticsUser.create({
        data: {
          userId,
          lastLogin: new Date(),
          visits: 1,
        },
      });
    } else {
      await prisma.analyticsUser.update({
        where: { id: analytics.id },
        data: {
          lastLogin: new Date(),
          visits: { increment: 1 },
        },
      });
    }

    return { status: 200 };
  } catch (error) {
    logError(error, 'updateAnalyticsLastLogin');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const updateAnalyticsLastMovieWatched = async (
  userId: string,
  lastMovieWatched: string
): Promise<{ status?: number | undefined }> => {
  try {
    await prisma.analyticsUser.updateMany({
      where: { userId },
      data: {
        lastMovieWatched,
      },
    });
    return { status: 200 };
  } catch (error) {
    logError(error, 'updateAnalyticsLastMovieWatched');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const updateAnalyticsApplicationVisits = async () => {
  try {
    const analytics = await prisma.analyticsApplication.findFirst();
    if (!analytics) {
      await prisma.analyticsApplication.create({
        data: {
          visits: 1,
        },
      });
    }
    await prisma.analyticsApplication.update({
      where: { id: analytics?.id },
      data: {
        visits: { increment: 1 },
      },
    });
    return { visits: analytics?.visits, status: 200 };
  } catch (error) {
    logError(error, 'updateAnalyticsApplicationVisits');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const getAnalyticsApplicationVisits = async () => {
  try {
    const analytics = await prisma.analyticsApplication.findFirst();
    return { visits: analytics?.visits ?? 0, status: 200 };
  } catch (error) {
    logError(error, 'getAnalyticsApplicationVisits');
    const appError = handlePrismaError(error);
    return { visits: 0, status: appError.statusCode };
  }
};
