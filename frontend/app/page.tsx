import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getFeaturedProducts } from '@/lib/api';
import { ProductCard } from '@/components/product-card';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, featured] = await Promise.allSettled([
    getCategories(),
    getFeaturedProducts(),
  ]);
  const categoryItems =
    categories.status === 'fulfilled' ? categories.value.data : [];
  const products = featured.status === 'fulfilled' ? featured.value.data : [];
  return (
    <>
      <section className="page-wrap grid min-h-[540px] items-center gap-8 py-12 md:grid-cols-[.92fr_1.08fr] md:py-16">
        <div className="py-5">
          <p className="text-[11px] uppercase tracking-[.22em] text-rose">
            Your everyday, softly elevated
          </p>
          <h1 className="font-display mt-5 max-w-[560px] text-[52px] leading-[1.04] tracking-[-.04em] sm:text-[68px]">
            A little care goes a <span className="text-rose">long way.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-ink/65">
            A considered collection of feel-good beauty essentials, picked to
            make everyday rituals a little more special.
          </p>
          <Link
            href="/catalog"
            className="mt-8 inline-flex rounded-full bg-ink px-7 py-3.5 text-sm text-cream transition-colors hover:bg-rose"
          >
            Explore the collection{' '}
            <span aria-hidden="true" className="ml-3">
              ↗
            </span>
          </Link>
          <p className="mt-5 text-xs text-ink/45">
            Thoughtfully chosen in Addis Ababa
          </p>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-sm bg-[#e8d8ce] sm:min-h-[460px]">
          <Image
            src="/products/hero.svg"
            alt="Soft peach and rose toned beauty still life"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
          <span className="absolute bottom-4 left-4 bg-cream/90 px-3 py-2 text-[10px] uppercase tracking-[.18em]">
            Beauty, at your own pace
          </span>
        </div>
      </section>
      <section className="bg-[#f1ede6] py-14 sm:py-16">
        <div className="page-wrap">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-rose">
                Find your ritual
              </p>
              <h2 className="font-display mt-2 text-3xl sm:text-[38px]">
                Shop by category
              </h2>
            </div>
            <Link
              href="/catalog"
              className="hidden text-xs underline underline-offset-4 sm:block"
            >
              Browse all products
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {categoryItems.length ? (
              categoryItems.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/catalog?category=${category.slug}`}
                  className="group relative flex min-h-[145px] items-end overflow-hidden bg-[#d9c6b9] p-4 sm:min-h-[190px]"
                >
                  <Image
                    src={`/products/category-${index % 4}.svg`}
                    alt=""
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="relative bg-cream/90 px-3 py-2 text-sm">
                    {category.name}
                    <span className="ml-2 text-rose">↗</span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="col-span-full py-6 text-sm text-ink/55">
                Categories will appear here soon.
              </p>
            )}
          </div>
        </div>
      </section>
      <section className="page-wrap py-16 sm:py-20">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-rose">
              A few good things
            </p>
            <h2 className="font-display mt-2 text-3xl sm:text-[38px]">
              Currently glowing
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs underline underline-offset-4"
          >
            Shop all
          </Link>
        </div>
        {products.length ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4 sm:gap-x-6">
            {products.slice(0, 4).map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-sm bg-sand px-6 py-10 text-center text-sm text-ink/55">
            Our product edit is being refreshed. Please check back soon.
          </p>
        )}
      </section>
      <section id="about" className="page-wrap">
        <div className="grid gap-7 border-y border-ink/10 py-10 sm:grid-cols-3 sm:py-12">
          <div>
            <p className="text-xs uppercase tracking-[.18em] text-rose">
              A thoughtful edit
            </p>
            <p className="mt-2 text-sm text-ink/65">
              Everyday essentials, made easy to discover.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[.18em] text-rose">
              Carefully considered
            </p>
            <p className="mt-2 text-sm text-ink/65">
              Simple picks for the rituals you love.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[.18em] text-rose">
              Here in Addis
            </p>
            <p className="mt-2 text-sm text-ink/65">
              A local beauty shop, with a little something for everyone.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
