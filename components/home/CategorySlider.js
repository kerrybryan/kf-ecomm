'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

const DEFAULT_CATEGORIES = [
  {
    name: 'Living Room',
    slug: 'living-room',
    image: 'https://picsum.photos/seed/cat-living-room/800/800',
    itemCount: '12 Items',
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    image: 'https://picsum.photos/seed/cat-bedroom/800/800',
    itemCount: '8 Items',
  },
  {
    name: 'Dining Room',
    slug: 'dining-room',
    image: 'https://picsum.photos/seed/cat-dining-room/800/800',
    itemCount: '10 Items',
  },
  {
    name: 'Home Office',
    slug: 'home-office',
    image: 'https://picsum.photos/seed/cat-home-office/800/800',
    itemCount: '6 Items',
  },
  {
    name: 'Lighting & Decor',
    slug: 'lighting-decor',
    image: 'https://picsum.photos/seed/cat-lighting-decor/800/800',
    itemCount: '15 Items',
  },
  {
    name: 'Outdoor & Lounge',
    slug: 'outdoor',
    image: 'https://picsum.photos/seed/cat-outdoor/800/800',
    itemCount: '5 Items',
  },
];

export default function CategorySlider({ categories = [] }) {
  const scrollRef = useRef(null);

  const displayCategories =
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 sm:py-14 bg-[#F3ECE1] border-b border-[#DCD1BE]/70 relative group/slider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with View All Categories Link */}
        <SectionHeader
          eyebrow="BROWSE BY ROOM"
          title="Shop By Category"
          viewAllLink="/shop"
          viewAllText="View All Categories"
        />

        {/* Carousel Container with Scroll Snap */}
        <div className="relative">
          {/* Left Arrow (Desktop Hover) */}
          <button
            onClick={scrollLeft}
            className="hidden lg:flex absolute -left-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-[#DCD1BE] items-center justify-center text-[#2B2620] hover:text-[#A8875E] opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer hover:scale-105"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow (Desktop Hover) */}
          <button
            onClick={scrollRight}
            className="hidden lg:flex absolute -right-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-[#DCD1BE] items-center justify-center text-[#2B2620] hover:text-[#A8875E] opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer hover:scale-105"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontally Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar snap-mandatory scroll-smooth pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {displayCategories.map((cat, idx) => {
              const fallback = DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length];
              const imageUrl = cat.image || fallback.image;

              return (
                <div
                  key={cat.slug || cat.name}
                  className="w-[42vw] sm:w-[30vw] md:w-[22vw] lg:w-[calc(20%-16px)] shrink-0 snap-align-start group/card"
                >
                  <Link href={`/categories/${cat.slug}`} className="block">
                    {/* Category Image Card */}
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-xs border border-[#DCD1BE] mb-3">
                      <Image
                        src={imageUrl}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 240px"
                        className="object-cover object-center group-hover/card:scale-106 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover/card:bg-transparent transition-colors" />
                    </div>

                    {/* Category Name & "Shop Now →" Link */}
                    <div className="text-left px-1">
                      <h3 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#2B2620] group-hover/card:text-[#A8875E] transition-colors">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-[#A8875E] group-hover/card:text-[#2B2620] mt-0.5 transition-colors">
                        <span>Shop Now</span>
                        <ArrowRight className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
