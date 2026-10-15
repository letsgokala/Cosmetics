import { cookies } from 'next/headers';

const apiBase =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:4000/api';

export async function serverApi<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  if (!cookieStore.get('glow_session')) return null;
  const response = await fetch(`${apiBase}${path}`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
  }).catch(() => null);
  if (!response?.ok) return null;
  const body = (await response.json()) as { data: T };
  return body.data;
}
