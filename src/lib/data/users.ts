import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { IAnalytics, User } from '@/models/user/user';
import { cache } from 'react';
import 'server-only';
import { AnalyticsData } from './analytics';

export interface IUserAnalytics extends User {
  analytics?: IAnalytics[];
}

export class UserData {
  static findUnique = cache(
    async (
      email: string
    ): Promise<{
      user?: IUserAnalytics | undefined;
      status?: number | undefined;
    }> => {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (user) return { user, status: 200 };
        return { user: undefined, status: 200 };
      } catch (error) {
        logError(error, 'findUnique');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
  static getUserConnected = cache(
    async (
      email: string
    ): Promise<{
      user?: IUserAnalytics | undefined;
      status?: number | undefined;
    }> => {
      try {
        if (!email?.trim()) {
          return { status: 400 };
        }

        const { user } = await UserData.findUnique(email);

        if (!user) {
          return { status: 404 };
        }

        const { analytics } = await AnalyticsData.getAnalyticsUser(user);

        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            role: user.role,
            analytics: analytics?.map((a) => ({
              id: a.id,
              lastLogin: a.lastLogin,
              lastMovieWatched: a.lastMovieWatched ?? undefined,
            })),
          },
          status: 200,
        };
      } catch (error) {
        logError(error, 'getUserConnected');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );

  static getAllAnalyticsUser = cache(
    async (): Promise<{
      users?: IUserAnalytics[] | undefined;
      status?: number | undefined;
    }> => {
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

        const transformedUsers: IUserAnalytics[] = users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          role: user.role,
          analytics: user.analytics.map((analytic) => ({
            id: analytic.id,
            lastLogin: analytic.lastLogin,
            lastMovieWatched: analytic.lastMovieWatched ?? undefined,
            visits: analytic.visits,
          })),
        }));

        return { users: transformedUsers, status: 200 };
      } catch (error) {
        logError(error, 'getAllAnalyticsUser');
        const appError = handlePrismaError(error);
        return { status: appError.statusCode };
      }
    }
  );
}
