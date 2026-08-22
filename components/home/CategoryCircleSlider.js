'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

const DEFAULT_PRODUCT_CATEGORIES = [
  {
    name: 'Seating',
    slug: 'living-room',
    image: 'https://picsum.photos/seed/cat-living-room/400/400',
    desc: 'Sofas & Armchairs',
  },
  {
    name: 'Tables',
    slug: 'dining-room',
    image: 'https://picsum.photos/seed/cat-dining-room/400/400',
    desc: 'Dining & Coffee Tables',
  },
  {
    name: 'Storage',
    slug: 'storage',
    image: 'https://picsum.photos/seed/cat-storage/400/400',
    desc: 'Sideboards & Wardrobes',
  },
  {
    name: 'Beds',
    slug: 'bedroom',
    image: 'https://picsum.photos/seed/cat-bedroom/400/400',
    desc: 'Beds & Nightstands',
  },
  {
    name: 'Doors & Fittings',
    slug: 'doors',
    image: 'https://picsum.photos/seed/cat-doors/400/400',
    desc: 'Interior & Barn Doors',
  },
  {
    name: 'Kitchen & Cabinetry',
    slug: 'kitchen',
    image: 'https://picsum.photos/seed/cat-kitchen/400/400',
    desc: 'Islands & Bar Stools',
  },
  {
    name: 'Outdoor',
    slug: 'outdoor',
    image: 'https://picsum.photos/seed/cat-outdoor/400/400',
    desc: 'Patio & Lounge',
  },
  {
    name: 'Office & Desks',
    slug: 'home-office',
    image: 'https://picsum.photos/seed/cat-home-office/400/400',
    desc: 'Desks & Task Seating',
  },
  {
    name: 'Lighting & Decor',
    slug: 'lighting-decor',
    image: 'https://picsum.photos/seed/cat-lighting-decor/400/400',
    desc: 'Pendants & Accents',
  },
  {
    name: 'Custom Made',
    slug: 'custom-order',
    image: 'https://picsum.photos/seed/cat-custom-order/400/400',
    desc: 'Bespoke Commissions',
  },
];

export default function CategoryCircleSlider({ categories = [] }) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  // Merge MongoDB categories with descriptive fallback imagery
  const displayCategories =
    categories && categories.length >= 6
      ? categories.map((cat, idx) => ({
          ...DEFAULT_PRODUCT_CATEGORIES[idx % DEFAULT_PRODUCT_CATEGORIES.length],
          ...cat,
          name: cat.name || DEFAULT_PRODUCT_CATEGORIES[idx % DEFAULT_PRODUCT_CATEGORIES.length].name,
          slug: cat.slug || DEFAULT_PRODUCT_CATEGORIES[idx % DEFAULT_PRODUCT_CATEGORIES.length].slug,
          image: cat.image || DEFAULT_PRODUCT_CATEGORIES[idx % DEFAULT_PRODUCT_CATEGORIES.length].image,
        }))
      : DEFAULT_PRODUCT_CATEGORIES;

  // Duplicate list for seamless infinite horizontal auto-scroll loop
  const duplicatedList = [...displayCategories, ...displayCategories];

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    // Resume auto-scroll after a short delay
    setTimeout(() => {
      setIsPaused(false);
    }, 2000);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 sm:py-14 bg-[#F3ECE1] border-b border-[#DCD1BE]/70 relative group/slider overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        {/* Section Header */}
        <SectionHeader
          eyebrow="PRODUCT TYPES"
          title="Shop By Category"
          viewAllLink="/shop"
          viewAllText="View All Categories"
        />
      </div>

      {/* Sliding Carousel Track with Auto-Scroll */}
      <div className="relative w-full">
        {/* Left Arrow (Desktop Hover) */}
        <button
          onClick={scrollLeft}
          className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-[#DCD1BE] items-center justify-center text-[#2B2620] hover:text-[#A8875E] opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow (Desktop Hover) */}
        <button
          onClick={scrollRight}
          className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-[#DCD1BE] items-center justify-center text-[#2B2620] hover:text-[#A8875E] opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Horizontal Container: Auto-scrolling on desktop & touch enabled on mobile */}
        <div
          ref={scrollRef}
          className="overflow-x-auto no-scrollbar scroll-smooth"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`animate-marquee-smooth gap-6 sm:gap-10 px-4 sm:px-8 ${
              isPaused ? 'is-paused' : ''
            }`}
          >
            {duplicatedList.map((cat, idx) => {
              const linkHref =
                cat.slug === 'custom-order'
                  ? '/custom-order'
                  : `/shop?category=${encodeURIComponent(cat.slug)}`;

              return (
                <div
                  key={`${cat.name}-${idx}`}
                  className="shrink-0 flex flex-col items-center text-center group/circle cursor-pointer"
                >
                  <Link href={linkHref} className="flex flex-col items-center">
                    {/* Circular Photo Container */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-26 lg:h-26 rounded-full overflow-hidden bg-white border border-[#DCD1BE] shadow-xs group-hover/circle:border-2 group-hover/circle:border-[#A8875E] group-hover/circle:scale-105 group-hover/circle:shadow-md transition-all duration-300">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 104px"
                        className="object-cover object-center group-hover/circle:scale-110 transition-transform duration-500 ease-out"
                        priority={idx < 6}
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover/circle:bg-transparent transition-colors" />
                    </div>

                    {/* Category Title Centered Directly Beneath */}
                    <div className="mt-3 max-w-[90px] sm:max-w-[110px]">
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#2B2620] group-hover/circle:text-[#A8875E] transition-colors block line-clamp-1">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-[#6B6459] font-light block mt-0.5 line-clamp-1 hidden sm:block">
                        {cat.desc}
                      </span>
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
