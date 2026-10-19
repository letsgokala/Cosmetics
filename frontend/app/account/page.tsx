import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/store-config';
import { serverApi } from '@/lib/server-api';
import type { Account, StoreOrder } from '@/lib/types';

export const metadata: Metadata = { title: 'My account' };

export default async function AccountPage() {
  const [account, orders] = await Promise.all([
    serverApi<{ user: Account }>('/auth/me'),
    serverApi<StoreOrder[]>('/orders'),
  ]);
  if (!account || !orders) redirect('/signin?next=%2Faccount');

  return (
    <section className="page-wrap min-h-[65vh] py-10 sm:py-14">
      <p className="text-[10px] uppercase tracking-[.2em] text-rose">
        Your Glow account
      </p>
      <h1 className="font-display mt-2 text-4xl sm:text-5xl">
        Hello, {account.user.name.split(' ')[0]}.
      </h1>
      <p className="mt-3 text-sm text-ink/55">{account.user.email}</p>
      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Your orders</h2>
        <Link
          href="/catalog"
          className="text-xs underline underline-offset-4 hover:text-rose"
        >
          Shop the collection
        </Link>
      </div>
      {orders.length ? (
        <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${encodeURIComponent(order.orderNumber)}`}
              className="grid gap-2 py-5 transition-colors hover:text-rose sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8"
            >
              <div>
                <p className="text-sm font-medium">{order.orderNumber}</p>
                <p className="mt-1 text-xs text-ink/50">
                  {new Date(order.createdAt).toLocaleDateString('en-ET')}
                </p>
              </div>
              <span className="text-xs capitalize">{order.status}</span>
              <span className="text-sm">{formatPrice(order.total)}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 bg-[#f1ede6] px-6 py-12 text-center">
          <p className="font-display text-2xl">No orders yet.</p>
          <p className="mt-2 text-sm text-ink/55">
            Your next favorite is waiting in the shop.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm text-cream hover:bg-rose"
          >
            Explore the shop
          </Link>
        </div>
      )}
    </section>
  );
}
