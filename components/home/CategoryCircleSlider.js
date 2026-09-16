'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

// Curated category images — mixed CDN sources (Unsplash + Pexels) for resilience
// against upstream throttling. Pexels images are served via images.pexels.com CDN.
const DEFAULT_PRODUCT_CATEGORIES = [
  {
    name: 'Seating',
    slug: 'living-room',
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Sofas & Armchairs',
  },
  {
    name: 'Tables',
    slug: 'dining-room',
    image: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Dining & Coffee Tables',
  },
  {
    name: 'Storage',
    slug: 'storage',
    image: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Sideboards & Wardrobes',
  },
  {
    name: 'Beds',
    slug: 'bedroom',
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Beds & Nightstands',
  },
  {
    name: 'Doors & Fittings',
    slug: 'doors',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Interior & Barn Doors',
  },
  {
    name: 'Kitchen',
    slug: 'kitchen',
    image: 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Islands & Bar Stools',
  },
  {
    name: 'Outdoor',
    slug: 'outdoor',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Patio & Lounge',
  },
  {
    name: 'Office & Desks',
    slug: 'home-office',
    image: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Desks & Task Seating',
  },
  {
    name: 'Lighting & Decor',
    slug: 'lighting-decor',
    image: 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Pendants & Accents',
  },
  {
    name: 'Custom Made',
    slug: 'custom-order',
    image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400',
    desc: 'Bespoke Commissions',
  },
];

export default function CategoryCircleSlider({ categories = [] }) {

  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const scrollRef = useRef(null);

  // Merge MongoDB categories with descriptive fallback imagery
  const displayCategories =
    categories && categories.length >= 6
      ? categories.map((cat, idx) => ({
          ...DEFAULT_PRODUCT_CATEGORIES[idx % DEFAULT_PRODUCT_CATEGORIES.length],
          ...cat,
          name: cat.name || DEFAULT_PRODUCT_CATEGORIES[idx % DEFAULT_PRODUCT_CATEGORIES.length].name,
          slug: cat.slug || DEFAULT_PRODUCT_CATEGORIES[idx % DEFAULT_PRODUCT_CATEGORIES.length].slug,
          image:
            cat.image ||
            DEFAULT_PRODUCT_CATEGORIES[idx % DEFAULT_PRODUCT_CATEGORIES.length].image,
        }))
      : DEFAULT_PRODUCT_CATEGORIES;

  // Duplicate list for seamless infinite horizontal auto-scroll loop
  const duplicatedList = [...displayCategories, ...displayCategories];

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => {
    setTimeout(() => setIsPaused(false), 2000);
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="category-slider"
      className="py-10 sm:py-14 bg-[#FAF8F5] border-b border-[#E5DDD3] relative group/slider overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <SectionHeader
          eyebrow="CATEGORIES"
          title="Shop By Room & Category"
          viewAllLink="/shop"
          viewAllText="View All Furniture"
        />
      </div>

      {/* Sliding Carousel Track */}
      <div className="relative w-full">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl bg-white shadow-md border border-[#E5DDD3] items-center justify-center text-[#201C18] hover:text-[#B8551F] hover:border-[#B8551F] opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-xl bg-white shadow-md border border-[#E5DDD3] items-center justify-center text-[#201C18] hover:text-[#B8551F] hover:border-[#B8551F] opacity-0 group-hover/slider:opacity-100 transition-all cursor-pointer hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Horizontal Container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto no-scrollbar scroll-smooth"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            setHoveredIdx(null);
          }}
        >
          <div
            className={`animate-marquee-smooth gap-5 sm:gap-7 px-4 sm:px-8 ${
              isPaused ? 'is-paused' : ''
            }`}
          >
            {duplicatedList.map((cat, idx) => {
              const linkHref =
                cat.slug === 'custom-order'
                  ? '/custom-order'
                  : `/shop?category=${encodeURIComponent(cat.slug)}`;
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={`${cat.name}-${idx}`}
                  className="shrink-0 flex flex-col items-center text-center group/card cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <Link href={linkHref} className="flex flex-col items-center">
                    {/* Image with IKEA-style amber ring on hover */}
                    <div
                      className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-[130px] lg:h-[130px] rounded-2xl overflow-hidden bg-white border-2 transition-all duration-300"
                      style={{
                        borderColor: isHovered ? '#D99A2B' : '#E5DDD3',
                        boxShadow: isHovered
                          ? '0 0 0 3px rgba(217,154,43,0.18), 0 8px 24px rgba(0,0,0,0.12)'
                          : '0 1px 4px rgba(0,0,0,0.06)',
                        transform: isHovered ? 'translateY(-5px) scale(1.04)' : 'translateY(0) scale(1)',
                      }}
                    >
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 96px, (max-width: 1024px) 112px, 130px"
                        className="object-cover object-center transition-transform duration-500 ease-out"
                        style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                        priority={idx < 6}
                        unoptimized
                      />
                      <div
                        className="absolute inset-0 transition-colors duration-300"
                        style={{ background: isHovered ? 'transparent' : 'rgba(0,0,0,0.08)' }}
                      />
                    </div>

                    {/* Category label */}
                    <div className="mt-3 max-w-[110px] sm:max-w-[130px]">
                      <span
                        className="text-xs sm:text-[13px] font-bold block line-clamp-1 transition-colors duration-200"
                        style={{ color: isHovered ? '#B8551F' : '#201C18' }}
                      >
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-[#6B6459] font-normal block mt-0.5 line-clamp-1 hidden sm:block">
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
