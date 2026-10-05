import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';
import { env } from './config/env.js';

const adapter = new PrismaPg({
  connectionString:
    env.DATABASE_URL ?? 'postgresql://localhost:5432/glow_cosmetics',
});

export const prisma = new PrismaClient({ adapter });
