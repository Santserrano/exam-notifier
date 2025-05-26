/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client/index.js";

declare global {
  var prisma: PrismaClient | undefined;
}

if (!global.prisma) {
  global.prisma = new PrismaClient();
}

export const prisma = global.prisma;

export type { PrismaClient } from "@prisma/client/index.js";
