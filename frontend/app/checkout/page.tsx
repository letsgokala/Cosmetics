'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckoutForm } from '@/components/checkout-form';
import { getCart, getCurrentAccount } from '@/lib/api';
import type { Account, Cart } from '@/lib/types';

export default function CheckoutPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    Promise.all([getCurrentAccount(), getCart()])
      .then(([accountResponse, cartResponse]) => {
        setAccount(accountResponse.data.user);
        setCart(cartResponse.data);
      })
      .catch(() => setUnauthorized(true));
  }, []);

  if (unauthorized) {
    if (typeof window !== 'undefined')
      window.location.replace('/signin?next=%2Fcheckout');
    return null;
  }
  if (!account || !cart) {
    return (
      <section className="page-wrap min-h-[65vh] py-16 text-center text-sm text-ink/60">
        Loading checkout…
      </section>
    );
  }
  if (!cart.items.length) {
    if (typeof window !== 'undefined') window.location.replace('/cart');
    return null;
  }
  return (
    <section className="page-wrap min-h-[65vh] py-10 sm:py-14">
      <Link
        href="/cart"
        className="text-xs text-ink/55 underline underline-offset-4 hover:text-rose"
      >
        ← Back to your bag
      </Link>
      <p className="mt-7 text-[10px] uppercase tracking-[.2em] text-rose">
        Almost yours
      </p>
      <h1 className="font-display mt-2 mb-8 text-4xl sm:text-5xl">Checkout</h1>
      <CheckoutForm cart={cart} name={account.name} />
    </section>
  );
}
