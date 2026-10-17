'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { submitOrder } from '@/lib/api';
import { formatPrice } from '@/lib/store-config';
import type { Cart } from '@/lib/types';

export function CheckoutForm({ cart, name }: { cart: Cart; name: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const unavailable = cart.items.some(
    (item) => !item.active || item.quantity > item.stock,
  );

  async function place(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPlacing(true);
    const form = new FormData(event.currentTarget);
    try {
      const { data } = await submitOrder({
        phone: String(form.get('phone') ?? '').trim(),
        deliveryAddress: String(form.get('deliveryAddress') ?? '').trim(),
        deliveryNote:
          String(form.get('deliveryNote') ?? '').trim() || undefined,
      });
      router.push(`/orders/${encodeURIComponent(data.orderNumber)}?placed=1`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Your order could not be placed. Please try again.',
      );
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={place} className="grid content-start gap-5">
        <div>
          <h2 className="font-display text-2xl">Delivery details</h2>
          <p className="mt-2 text-sm text-ink/55">
            We’ll use your account name, {name}, for this order.
          </p>
        </div>
        <label className="grid gap-2 text-sm">
          Phone number
          <input
            name="phone"
            type="tel"
            required
            minLength={7}
            maxLength={32}
            autoComplete="tel"
            placeholder="+251 9…"
            className="rounded-sm border border-ink/15 bg-white px-4 py-3 outline-none focus:border-rose"
          />
        </label>
        <label className="grid gap-2 text-sm">
          Delivery address
          <textarea
            name="deliveryAddress"
            required
            minLength={10}
            maxLength={500}
            rows={3}
            autoComplete="street-address"
            placeholder="Area, street, building and any helpful directions"
            className="resize-y rounded-sm border border-ink/15 bg-white px-4 py-3 outline-none focus:border-rose"
          />
        </label>
        <label className="grid gap-2 text-sm">
          Delivery note <span className="text-xs text-ink/45">Optional</span>
          <textarea
            name="deliveryNote"
            maxLength={500}
            rows={2}
            placeholder="Anything else the delivery team should know?"
            className="resize-y rounded-sm border border-ink/15 bg-white px-4 py-3 outline-none focus:border-rose"
          />
        </label>
        <div className="rounded-sm border border-ink/10 bg-white p-4">
          <p className="text-sm font-medium">Cash on delivery</p>
          <p className="mt-1 text-xs leading-5 text-ink/55">
            Pay in cash when your order arrives. Online card payments are not
            enabled.
          </p>
        </div>
        {unavailable && (
          <p role="alert" className="text-sm text-rose">
            One or more items are unavailable or have changed stock. Return to
            your bag to update it.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-rose">
            {error}
          </p>
        )}
        <button
          disabled={placing || unavailable}
          className="rounded-full bg-ink px-6 py-3.5 text-sm text-cream hover:bg-rose disabled:cursor-not-allowed disabled:opacity-50"
        >
          {placing ? 'Placing order…' : 'Place order'}
        </button>
      </form>
      <aside className="h-fit bg-[#f1ede6] p-6 sm:p-7">
        <h2 className="font-display text-2xl">Review your bag</h2>
        <div className="mt-5 divide-y divide-ink/10">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex gap-3 py-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-sand">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <p className="truncate">{item.name}</p>
                <p className="mt-1 text-ink/55">Qty {item.quantity}</p>
              </div>
              <p className="text-xs">{formatPrice(item.lineTotal)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span>Delivery</span>
          <span>Free</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 font-medium">
          <span>Total due on delivery</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
