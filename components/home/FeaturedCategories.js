import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CATEGORIES_DATA = [
  {
    name: 'Living Room',
    slug: 'living-room',
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Sofas, armchairs, and coffee tables crafted from solid hardwood.',
    span: 'col-span-1 md:col-span-2 row-span-1',
  },
  {
    name: 'Dining Room',
    slug: 'dining-room',
    image: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Solid wood dining tables and chairs for every family.',
    span: 'col-span-1',
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Strong wooden beds and bedside tables built to last.',
    span: 'col-span-1',
  },
  {
    name: 'Home Office',
    slug: 'home-office',
    image: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Desks, bookcases, and work chairs for focused productivity.',
    span: 'col-span-1 md:col-span-2',
  },
];


export default function FeaturedCategories() {
  return (
    <section
      id="featured-categories"
      className="py-14 sm:py-18 bg-[#FAF8F5] border-t border-[#E5DDD3]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[2.5px] bg-[#B8551F] rounded-full" />
              <span className="text-[11px] uppercase font-extrabold tracking-[0.2em] text-[#B8551F]">
                ROOMS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1A15] tracking-tight">
              Shop by Room
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B8551F] hover:text-[#8F4116] transition-colors group"
          >
            <span>View All Furniture</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Bento-grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className={`group relative h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-[#E5DDD3] hover:border-[#D99A2B] transition-all duration-300 hover:shadow-xl ${cat.span}`}
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1A15]/90 via-[#1F1A15]/25 to-transparent" />

              {/* Overlay content */}
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-300 mt-1 max-w-xs leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D99A2B] group-hover:translate-x-1 transition-transform duration-200">
                  <span>Shop Room</span>
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
