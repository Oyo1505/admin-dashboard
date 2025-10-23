import prisma from '@/lib/prisma';

export async function GET(): Promise<Response> {
  try {
    const analytics = await prisma.analyticsApplication.findFirst();
    return Response.json({ visits: analytics?.visits ?? 0 }, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
