'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OrderActions } from '@/components/order-actions';
import { getOrder } from '@/lib/api';
import { formatPrice } from '@/lib/store-config';
import type { StoreOrder } from '@/lib/types';

export default function OrderPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const query = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    getOrder(orderNumber)
      .then(({ data }) => setOrder(data))
      .catch(() =>
        router.replace(
          `/signin?next=${encodeURIComponent(`/orders/${orderNumber}`)}`,
        ),
      )
      .finally(() => setLoaded(true));
  }, [orderNumber, router]);

  if (!loaded || !order) {
    return (
      <section className="page-wrap min-h-[65vh] py-16 text-center text-sm text-ink/60">
        Loading your order…
      </section>
    );
  }

  return (
    <section className="page-wrap min-h-[65vh] py-10 sm:py-14">
      {query.get('placed') === '1' && (
        <div
          role="status"
          className="mb-8 bg-[#e9efe8] p-5 text-sm text-[#315b3b]"
        >
          Your order is in. We’ll be in touch to confirm delivery details.
        </div>
      )}
      <p className="text-[10px] uppercase tracking-[.2em] text-rose">
        Order details
      </p>
      <h1 className="font-display mt-2 text-4xl sm:text-5xl">
        {order.orderNumber}
      </h1>
      <p className="mt-3 text-sm text-ink/55">
        Placed {new Date(order.createdAt).toLocaleDateString('en-ET')} ·{' '}
        <span className="capitalize">{order.status}</span>
      </p>
      <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="font-display text-2xl">Your items</h2>
          <div className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-sand">
                  <Image
                    src={item.productImage}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p>{item.productName}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm">{formatPrice(item.lineTotal)}</p>
              </div>
            ))}
          </div>
          <OrderActions
            orderNumber={order.orderNumber}
            canCancel={order.status === 'pending'}
          />
        </div>
        <aside className="h-fit bg-[#f1ede6] p-6 sm:p-7">
          <h2 className="font-display text-2xl">Delivery & payment</h2>
          <p className="mt-5 text-sm font-medium">{order.customerName}</p>
          <p className="mt-1 text-xs text-ink/60">{order.phone}</p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink/65">
            {order.deliveryAddress}
          </p>
          {order.deliveryNote && (
            <p className="mt-3 text-xs leading-5 text-ink/55">
              Note: {order.deliveryNote}
            </p>
          )}
          <p className="mt-5 text-xs">
            Cash on delivery ·{' '}
            <span className="capitalize">payment {order.paymentStatus}</span>
          </p>
          <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </p>
            <p className="flex justify-between">
              <span>Delivery</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </p>
            <p className="flex justify-between border-t border-ink/10 pt-3 font-medium">
              <span>Total due</span>
              <span>{formatPrice(order.total)}</span>
            </p>
          </div>
        </aside>
      </div>
      <Link
        href="/account"
        className="mt-8 inline-block text-xs underline underline-offset-4 hover:text-rose"
      >
        ← Back to your account
      </Link>
    </section>
  );
}
