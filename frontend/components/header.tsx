'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getCart, getCurrentAccount, signOut } from '@/lib/api';
import type { Account } from '@/lib/types';
import { storeConfig } from '@/lib/store-config';

export function Header() {
  const [account, setAccount] = useState<Account | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const refreshAccount = useCallback(async () => {
    try {
      const { data } = await getCurrentAccount();
      setAccount(data.user);
      const cart = await getCart();
      setCartCount(cart.data.itemCount);
    } catch {
      setAccount(null);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refreshAccount(), 0);
    window.addEventListener('glow-auth-changed', refreshAccount);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener('glow-auth-changed', refreshAccount);
    };
  }, [refreshAccount]);

  async function handleSignOut() {
    await signOut().catch(() => undefined);
    setAccount(null);
    setCartCount(0);
    window.dispatchEvent(new Event('glow-auth-changed'));
  }

  return (
    <header className="border-b border-ink/10 bg-cream">
      <div className="page-wrap flex h-[76px] items-center justify-between">
        <Link
          href="/"
          className="font-display text-[25px] font-semibold tracking-tight"
        >
          {storeConfig.wordmark}
          <span className="text-rose">.</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-3 text-xs sm:gap-7 sm:text-sm"
        >
          <Link href="/catalog" className="hover:text-rose">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-rose">
            Bag{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
          {account ? (
            <>
              <Link href="/account" className="hover:text-rose">
                <span className="sm:hidden">Me</span>
                <span className="hidden sm:inline">My account</span>
              </Link>
              <button
                onClick={() => void handleSignOut()}
                className="hidden hover:text-rose sm:block"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/signin" className="hover:text-rose">
              Sign in
            </Link>
          )}
          <Link href="/#about" className="hidden hover:text-rose sm:block">
            Our approach
          </Link>
          <a
            href={`mailto:${storeConfig.contact.email}`}
            className="hidden rounded-full border border-ink/20 px-4 py-2 hover:border-rose hover:text-rose sm:block"
          >
            Get in touch
          </a>
        </nav>
      </div>
    </header>
  );
}
