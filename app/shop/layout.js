export const metadata = {
  title: 'All Furniture',
  description:
    'Browse our full collection of solid wood dining tables, comfortable modern sofas, and durable beds in Addis Ababa, Ethiopia.',
  openGraph: {
    title: 'All Furniture | KB Furniture Addis Ababa',
    description:
      'Browse our full collection of solid wood dining tables, comfortable modern sofas, and durable beds in Addis Ababa, Ethiopia.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'All Furniture Collection at KB Furniture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Furniture | KB Furniture',
    description:
      'Browse our full collection of solid wood dining tables, comfortable modern sofas, and durable beds in Addis Ababa, Ethiopia.',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&h=630&q=80'],
  },
};

export default function ShopLayout({ children }) {
  return children;
}
