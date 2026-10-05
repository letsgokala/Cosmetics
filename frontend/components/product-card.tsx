import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/store-config';

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/4.5] overflow-hidden rounded-sm bg-sand">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading={priority ? 'eager' : 'lazy'}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
          <span className="absolute left-3 top-3 bg-cream/90 px-2.5 py-1 text-[10px] uppercase tracking-[.13em]">
            {product.category.name}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2 pt-3">
          <div>
            <h3 className="text-sm font-medium leading-5 sm:text-base">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-ink/55">
              {product.stock > 0 ? 'In stock' : 'Currently unavailable'}
            </p>
          </div>
          <span className="whitespace-nowrap text-sm">
            {formatPrice(product.price)}
          </span>
        </div>
      </Link>
    </article>
  );
}
