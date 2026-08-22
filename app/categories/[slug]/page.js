import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import ProductGrid from '@/components/product/ProductGrid';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const category = await Category.findOne({ slug }).lean();

  if (!category) {
    return { title: 'Category Not Found | NÖRDIKA' };
  }

  return {
    title: `${category.name} Collection | NÖRDIKA Luxury Furniture`,
    description: category.description || `Handcrafted ${category.name} furniture pieces built with Scandinavian craftsmanship.`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  await connectDB();

  const [category, products] = await Promise.all([
    Category.findOne({ slug }).lean(),
    Product.find({ category: slug, status: 'published' })
      .sort({ isFeatured: -1, rating: -1 })
      .lean(),
  ]);

  if (!category && products.length === 0) {
    // If category doc doesn't exist yet, format a fallback title from slug
    const fallbackTitle = slug.replace('-', ' ');
    return (
      <div className="bg-[#FAF9F6] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Furniture</span>
            </Link>
            <h1 className="text-3xl font-serif-luxury font-bold text-stone-900 capitalize">
              {fallbackTitle}
            </h1>
          </div>
          <ProductGrid products={[]} emptyMessage={`No products currently available in this collection.`} />
        </div>
      </div>
    );
  }

  const serializedProducts = JSON.parse(JSON.stringify(products));

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-widest mb-4">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-stone-900">Collections</Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold">{category?.name || slug}</span>
        </div>

        {/* Category Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-12 shadow-sm border border-stone-200">
          <div className="h-64 sm:h-80 w-full relative">
            <img
              src={category?.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80'}
              alt={category?.name || slug}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent" />
            <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-center max-w-xl text-white">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-300 mb-2">
                Curated Collection
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold leading-tight">
                {category?.name || slug.replace('-', ' ')}
              </h1>
              {category?.description && (
                <p className="text-xs sm:text-sm text-stone-200 mt-2 leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Count & Filter link */}
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-stone-200 text-xs text-stone-600">
          <span>
            Displaying <strong>{serializedProducts.length}</strong> handcrafted pieces
          </span>
          <Link
            href="/shop"
            className="text-stone-900 font-semibold hover:text-amber-700 underline underline-offset-4"
          >
            Explore all other categories
          </Link>
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={serializedProducts}
          emptyMessage={`No published pieces currently in ${category?.name || slug}.`}
        />
      </div>
    </div>
  );
}
