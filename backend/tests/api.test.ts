import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

const { prisma } = vi.hoisted(() => ({
  prisma: {
    product: { findFirst: vi.fn() },
    category: { findUnique: vi.fn() },
  },
}));

vi.mock('../src/db.js', () => ({ prisma }));

import { app } from '../src/app.js';

describe('API', () => {
  it('reports healthy status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
  });

  it('protects owner dashboard routes', async () => {
    const response = await request(app).get('/api/owner/dashboard');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('serves the health endpoint through the AletCloud backend prefix', async () => {
    const response = await request(app).get('/backend/api/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
  });

  it('rejects malformed product slugs', async () => {
    const response = await request(app).get('/api/products/Not%20A%20Slug');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects pagination beyond the maximum page size', async () => {
    const response = await request(app).get('/api/products?limit=51');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns a structured 404 when the product does not exist', async () => {
    prisma.product.findFirst.mockResolvedValue(null);
    const response = await request(app).get('/api/products/not-a-product');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });
});
