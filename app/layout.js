import './globals.css';
import { Poppins, Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import StorefrontShell from '@/components/layout/StorefrontShell';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kbfurniture.et';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'KB Furniture | Quality Furniture in Addis Ababa, Ethiopia',
    template: '%s | KB Furniture',
  },
  description:
    'Solid wood dining tables, comfortable modern sofas, and durable beds made with care in Addis Ababa, Ethiopia. Fast delivery and direct workshop prices.',
  keywords: [
    'furniture Addis Ababa',
    'solid wood furniture Ethiopia',
    'sofas Addis Ababa',
    'dining tables Ethiopia',
    'beds Addis Ababa',
    'custom furniture Ethiopia',
    'KB Furniture',
  ],
  authors: [{ name: 'KB Furniture' }],
  creator: 'KB Furniture',
  publisher: 'KB Furniture',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_ET',
    url: siteUrl,
    siteName: 'KB Furniture',
    title: 'KB Furniture | Quality Furniture in Addis Ababa, Ethiopia',
    description:
      'Solid wood dining tables, comfortable modern sofas, and durable beds made with care in Addis Ababa, Ethiopia.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'KB Furniture Quality Furniture in Addis Ababa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KB Furniture | Quality Furniture in Addis Ababa, Ethiopia',
    description:
      'Solid wood dining tables, comfortable modern sofas, and durable beds made with care in Addis Ababa, Ethiopia.',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-terracotta.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: 'KB Furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&h=630&q=80',
    logo: `${siteUrl}/logo-terracotta.png`,
    '@id': `${siteUrl}/#store`,
    url: siteUrl,
    telephone: '+251911234567',
    priceRange: 'ETB',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bole Sub-City, Cameroon Street, Near Edna Mall',
      addressLocality: 'Addis Ababa',
      addressCountry: 'ET',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 9.005401,
      longitude: 38.784401,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:30',
        closes: '18:30',
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#FAF8F5] text-[#201C18] font-sans selection:bg-[#B8551F]/20 selection:text-[#B8551F]"
      >
        <Providers>
          <StorefrontShell>{children}</StorefrontShell>
        </Providers>
      </body>
    </html>
  );
}
