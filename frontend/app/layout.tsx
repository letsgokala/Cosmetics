import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { storeConfig } from '@/lib/store-config';

export const metadata: Metadata = {
  title: {
    default: `${storeConfig.name} | Thoughtful beauty essentials`,
    template: '%s | Sahle Cosmetics',
  },
  description: `Discover skincare, makeup, haircare and fragrance at ${storeConfig.name} in Addis Ababa.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
