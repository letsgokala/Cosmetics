'use client';

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section className="page-wrap flex min-h-[58vh] flex-col items-center justify-center text-center">
      <p className="text-[10px] uppercase tracking-[.2em] text-rose">
        A small hiccup
      </p>
      <h1 className="font-display mt-3 text-4xl">This page didn’t load.</h1>
      <p className="mt-4 text-sm text-ink/55">Please try again in a moment.</p>
      <button
        onClick={() => retry()}
        className="mt-7 rounded-full bg-ink px-6 py-3 text-sm text-cream"
      >
        Try again
      </button>
    </section>
  );
}
