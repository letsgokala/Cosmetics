import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-wrap flex min-h-[58vh] flex-col items-center justify-center text-center">
      <p className="text-[10px] uppercase tracking-[.2em] text-rose">
        A little detour
      </p>
      <h1 className="font-display mt-3 text-5xl">We can’t find that page.</h1>
      <p className="mt-4 text-sm text-ink/55">
        It may have moved, or the link might be out of date.
      </p>
      <Link
        href="/catalog"
        className="mt-7 rounded-full bg-ink px-6 py-3 text-sm text-cream"
      >
        Browse the collection
      </Link>
    </section>
  );
}
