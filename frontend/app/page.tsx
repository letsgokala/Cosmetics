import Image from 'next/image';
import Link from 'next/link';

const values = [
  {
    number: '01',
    title: 'Beauty, without the rush',
    copy: 'Make room for small rituals that feel good in your own time and in your own way.',
  },
  {
    number: '02',
    title: 'A thoughtful edit',
    copy: 'A considered collection across skincare, makeup, haircare and fragrance.',
  },
  {
    number: '03',
    title: 'Rooted in Addis',
    copy: 'An independent beauty shop bringing everyday favorites a little closer to home.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="page-wrap grid min-h-[620px] items-center gap-10 py-12 md:grid-cols-[.9fr_1.1fr] md:py-16">
        <div className="py-5">
          <p className="text-[11px] uppercase tracking-[.22em] text-rose">
            Thoughtful beauty, close to home
          </p>
          <h1 className="font-display mt-5 max-w-[560px] text-[50px] leading-[1.04] tracking-[-.04em] sm:text-[68px]">
            A softer kind of <span className="text-rose">glow.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-ink/65">
            Glow Cosmetics is an independent beauty shop in Addis Ababa. We
            bring together the skincare, color and little luxuries that make
            everyday care feel like your own.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/catalog"
              className="inline-flex rounded-full bg-ink px-7 py-3.5 text-sm text-cream transition-colors hover:bg-rose"
            >
              Shop the collection <span aria-hidden="true" className="ml-3">↗</span>
            </Link>
            <a
              href="#our-story"
              className="text-sm underline decoration-ink/25 underline-offset-4 hover:decoration-rose"
            >
              Get to know us
            </a>
          </div>
          <p className="mt-6 text-xs text-ink/45">
            A local beauty shop, with a little something for everyone.
          </p>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-sm bg-[#e8d8ce] sm:min-h-[510px]">
          <Image
            src="/products/hero.svg"
            alt="A warm, softly lit beauty still life"
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

      <section id="our-story" className="bg-[#f1ede6] py-16 sm:py-24">
        <div className="page-wrap grid gap-8 md:grid-cols-[.7fr_1.3fr] md:gap-16">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-rose">
              Our story
            </p>
            <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">
              Care should feel like care.
            </h2>
          </div>
          <div className="max-w-2xl space-y-5 text-sm leading-7 text-ink/65">
            <p>
              We started Glow with a simple thought: choosing beauty should feel
              easy, personal and a little joyful. So we bring together everyday
              essentials and special finds in one calm, welcoming place.
            </p>
            <p>
              From a morning face cream to a fragrance you save for yourself,
              every product is an invitation to make a small moment your own.
              Discover the edit online or get in touch with our Addis Ababa
              team for a hand finding your next favorite.
            </p>
            <Link
              href="/catalog"
              className="inline-flex rounded-full border border-ink/20 px-6 py-3 text-sm text-ink transition-colors hover:border-rose hover:text-rose"
            >
              Visit the shop <span aria-hidden="true" className="ml-3">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="page-wrap py-16 sm:py-20">
        <p className="text-[10px] uppercase tracking-[.2em] text-rose">
          What we believe
        </p>
        <h2 className="font-display mt-3 max-w-xl text-4xl sm:text-5xl">
          A little intention goes a long way.
        </h2>
        <div className="mt-10 grid gap-px bg-ink/10 sm:grid-cols-3">
          {values.map((value) => (
            <article key={value.number} className="bg-cream p-6 sm:p-8">
              <span className="text-xs text-rose">{value.number}</span>
              <h3 className="font-display mt-8 text-2xl">{value.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/60">{value.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
