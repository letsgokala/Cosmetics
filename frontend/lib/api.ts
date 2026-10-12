import type { Category, Product, ProductResponse } from './types';
import type { Account, Cart, StoreOrder } from './types';

const apiBase =
  typeof window === 'undefined'
    ? (process.env.API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      'http://localhost:4000/api')
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api');

export class ApiError extends Error {
  constructor(
    public status: number,
    message = `The store API returned ${status}.`,
  ) {
    super(message);
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

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('content-type', 'application/json');
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });
  const body = (await response.json().catch(() => null)) as {
    data?: T;
    error?: { message?: string };
  } | null;
  if (!response.ok)
    throw new ApiError(
      response.status,
      body?.error?.message ?? `The store API returned ${response.status}.`,
    );
  return body as { data: T };
}

export const signIn = (email: string, password: string) =>
  apiRequest<{ user: Account }>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
export const signUp = (name: string, email: string, password: string) =>
  apiRequest<{ user: Account }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
export const signOut = () =>
  apiRequest<{ signedOut: boolean }>('/auth/signout', { method: 'POST' });
export const getCurrentAccount = () =>
  apiRequest<{ user: Account }>('/auth/me');
export const getCart = () => apiRequest<Cart>('/cart');
export const addCartItem = (productId: string, quantity = 1) =>
  apiRequest<Cart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
export const updateCartItem = (productId: string, quantity: number) =>
  apiRequest<Cart>(`/cart/items/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
export const removeCartItem = (productId: string) =>
  apiRequest<Cart>(`/cart/items/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
export const submitOrder = (input: {
  phone: string;
  deliveryAddress: string;
  deliveryNote?: string;
}) =>
  apiRequest<StoreOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
export const getOrders = () => apiRequest<StoreOrder[]>('/orders');
export const getOrder = (orderNumber: string) =>
  apiRequest<StoreOrder>(`/orders/${encodeURIComponent(orderNumber)}`);
export const cancelOrder = (orderNumber: string) =>
  apiRequest<StoreOrder>(`/orders/${encodeURIComponent(orderNumber)}/cancel`, {
    method: 'POST',
  });
