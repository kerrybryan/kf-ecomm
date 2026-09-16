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
    return { title: 'Category Not Found | KB Furniture' };
  }

  return {
    title: `${category.name} | KB Furniture Addis Ababa`,
    description: category.description || `Solid wood ${category.name} furniture made with care in Addis Ababa, Ethiopia.`,
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
      <div className="bg-[#FAF8F5] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B8551F] hover:text-[#8F4116] mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Furniture</span>
            </Link>
            <h1 className="text-3xl font-heading font-extrabold text-[#201C18] capitalize">
              {fallbackTitle}
            </h1>
          </div>
          <ProductGrid products={[]} emptyMessage={`No products currently available in this category.`} />
        </div>
      </div>
    );
  }

  const serializedProducts = JSON.parse(JSON.stringify(products));

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B6459] uppercase tracking-wider mb-4">
          <Link href="/" className="hover:text-[#B8551F]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#B8551F]">Furniture</Link>
          <span>/</span>
          <span className="text-[#201C18] font-bold">{category?.name || slug}</span>
        </div>

        {/* Category Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-12 shadow-md border-2 border-[#E5DDD3]">
          <div className="h-64 sm:h-80 w-full relative">
            <img
              src={category?.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80'}
              alt={category?.name || slug}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1F1A15]/90 via-[#1F1A15]/50 to-transparent" />
            <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-center max-w-xl text-white">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#D99A2B] mb-2">
                CATEGORY
              </span>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold leading-tight">
                {category?.name || slug.replace('-', ' ')}
              </h1>
              {category?.description && (
                <p className="text-xs sm:text-sm text-stone-200 mt-2 leading-relaxed font-normal">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Count & Filter link */}
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#E5DDD3] text-xs text-[#6B6459]">
          <span>
            Displaying <strong>{serializedProducts.length}</strong> items
          </span>
          <Link
            href="/shop"
            className="text-[#B8551F] font-bold hover:text-[#8F4116] underline underline-offset-4"
          >
            See all other furniture
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
