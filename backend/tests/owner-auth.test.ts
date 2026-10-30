import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { requireOwner } from '../src/middleware/auth.js';

describe('requireOwner', () => {
  it('rejects customer sessions', () => {
    const next = vi.fn();
    requireOwner(
      { user: { id: '1', name: 'Customer', email: 'customer@example.com', role: 'customer' } } as Request,
      {} as Response,
      next,
    );
    expect(next.mock.calls[0]?.[0]).toMatchObject({
      status: 403,
      code: 'OWNER_REQUIRED',
    });
  });

  it('allows owner sessions', () => {
    const next = vi.fn();
    requireOwner(
      { user: { id: '1', name: 'Owner', email: 'owner@example.com', role: 'owner' } } as Request,
      {} as Response,
      next,
    );
    expect(next).toHaveBeenCalledWith();
  });
});
