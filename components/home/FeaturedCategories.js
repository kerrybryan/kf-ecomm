import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CATEGORIES_DATA = [
  {
    name: 'Living Room',
    slug: 'living-room',
    image: 'https://picsum.photos/seed/cat-living-room/800/800',
    description: 'Sculptural sofas, bouclé armchairs & coffee tables',
    span: 'col-span-1 md:col-span-2',
  },
  {
    name: 'Dining & Entertaining',
    slug: 'dining-room',
    image: 'https://picsum.photos/seed/cat-dining-room/800/800',
    description: 'Extendable oak dining tables & cane chairs',
    span: 'col-span-1',
  },
  {
    name: 'Bedroom Sanctuary',
    slug: 'bedroom',
    image: 'https://picsum.photos/seed/cat-bedroom/800/800',
    description: 'Floating platform beds & linen storage',
    span: 'col-span-1',
  },
  {
    name: 'Executive Office',
    slug: 'home-office',
    image: 'https://picsum.photos/seed/cat-home-office/800/800',
    description: 'Solid walnut desks & ergonomic leather task seating',
    span: 'col-span-1 md:col-span-2',
  },
];

export default function FeaturedCategories() {
  return (
    <section className="py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-700 block mb-2">
              Curated Spaces
            </span>
            <h2 className="text-3xl font-serif-luxury font-bold text-stone-900">
              Browse by Room & Collection
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-900 hover:text-amber-700 transition-colors group"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`group relative h-80 rounded-2xl overflow-hidden shadow-sm ${cat.span}`}
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent transition-opacity" />

              {/* Overlay Content */}
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold tracking-wide">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-300 mt-1 max-w-xs leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 group-hover:translate-x-1 transition-transform">
                  <span>Explore Pieces</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
