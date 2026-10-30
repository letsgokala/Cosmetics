import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './db.js';

const server = app.listen(env.API_PORT, '0.0.0.0', () =>
  console.info(`Sahle Cosmetics API listening on port ${env.API_PORT}`),
);
async function shutdown() {
  server.close();
  await prisma.$disconnect();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
