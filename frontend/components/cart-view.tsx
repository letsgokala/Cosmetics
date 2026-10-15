'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/store-config';
import type { Cart } from '@/lib/types';
import { removeCartItem, updateCartItem } from '@/lib/api';

export function CartView({ initialCart }: { initialCart: Cart }) {
  const [cart, setCart] = useState(initialCart);
  const [message, setMessage] = useState('');
  const [busyProduct, setBusyProduct] = useState('');

  async function update(productId: string, quantity: number) {
    setBusyProduct(productId);
    setMessage('');
    try {
      const { data } =
        quantity === 0
          ? await removeCartItem(productId)
          : await updateCartItem(productId, quantity);
      setCart(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Your bag could not be updated.',
      );
    } finally {
      setBusyProduct('');
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="rounded-sm bg-[#f1ede6] px-6 py-14 text-center">
        <p className="font-display text-3xl">
          Your bag is taking a little rest.
        </p>
        <p className="mt-3 text-sm text-ink/60">
          Find something lovely to bring it back to life.
        </p>
        <Link
          href="/catalog"
          className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 text-sm text-cream hover:bg-rose"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_330px]">
      <div className="divide-y divide-ink/10">
        {cart.items.map((item) => (
          <article
            key={item.productId}
            className="grid grid-cols-[86px_1fr] gap-4 py-5 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:gap-6"
          >
            <Link
              href={`/products/${item.slug}`}
              className="relative aspect-square overflow-hidden bg-sand"
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="110px"
                className="object-cover"
              />
            </Link>
            <div>
              <Link
                href={`/products/${item.slug}`}
                className="text-sm font-medium hover:text-rose"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-xs text-ink/55">
                {formatPrice(item.price)} each
              </p>
              {!item.active && (
                <p className="mt-2 text-xs text-rose">
                  This item is no longer available.
                </p>
              )}
              {item.active && item.stock < item.quantity && (
                <p className="mt-2 text-xs text-rose">
                  Only {item.stock} left. Update the quantity to continue.
                </p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <label
                  htmlFor={`quantity-${item.productId}`}
                  className="text-xs text-ink/55"
                >
                  Qty
                </label>
                <select
                  id={`quantity-${item.productId}`}
                  value={item.quantity}
                  disabled={busyProduct === item.productId}
                  onChange={(event) =>
                    void update(item.productId, Number(event.target.value))
                  }
                  className="border border-ink/15 bg-transparent px-2 py-1 text-sm"
                >
                  {Array.from(
                    { length: Math.max(item.stock, item.quantity, 1) },
                    (_, index) => index + 1,
                  ).map((quantity) => (
                    <option key={quantity} value={quantity}>
                      {quantity}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => void update(item.productId, 0)}
                  className="text-xs text-ink/55 underline underline-offset-4 hover:text-rose"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="col-start-2 text-sm sm:col-start-auto">
              {formatPrice(item.lineTotal)}
            </p>
          </article>
        ))}
        {message && (
          <p role="alert" className="py-3 text-sm text-rose">
            {message}
          </p>
        )}
      </div>
      <aside className="h-fit bg-[#f1ede6] p-6 sm:p-7">
        <h2 className="font-display text-2xl">Order summary</h2>
        <div className="mt-6 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <p className="mt-3 text-xs leading-5 text-ink/55">
          Delivery details and any delivery charge will be confirmed before you
          place your order.
        </p>
        <Link
          href="/checkout"
          className="mt-7 inline-flex w-full justify-center rounded-full bg-ink px-6 py-3.5 text-sm text-cream hover:bg-rose"
        >
          Continue to checkout
        </Link>
        <Link
          href="/catalog"
          className="mt-4 block text-center text-xs text-ink/55 underline underline-offset-4"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
