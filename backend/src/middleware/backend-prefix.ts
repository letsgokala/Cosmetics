import type { RequestHandler } from 'express';

const BACKEND_PREFIX = '/backend';

export const normalizeBackendPrefix: RequestHandler = (req, _res, next) => {
  const requestUrl = req.url;
  if (
    requestUrl === BACKEND_PREFIX ||
    requestUrl.startsWith(`${BACKEND_PREFIX}?`)
  ) {
    req.url = `/${requestUrl.slice(BACKEND_PREFIX.length)}`;
    req.originalUrl = req.url;
  } else if (requestUrl.startsWith(`${BACKEND_PREFIX}/`)) {
    req.url = requestUrl.slice(BACKEND_PREFIX.length);
    req.originalUrl = req.url;
  }
  next();
};
