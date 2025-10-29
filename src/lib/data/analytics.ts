import { cache } from 'react';
import 'server-only';
import { handlePrismaError, logError } from '../errors';
import prisma from '../prisma';
import { IUserAnalytics } from './users';

export class AnalyticsData {
  static getAnalyticsApplicationVisits = cache(async () => {
    try {
      const analytics = await prisma.analyticsApplication.findFirst();
      return { visits: analytics?.visits ?? 0, status: 200 };
    } catch (error) {
      logError(error, 'getAnalyticsApplicationVisits');
      const appError = handlePrismaError(error);
      return { visits: 0, status: appError.statusCode };
    }
  });

  static getAnalyticsUser = cache(
    async (
      user: IUserAnalytics
    ): Promise<{
      analytics?: {
        id: string;
        lastLogin: Date;
        lastMovieWatched: string | null;
        visits: number;
      }[];
      status: number;
    }> => {
      try {
        const analytics = await prisma.analyticsUser.findMany({
          where: {
            userId: user.id,
          },
        });
        if (analytics) return { analytics, status: 200 };
        return { analytics: undefined, status: 200 };
      } catch (error) {
        logError(error, 'getAnalyticsUser');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
}
