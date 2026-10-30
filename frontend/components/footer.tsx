import { storeConfig } from '@/lib/store-config';

export function Footer() {
  return (
    <footer className="mt-24 bg-ink py-12 text-cream">
      <div className="page-wrap grid gap-7 sm:grid-cols-2">
        <div>
          <div className="font-display text-3xl">{storeConfig.name}</div>
          <p className="mt-2 max-w-sm text-sm text-cream/65">
            Thoughtful beauty essentials, chosen with care in Addis Ababa.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs uppercase tracking-[.2em] text-cream/50">
            Say hello
          </p>
          <a
            className="mt-2 inline-block text-sm hover:text-rose"
            href={`mailto:${storeConfig.contact.email}`}
          >
            {storeConfig.contact.email}
          </a>
          <p className="mt-1 text-sm text-cream/60">
            {storeConfig.contact.city}
          </p>
        </div>
        <div className="border-t border-cream/15 pt-5 text-xs text-cream/45 sm:col-span-2">
          © {new Date().getFullYear()} Sahle Cosmetics · Sample catalog
        </div>
      </div>
    </footer>
  );
}
