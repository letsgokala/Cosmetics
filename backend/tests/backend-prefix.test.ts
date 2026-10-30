import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { normalizeBackendPrefix } from '../src/middleware/backend-prefix.js';

function normalize(url: string) {
  const request = { url, originalUrl: url } as Request;
  normalizeBackendPrefix(request, {} as Response, vi.fn());
  return { url: request.url, originalUrl: request.originalUrl };
}

describe('normalizeBackendPrefix', () => {
  it.each([
    ['/backend/api/health', '/api/health'],
    ['/backend/api/products?limit=8', '/api/products?limit=8'],
    ['/backend', '/'],
    ['/backend?check=1', '/?check=1'],
    ['/api/products', '/api/products'],
    ['/catalog/backend/api/products', '/catalog/backend/api/products'],
    ['/backend-api/products', '/backend-api/products'],
  ])('normalizes %s as %s', (url, expected) => {
    expect(normalize(url)).toEqual({
      url: expected,
      originalUrl: expected,
    });
  });
});
