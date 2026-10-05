import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogBrowser } from '@/components/catalog-browser';

export const metadata: Metadata = { title: 'Shop all products' };
export default function CatalogPage() {
  return (
    <section className="page-wrap min-h-[65vh] py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[.2em] text-rose">
          The collection
        </p>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl">
          All the good things
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink/60">
          Find your next favorite across skincare, makeup, haircare and
          fragrance.
        </p>
      </div>
      <Suspense
        fallback={
          <p className="py-16 text-center text-sm">Loading the collection…</p>
        }
      >
        <CatalogBrowser />
      </Suspense>
    </section>
  );
}
