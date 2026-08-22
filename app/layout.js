import './globals.css';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import Providers from '@/components/Providers';
import StorefrontShell from '@/components/layout/StorefrontShell';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Nordika Furniture | Minimal Scandinavian Studio',
  description:
    'Handcrafted solid oak dining, architectural bouclé seating, natural travertine tables, and warm minimalist furniture.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#F3ECE1] text-[#2B2620] font-sans selection:bg-[#A8875E]/30 selection:text-[#1A1613]">
        <Providers>
          <StorefrontShell>{children}</StorefrontShell>
        </Providers>
      </body>
    </html>
  );
}
