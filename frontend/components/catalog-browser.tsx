'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCategories, getProducts } from '@/lib/api';
import type { Category, ProductResponse } from '@/lib/types';
import { ProductCard } from './product-card';

export function CatalogBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<ProductResponse | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [categoryError, setCategoryError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const queryString = searchParams.toString();
  const requestKey = `${queryString}:${retryCount}`;
  const loading = loadedKey !== requestKey;
  const error = requestError?.key === requestKey ? requestError.message : '';

  useEffect(() => {
    getCategories()
      .then((value) => setCategories(value.data))
      .catch(() => setCategoryError(true));
  }, []);
  useEffect(() => {
    let alive = true;
    const query = new URLSearchParams(queryString);
    query.set('limit', '8');
    getProducts(query)
      .then((value) => {
        if (alive) setResult(value);
      })
      .catch(() => {
        if (alive) {
          setRequestError({
            key: requestKey,
            message:
              'We could not load products. Check your connection and try again.',
          });
        }
      })
      .finally(() => {
        if (alive) setLoadedKey(requestKey);
      });
    return () => {
      alive = false;
    };
  }, [queryString, requestKey]);

  function change(key: string, value: string) {
    const next = new URLSearchParams(queryString);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    router.push(`/catalog${next.size ? `?${next}` : ''}`);
  }

  return (
    <div>
      <div className="grid gap-4 rounded-sm bg-sand p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            change('q', String(formData.get('q') ?? '').trim());
          }}
          className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <label className="text-xs font-medium uppercase tracking-[.14em]">
            Search products
            <input
              key={searchParams.get('q') ?? 'all-products'}
              name="q"
              type="search"
              defaultValue={searchParams.get('q') ?? ''}
              placeholder="Try serum or moisturizer"
              className="mt-2 block w-full border-b border-ink/25 bg-transparent py-3 text-base normal-case tracking-normal outline-none placeholder:text-ink/35 focus:border-rose sm:min-w-[250px]"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2.5 text-sm text-cream hover:bg-rose"
          >
            Search
          </button>
        </form>
        <label className="text-xs font-medium uppercase tracking-[.14em]">
          Category
          <select
            value={searchParams.get('category') ?? ''}
            onChange={(event) => change('category', event.target.value)}
            className="mt-2 block w-full border-b border-ink/25 bg-transparent py-3 text-base normal-case tracking-normal outline-none focus:border-rose sm:min-w-[190px]"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {categoryError && (
        <p role="status" className="mt-3 text-xs text-ink/60">
          Category filters are temporarily unavailable.
        </p>
      )}
      <div aria-live="polite" className="mt-7">
        {loading && (
          <p className="py-16 text-center text-sm text-ink/60">
            Finding your favorites…
          </p>
        )}
        {error && (
          <div className="py-14 text-center">
            <p role="alert">{error}</p>
            <button
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-3 underline"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && result?.data.length === 0 && (
          <p className="py-16 text-center text-sm">
            No products found. Try another search.
          </p>
        )}
        {!loading && !error && result?.data.length ? (
          <>
            <p className="mb-5 text-xs text-ink/50">
              {result.meta.total}{' '}
              {result.meta.total === 1 ? 'product' : 'products'}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {result.data.map((product, index) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  priority={index === 0}
                />
              ))}
            </div>
            <div className="mt-10 flex items-center justify-center gap-5">
              <button
                disabled={result.meta.page <= 1}
                onClick={() => change('page', String(result.meta.page - 1))}
                className="rounded-full border border-ink/20 px-5 py-2 text-sm disabled:opacity-35"
              >
                Previous
              </button>
              <span className="text-xs text-ink/60">
                Page {result.meta.page} of {result.meta.totalPages}
              </span>
              <button
                disabled={result.meta.page >= result.meta.totalPages}
                onClick={() => change('page', String(result.meta.page + 1))}
                className="rounded-full border border-ink/20 px-5 py-2 text-sm disabled:opacity-35"
              >
                Next
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
