import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaSqlite } from "prisma-adapter-sqlite";
import pg from "pg";

const { Pool } = pg;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const isPostgres =
  process.env.DATABASE_URL.startsWith("postgres://") ||
  process.env.DATABASE_URL.startsWith("postgresql://");

const client = isPostgres
  ? new PrismaClient({
      adapter: new PrismaPg(
        new Pool({
          connectionString: process.env.DATABASE_URL,
        }),
      ),
    })
  : new PrismaClient({
      adapter: new PrismaSqlite({
        url: process.env.DATABASE_URL,
      }),
    });

export const prisma = globalForPrisma.prisma ?? client;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
