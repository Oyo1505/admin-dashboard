'use server';
import prisma from '@/lib/prisma';

export const updateAnalyticsLastLogin = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { status: 400 };
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
    await prisma.analyticsUser.updateMany({
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
    console.log(error);
    return { status: 500 };
  }
};

export const getAnalyticsApplicationVisits = async () => {
  try {
    const analytics = await prisma.analyticsApplication.findFirst();
    return { visits: analytics?.visits, status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
};
