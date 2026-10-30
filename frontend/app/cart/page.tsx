'use client';

import { useEffect, useState } from 'react';
import { CartView } from '@/components/cart-view';
import { getCart } from '@/lib/api';
import type { Cart } from '@/lib/types';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    getCart()
      .then(({ data }) => setCart(data))
      .catch(() => setUnauthorized(true));
  }, []);

  if (unauthorized) {
    if (typeof window !== 'undefined') window.location.replace('/signin?next=%2Fcart');
    return null;
  }
  if (!cart) {
    return (
      <section className="page-wrap min-h-[65vh] py-16 text-center text-sm text-ink/60">
        Loading your bag…
      </section>
    );
  }

  return (
    <section className="page-wrap min-h-[65vh] py-10 sm:py-14">
      <p className="text-[10px] uppercase tracking-[.2em] text-rose">
        Your picks
      </p>
      <h1 className="font-display mt-2 mb-8 text-4xl sm:text-5xl">Your bag</h1>
      <CartView initialCart={cart} />
    </section>
  );
}
