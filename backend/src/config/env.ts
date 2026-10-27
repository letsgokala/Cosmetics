import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_PORT: z.coerce
  .number()
  .int()
  .min(1)
  .max(65535)
  .default(Number(process.env.PORT) || 4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  PUBLIC_API_URL: z.string().url().default('http://localhost:4000/api'),
  DATABASE_URL: z.string().url().optional(),
  SESSION_SECRET: z
    .string()
    .min(32)
    .default('local-development-only-glow-secret-change-before-deploy'),
});

export const env = schema.parse(process.env);
if (env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production.');
}
