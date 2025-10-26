import { logError } from '@/lib/errors';
import prisma from '@/lib/prisma';

export async function GET(): Promise<Response> {
  try {
    const analytics = await prisma.analyticsApplication.findFirst();
    return Response.json({ visits: analytics?.visits ?? 0 }, { status: 200 });
  } catch (error) {
    logError(error, 'get-analytics-application-visits error');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
