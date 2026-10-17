import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout-form';
import { serverApi } from '@/lib/server-api';
import type { Account, Cart } from '@/lib/types';

export const metadata: Metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const [account, cart] = await Promise.all([
    serverApi<{ user: Account }>('/auth/me'),
    serverApi<Cart>('/cart'),
  ]);
  if (!account || !cart) redirect('/signin?next=%2Fcheckout');
  if (!cart.items.length) redirect('/cart');
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
      <CheckoutForm cart={cart} name={account.user.name} />
    </section>
  );
}
