import Link from 'next/link';
import { storeConfig } from '@/lib/store-config';

export function Header() {
  return (
    <header className="border-b border-ink/10 bg-cream">
      <div className="page-wrap flex h-[76px] items-center justify-between">
        <Link
          href="/"
          className="font-display text-[25px] font-semibold tracking-tight"
        >
          {storeConfig.wordmark}
          <span className="text-rose">.</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-7 text-sm"
        >
          <Link href="/catalog" className="hover:text-rose">
            Shop all
          </Link>
          <Link href="/#about" className="hidden hover:text-rose sm:block">
            Our approach
          </Link>
          <a
            href={`mailto:${storeConfig.contact.email}`}
            className="hidden rounded-full border border-ink/20 px-4 py-2 hover:border-rose hover:text-rose sm:block"
          >
            Get in touch
          </a>
        </nav>
      </div>
    </header>
  );
}
