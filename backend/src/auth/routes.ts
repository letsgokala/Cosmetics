import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../middleware/errors.js';
import { requireUser } from '../middleware/auth.js';
import {
  COOKIE_NAME,
  createSession,
  hashPassword,
  sessionCookieOptions,
  verifyPassword,
} from './crypto.js';

const signUpSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});
const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});
const publicUser = (user: { id: string; name: string; email: string }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
  const input = signUpSchema.parse(req.body);
  const { name, email, password } = input;
  const passwordHash = await hashPassword(password);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        cart: { create: {} },
      },
      select: { id: true, name: true, email: true },
    });
    res.cookie(COOKIE_NAME, createSession(user), sessionCookieOptions());
    res.status(201).json({ data: { user } });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new HttpError(
        409,
        'EMAIL_IN_USE',
        'An account with this email already exists.',
      );
    }
    throw error;
  }
});

authRouter.post('/signin', async (req, res) => {
  const input = signInSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash)))
    throw new HttpError(
      401,
      'INVALID_CREDENTIALS',
      'Email or password is incorrect.',
    );
  const account = publicUser(user);
  res.cookie(COOKIE_NAME, createSession(account), sessionCookieOptions());
  res.json({ data: { user: account } });
});

authRouter.post('/signout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, sessionCookieOptions());
  res.json({ data: { signedOut: true } });
});

authRouter.get('/me', requireUser, (req, res) => {
  res.json({ data: { user: req.user } });
});
