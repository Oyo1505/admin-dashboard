import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '../../prisma/src/generated/client';

declare global {
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || (new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient);

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
