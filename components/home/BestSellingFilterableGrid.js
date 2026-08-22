'use client';

import React, { useState, useMemo } from 'react';
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
  sectionSubtitle = 'Artisanal creations designed for modern living',
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    if (selectedFilter === 'all') {
      return initialProducts.slice(0, 12);
    }
    const filtered = initialProducts.filter(
      (p) => p.category === selectedFilter || p.category?.toLowerCase() === selectedFilter
    );
    // If not enough filtered items in current slice, show matching or top items
    return filtered.length > 0 ? filtered : initialProducts.slice(0, 8);
  }, [selectedFilter, initialProducts]);

  return (
    <section className="py-14 sm:py-20 bg-[#F3ECE1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          eyebrow="TOP SELECTION"
          title={sectionTitle || "Today's Best Selling"}
          subtitle={sectionSubtitle}
          viewAllLink="/shop?sort=featured"
          viewAllText="View All"
        />

        {/* Optional Pill-Style Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          {FILTER_PILLS.map((pill) => {
            const isActive = selectedFilter === pill.value;
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => setSelectedFilter(pill.value)}
                className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1613] text-[#F3ECE1] shadow-xs font-semibold'
                    : 'bg-white/80 hover:bg-white text-[#2B2620] border border-[#DCD1BE]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-[#DCD1BE]">
            <p className="text-xs text-[#6B6459]">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        )}

        {/* Centered CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border border-[#A8875E] hover:border-[#1A1613] hover:bg-[#1A1613] text-[#2B2620] hover:text-[#F3ECE1] px-8 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-[0.16em] transition-all shadow-xs"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
