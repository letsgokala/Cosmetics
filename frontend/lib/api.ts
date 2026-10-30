import type { Category, Product, ProductResponse } from './types';
import type { Account, Cart, OwnerDashboard, StoreOrder } from './types';

const productionApiTarget =
  process.env.API_PROXY_TARGET ??
  'https://cosmeticsbackend.app.aletcloud.com/backend/api';
const configuredApiBase =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
const apiBase =
  typeof window === 'undefined'
    ? configuredApiBase?.startsWith('/')
      ? productionApiTarget
      : (configuredApiBase ?? 'http://localhost:4000/api')
    : (configuredApiBase ??
      (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
        ? 'http://localhost:4000/api'
        : '/backend-api'));

function logRequest(
  phase: 'start' | 'success' | 'error',
  method: string,
  path: string,
  details: Record<string, unknown> = {},
) {
  if (typeof window === 'undefined') return;
  const message = `[api] ${phase} ${method} ${apiBase}${path}`;
  if (phase === 'error') console.warn(message, details);
  else console.info(message, details);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message = `The store API returned ${status}.`,
  ) {
    super(message);
  }
}

async function api<T>(path: string): Promise<T> {
  const startedAt = performance.now();
  logRequest('start', 'GET', path);
  try {
    const response = await fetch(`${apiBase}${path}`, {
      cache: 'no-store',
    });
    const durationMs = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      logRequest('error', 'GET', path, {
        status: response.status,
        durationMs,
      });
      throw new ApiError(response.status);
    }
    logRequest('success', 'GET', path, {
      status: response.status,
      durationMs,
    });
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logRequest('error', 'GET', path, {
      durationMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
export const getCategories = () => api<{ data: Category[] }>('/categories');
export const getFeaturedProducts = () =>
  api<ProductResponse>('/products/featured?limit=4');
export const getProducts = (query: URLSearchParams) =>
  api<ProductResponse>(`/products?${query.toString()}`);
export const getProduct = (slug: string) =>
  api<{ data: Product }>(`/products/${encodeURIComponent(slug)}`);

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const method = init.method ?? 'GET';
  const startedAt = performance.now();
  const headers = new Headers(init.headers);
  if (init.body) headers.set('content-type', 'application/json');
  logRequest('start', method, path, { credentials: 'include' });
  try {
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
    const durationMs = Math.round(performance.now() - startedAt);
    if (!response.ok) {
      const message =
        body?.error?.message ?? `The store API returned ${response.status}.`;
      logRequest('error', method, path, {
        status: response.status,
        durationMs,
        message,
      });
      throw new ApiError(response.status, message);
    }
    logRequest('success', method, path, {
      status: response.status,
      durationMs,
    });
    return body as { data: T };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logRequest('error', method, path, {
      durationMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
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
export const getOwnerDashboard = () =>
  apiRequest<OwnerDashboard>('/owner/dashboard');
export const getOwnerOrders = (status?: string) =>
  apiRequest<StoreOrder[]>(
    `/owner/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`,
  );
export const updateOwnerOrderStatus = (
  orderNumber: string,
  status: string,
) =>
  apiRequest<StoreOrder>(
    `/owner/orders/${encodeURIComponent(orderNumber)}/status`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
  );
