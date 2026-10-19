'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cancelOrder } from '@/lib/api';

export function OrderActions({
  orderNumber,
  canCancel,
}: {
  orderNumber: string;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  if (!canCancel) return null;
  async function cancel() {
    setPending(true);
    setError('');
    try {
      await cancelOrder(orderNumber);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'This order could not be cancelled.',
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="mt-6">
      <button
        disabled={pending}
        onClick={() => void cancel()}
        className="rounded-full border border-ink/20 px-5 py-2.5 text-xs hover:border-rose hover:text-rose disabled:opacity-50"
      >
        {pending ? 'Cancelling…' : 'Cancel this order'}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-rose">
          {error}
        </p>
      )}
    </div>
  );
}
