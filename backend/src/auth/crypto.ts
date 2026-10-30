import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const COOKIE_NAME = 'glow_session';

export type SessionUser = { id: string; name: string; email: string };

async function derive(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      64,
      { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const key = await derive(password, salt);
  return `scrypt$${salt}$${key.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, encodedKey] = stored.split('$');
  if (algorithm !== 'scrypt' || !salt || !encodedKey) return false;
  const expected = Buffer.from(encodedKey, 'base64url');
  const actual = await derive(password, salt);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function sign(payload: string) {
  return createHmac('sha256', env.SESSION_SECRET)
    .update(payload)
    .digest('base64url');
}

export function createSession(user: SessionUser) {
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSession(token: string): SessionUser | null {
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  )
    return null;
  try {
    const session = JSON.parse(
      Buffer.from(payload, 'base64url').toString(),
    ) as SessionUser & { exp?: number };
    if (!session.id || !session.email || !session.name) return null;
    if (!session.exp || session.exp <= Math.floor(Date.now() / 1000))
      return null;
    return { id: session.id, name: session.name, email: session.email };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
  };
}

export { COOKIE_NAME };
