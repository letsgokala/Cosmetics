import type { Category, Product, ProductResponse } from './types';

const apiBase =
  typeof window === 'undefined'
    ? (process.env.API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      'http://localhost:4000/api')
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api');

export class ApiError extends Error {
  constructor(public status: number) {
    super(`The store API returned ${status}.`);
  }
}

async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, { cache: 'no-store' });
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}
export const getCategories = () => api<{ data: Category[] }>('/categories');
export const getFeaturedProducts = () =>
  api<ProductResponse>('/products/featured?limit=4');
export const getProducts = (query: URLSearchParams) =>
  api<ProductResponse>(`/products?${query.toString()}`);
export const getProduct = (slug: string) =>
  api<{ data: Product }>(`/products/${encodeURIComponent(slug)}`);
