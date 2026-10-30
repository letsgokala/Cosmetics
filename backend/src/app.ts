import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errors.js';
import { requestLogger } from './middleware/request-logger.js';
import { productsRouter } from './products/routes.js';
import { HttpError } from './middleware/errors.js';
import { authRouter } from './auth/routes.js';
import { cartRouter } from './commerce/cart-routes.js';
import { ordersRouter } from './commerce/order-routes.js';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const openApiDocument = JSON.parse(
  readFileSync(resolve(process.cwd(), 'openapi.json'), 'utf8'),
);
openApiDocument.servers = [
  { url: env.PUBLIC_API_URL, description: 'Configured API base URL' },
];

export const app = express();
app.disable('x-powered-by');
app.use(requestLogger);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '32kb' }));
app.get('/api/openapi.json', (_req, res) => res.json(openApiDocument));
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'Glow Cosmetics API',
    swaggerOptions: { withCredentials: true, persistAuthorization: true },
  }),
);
const allowedOrigins = new Set(
  env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
);
app.use((req, _res, next) => {
  const origin = req.get('origin');
  if (
    origin &&
    ['POST', 'PATCH', 'DELETE'].includes(req.method) &&
    !allowedOrigins.has(origin)
  ) {
    next(
      new HttpError(
        403,
        'ORIGIN_NOT_ALLOWED',
        'This request origin is not allowed.',
      ),
    );
    return;
  }
  next();
});
app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api', productsRouter);
app.use((_req, _res, next) =>
  next(new HttpError(404, 'NOT_FOUND', 'Route not found.')),
);
app.use(errorHandler);
