import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, getProduct } from '@/lib/api';
import { formatPrice, storeConfig } from '@/lib/store-config';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data } = await getProduct((await params).slug);
    return { title: data.name, description: data.description };
  } catch {
    return { title: 'Product not found' };
  }
}
export default async function ProductPage({ params }: Props) {
  const slug = (await params).slug;
  let product;
  try {
    product = (await getProduct(slug)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return (
    <section className="page-wrap py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-7 text-xs text-ink/50">
        <Link href="/catalog" className="hover:text-rose">
          Shop
        </Link>
        <span className="px-2">/</span>
        <Link
          href={`/catalog?category=${product.category.slug}`}
          className="hover:text-rose"
        >
          {product.category.name}
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>
      <div className="grid gap-9 md:grid-cols-2 md:gap-14">
        <div className="relative aspect-[4/4.5] overflow-hidden bg-sand sm:aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center py-2">
          <p className="text-[10px] uppercase tracking-[.2em] text-rose">
            {product.category.name}
          </p>
          <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg">{formatPrice(product.price)}</p>
          <div className="my-7 h-px bg-ink/10" />
          <p className="max-w-md text-sm leading-7 text-ink/65">
            {product.description}
          </p>
          <p
            className={`mt-6 flex items-center gap-2 text-sm ${product.stock > 0 ? 'text-[#42694f]' : 'text-rose'}`}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-current"
            />
            {product.stock > 0
              ? `In stock · ${product.stock} available`
              : 'Currently unavailable'}
          </p>
          <p className="mt-3 text-xs text-ink/45">
            Prices shown in {storeConfig.currency.code}.
          </p>
          <Link
            href="/catalog"
            className="mt-9 self-start rounded-full border border-ink/25 px-6 py-3 text-sm hover:border-rose hover:text-rose"
          >
            Continue browsing
          </Link>
        </div>
      </div>
    </section>
  );
}
