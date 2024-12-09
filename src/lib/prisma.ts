import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate'

declare global {
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || (new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient);

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
