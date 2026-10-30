import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { hashPassword } from '../src/auth/crypto.js';

const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
const password = process.env.OWNER_PASSWORD;
const name = process.env.OWNER_NAME?.trim() || 'Sahle Owner';

if (!email || !password) {
  throw new Error('OWNER_EMAIL and OWNER_PASSWORD must be set.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
});

try {
  const passwordHash = await hashPassword(password);
  const owner = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: 'owner' },
    create: { name, email, passwordHash, role: 'owner', cart: { create: {} } },
    select: { email: true, role: true },
  });
  console.info(`Owner account ready: ${owner.email} (${owner.role}).`);
} finally {
  await prisma.$disconnect();
}
