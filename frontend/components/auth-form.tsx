'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { addCartItem, signIn, signUp } from '@/lib/api';

export function AuthForm({
  mode,
  nextPath,
}: {
  mode: 'signin' | 'signup';
  nextPath: string;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const isSignUp = mode === 'signup';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    try {
      if (isSignUp) await signUp(name, email, password);
      else await signIn(email, password);

      let destination = nextPath;
      const pendingItem = sessionStorage.getItem('glow_pending_cart_item');
      if (pendingItem) {
        const item = JSON.parse(pendingItem) as {
          productId: string;
          quantity: number;
        };
        await addCartItem(item.productId, item.quantity);
        sessionStorage.removeItem('glow_pending_cart_item');
        destination = '/cart';
      }
      window.dispatchEvent(new Event('glow-auth-changed'));
      router.replace(destination);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'We could not sign you in. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 grid gap-5">
      {isSignUp && (
        <label className="grid gap-2 text-sm">
          Your name
          <input
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="rounded-sm border border-ink/15 bg-white px-4 py-3 outline-none focus:border-rose"
          />
        </label>
      )}
      <label className="grid gap-2 text-sm">
        Email address
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          className="rounded-sm border border-ink/15 bg-white px-4 py-3 outline-none focus:border-rose"
        />
      </label>
      <label className="grid gap-2 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          className="rounded-sm border border-ink/15 bg-white px-4 py-3 outline-none focus:border-rose"
        />
        {isSignUp && (
          <span className="text-xs text-ink/50">
            Use at least 8 characters.
          </span>
        )}
      </label>
      {error && (
        <p role="alert" className="text-sm text-rose">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-full bg-ink px-6 py-3.5 text-sm text-cream transition-colors hover:bg-rose disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-ink/60">
        {isSignUp ? 'Already have an account?' : 'New to Glow?'}{' '}
        <Link
          href={`/${isSignUp ? 'signin' : 'signup'}?next=${encodeURIComponent(nextPath)}`}
          className="text-rose underline underline-offset-4"
        >
          {isSignUp ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </form>
  );
}
