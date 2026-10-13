'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { addCartItem, ApiError } from '@/lib/api';

export function AddToCartButton({
  productId,
  available,
  className = '',
}: {
  productId: string;
  available: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);

  async function add() {
    setMessage('');
    setAdding(true);
    try {
      await addCartItem(productId);
      setMessage('Added to your bag.');
      window.dispatchEvent(new Event('glow-auth-changed'));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        sessionStorage.setItem(
          'glow_pending_cart_item',
          JSON.stringify({ productId, quantity: 1 }),
        );
        router.push(`/signin?next=${encodeURIComponent('/cart')}`);
      } else {
        setMessage(
          error instanceof Error ? error.message : 'Could not add this item.',
        );
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={!available || adding}
        onClick={() => void add()}
        className="w-full rounded-full border border-ink/20 px-4 py-2.5 text-xs transition-colors hover:border-rose hover:text-rose disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!available ? 'Out of stock' : adding ? 'Adding…' : 'Add to bag'}
      </button>
      {message && (
        <p role="status" className="mt-2 text-xs text-ink/60">
          {message}
        </p>
      )}
    </div>
  );
}
