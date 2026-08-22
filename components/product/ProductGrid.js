'use client';

import React from 'react';
import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';

export default function ProductGrid({ products = [], emptyMessage = 'No products found matching your selection.' }) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center my-8">
        <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400 mb-3">
          <PackageOpen className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-stone-800">No pieces found</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {products.map((product) => (
        <ProductCard key={product._id || product.slug} product={product} />
      ))}
    </div>
  );
}
