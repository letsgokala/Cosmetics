import type { RequestHandler } from 'express';
import { COOKIE_NAME, readSession } from '../auth/crypto.js';
import { HttpError } from './errors.js';

export const requireUser: RequestHandler = (req, _res, next) => {
  const cookieHeader = req.headers.cookie ?? '';
  const sessionCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
  const token = sessionCookie?.slice(COOKIE_NAME.length + 1);
  const user = token ? readSession(decodeURIComponent(token)) : null;
  if (!user) {
    next(new HttpError(401, 'UNAUTHENTICATED', 'Sign in to continue.'));
    return;
  }
  req.user = user;
  next();
};
