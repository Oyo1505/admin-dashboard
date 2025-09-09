'use server';
import { handlePrismaError, logError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { User } from '@/models/user/user';
import { URL_DASHBOARD_ROUTE, URL_HOME } from '@/shared/route';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export const getUsersWithPageParam = async (
  search: string,
  pageParam: number
): Promise<{ users?: User[]; newOffset?: number | null; status: number }> => {
  try {
    if (typeof search !== 'string') {
      return { status: 400 };
    }

    if (typeof pageParam !== 'number' || pageParam <= 0) {
      return { status: 400 };
    }

    const users =
      search.trim() === ''
        ? await prisma.user.findMany({ take: pageParam })
        : await prisma.user.findMany({
            where: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            take: pageParam,
          });

    const newOffset = users.length >= 20 ? pageParam + 20 : null;
    return {
      users: users as User[],
      status: 200,
      newOffset: newOffset,
    };
  } catch (error) {
    logError(error, 'getUsersWithPageParam');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const deleteUserByIdFromUser = async (
  id: string
): Promise<{ status: number; message?: string }> => {
  if (!id) {
    return {
      status: 400,
      message: 'User ID is required',
    };
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath(URL_HOME);
    return { status: 200, message: 'User deleted successfully' };
  } catch (error) {
    logError(error, 'deleteUserByIdFromUser');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};

export const deleteUserById = async ({
  id,
  user,
  token,
}: {
  id: string;
  user: User;
  token: unknown;
}): Promise<{ status: number; message?: string }> => {
  try {
    if (!id?.trim()) {
      return { status: 400, message: 'User ID is required' };
    }

    if (!token) {
      return { status: 401, message: 'Token is required' };
    }

    if (!user || user.role !== 'ADMIN') {
      return { status: 403, message: 'Unauthorized' };
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return { status: 404, message: 'User not found' };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath(URL_DASHBOARD_ROUTE.users);
    return { status: 200, message: 'User deleted successfully' };
  } catch (error) {
    logError(error, 'deleteUserById');
    const appError = handlePrismaError(error);
    return {
      status: appError.statusCode,
      message: appError.message,
    };
  }
};

export const sendEmail = async ({
  message,
  topic,
  emailUser,
}: {
  message: string;
  topic: string;
  emailUser: string;
}): Promise<{ status: number }> => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.EMAIL_GMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: emailUser,
      to: process.env.EMAIL_GMAIL,
      subject: topic,
      text: `
      Message: ${message}
      Email: ${emailUser}
      `,
    };
    const result = await transporter.sendMail(mailOptions);
    revalidatePath(URL_DASHBOARD_ROUTE.suggestion);
    return { status: result.accepted.length > 0 ? 200 : 500 };
  } catch (error) {
    logError(error, 'sendEmail');
    const appError = handlePrismaError(error);
    return { status: appError.statusCode };
  }
};
