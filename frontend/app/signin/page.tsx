import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

export const metadata: Metadata = { title: 'Sign in' };
type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextPath =
    next?.startsWith('/') && !next.startsWith('//') ? next : '/account';
  return (
    <section className="page-wrap grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-sm bg-[#f1ede6] p-6 sm:p-9">
        <Link href="/" className="text-xs text-ink/55 hover:text-rose">
          ← Back to Glow
        </Link>
        <p className="mt-7 text-[10px] uppercase tracking-[.2em] text-rose">
          Welcome back
        </p>
        <h1 className="font-display mt-2 text-4xl">Sign in to your account</h1>
        <p className="mt-3 text-sm leading-6 text-ink/60">
          Sign in to save your favorites to a cart and place an order.
        </p>
        <AuthForm mode="signin" nextPath={nextPath} />
      </div>
    </section>
  );
}
