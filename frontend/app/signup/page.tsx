import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

export const metadata: Metadata = { title: 'Create an account' };
type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignUpPage({ searchParams }: Props) {
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
          A little more Glow
        </p>
        <h1 className="font-display mt-2 text-4xl">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-ink/60">
          It only takes a moment. Your account keeps your cart and orders
          together.
        </p>
        <AuthForm mode="signup" nextPath={nextPath} />
      </div>
    </section>
  );
}
