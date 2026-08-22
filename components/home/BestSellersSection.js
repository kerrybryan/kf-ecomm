import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

export default function BestSellersSection({ products = [] }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-700 block mb-2">
              Most Coveted Pieces
            </span>
            <h2 className="text-3xl font-serif-luxury font-bold text-stone-900">
              Iconic Scandinavian Best Sellers
            </h2>
          </div>
          <Link
            href="/shop?sort=featured"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-900 hover:text-amber-700 transition-colors group"
          >
            <span>Browse All Best Sellers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((prod) => (
            <ProductCard key={prod._id || prod.slug} product={prod} />
          ))}
        </div>
      </div>
    </section>
  );
}
