import { PrismaClient } from "@prisma/client";

// One client per server process; in development, reuse it across hot reloads.
export const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
