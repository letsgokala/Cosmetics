import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = performance.now();
  const origin = req.get('origin') ?? '-';
  const hasSessionCookie = Boolean(req.headers.cookie?.includes('glow_session='));

  console.info(
    `[http] -> ${req.method} ${req.originalUrl} origin=${origin} session=${hasSessionCookie}`,
  );

  res.on('finish', () => {
    const durationMs = Math.round(performance.now() - startedAt);
    console.info(
      `[http] <- ${req.method} ${req.originalUrl} status=${res.statusCode} duration=${durationMs}ms`,
    );
  });

  next();
};
