'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import ProductCard from '@/components/product/ProductCard';

const FILTER_PILLS = [
  { label: 'All Items', value: 'all' },
  { label: 'Seating', value: 'living-room' },
  { label: 'Tables', value: 'dining-room' },
  { label: 'Beds', value: 'bedroom' },
  { label: 'Storage', value: 'storage' },
  { label: 'Office', value: 'home-office' },
  { label: 'Decor', value: 'lighting-decor' },
  { label: 'Outdoor', value: 'outdoor' },
];

export default function BestSellingFilterableGrid({
  initialProducts = [],
  sectionTitle = "Today's Best Selling",
  sectionSubtitle = 'Solid wood furniture made for everyday living',
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [gridVisible, setGridVisible] = useState(true);
  const gridRef = useRef(null);

  // Compute counts per category
  const categoryCounts = useMemo(() => {
    const counts = { all: initialProducts.length };
    FILTER_PILLS.slice(1).forEach((pill) => {
      counts[pill.value] = initialProducts.filter(
        (p) => p.category === pill.value || p.category?.toLowerCase() === pill.value
      ).length;
    });
    return counts;
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedFilter === 'all') {
      return initialProducts.slice(0, 12);
    }
    const filtered = initialProducts.filter(
      (p) => p.category === selectedFilter || p.category?.toLowerCase() === selectedFilter
    );
    return filtered.length > 0 ? filtered : initialProducts.slice(0, 8);
  }, [selectedFilter, initialProducts]);

  const handleFilterChange = (value) => {
    if (value === selectedFilter) return;
    // Fade out → change → fade in
    setGridVisible(false);
    setTimeout(() => {
      setSelectedFilter(value);
      setGridVisible(true);
    }, 200);
  };

  return (
    <section
      id="best-selling-section"
      className="py-12 sm:py-16 bg-[#FAF8F5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          eyebrow="POPULAR"
          title={sectionTitle || "Today's Best Selling"}
          subtitle={sectionSubtitle}
          viewAllLink="/shop?sort=featured"
          viewAllText="View All"
        />

        {/* Filter Pills */}
        <div
          id="filter-pills"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {FILTER_PILLS.map((pill) => {
            const isActive = selectedFilter === pill.value;
            const count = categoryCounts[pill.value] ?? 0;
            return (
              <button
                key={pill.value}
                id={`filter-pill-${pill.value}`}
                type="button"
                onClick={() => handleFilterChange(pill.value)}
                className="relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer overflow-hidden"
                style={{
                  background: isActive ? '#D99A2B' : 'white',
                  color: isActive ? 'white' : '#201C18',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: isActive ? '#D99A2B' : '#E5DDD3',
                  boxShadow: isActive ? '0 2px 12px rgba(217,154,43,0.30)' : 'none',
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <span>{pill.label}</span>
                {count > 0 && (
                  <span
                    className="ml-1.5 text-[10px] font-semibold opacity-75"
                  >
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Product Grid with fade transition */}
        <div
          ref={gridRef}
          style={{
            opacity: gridVisible ? 1 : 0,
            transform: gridVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#E5DDD3]">
              <p className="text-xs text-[#6B6459] font-medium">
                No products found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id || product.slug} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* CTA Button — outlined with fill-on-hover */}
        <div className="mt-12 text-center">
          <Link
            id="view-all-products-cta"
            href="/shop"
            className="group inline-flex items-center gap-2 border-2 border-[#B8551F] text-[#B8551F] hover:bg-[#B8551F] hover:text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-[0.16em] transition-all duration-200 hover:shadow-lg hover:shadow-[#B8551F]/20 hover:-translate-y-0.5"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
}
