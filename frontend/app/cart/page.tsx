import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CartView } from '@/components/cart-view';
import { serverApi } from '@/lib/server-api';
import type { Cart } from '@/lib/types';

export const metadata: Metadata = { title: 'Your bag' };

export default async function CartPage() {
  const cart = await serverApi<Cart>('/cart');
  if (!cart) redirect('/signin?next=%2Fcart');
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
