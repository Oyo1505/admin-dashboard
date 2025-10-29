import { cache } from 'react';
import 'server-only';
import { handlePrismaError, logError } from '../errors';
import prisma from '../prisma';

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
}
