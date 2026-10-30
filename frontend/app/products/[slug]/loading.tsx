export default function ProductLoading() {
  return (
    <section className="page-wrap py-8 sm:py-12" aria-label="Loading product">
      <div className="mb-7 h-4 w-48 animate-pulse bg-sand" />
      <div className="grid gap-9 md:grid-cols-2 md:gap-14">
        <div className="aspect-[4/4.5] animate-pulse bg-sand sm:aspect-square" />
        <div className="flex flex-col justify-center py-2">
          <div className="h-3 w-20 animate-pulse bg-sand" />
          <div className="mt-4 h-12 w-4/5 animate-pulse bg-sand" />
          <div className="mt-6 h-5 w-24 animate-pulse bg-sand" />
          <div className="my-7 h-px bg-ink/10" />
          <div className="h-20 max-w-md animate-pulse bg-sand" />
        </div>
      </div>
    </section>
  );
}
