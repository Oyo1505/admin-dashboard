import { handlePrismaError, logError } from '@/lib/errors';
import { URL_DASHBOARD_ROUTE } from '@/shared/route';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export class EmailService {
  static async sendMail({
    message,
    topic,
    emailUser,
  }: {
    message: string;
    topic: string;
    emailUser: string;
  }) {
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
  }
}
