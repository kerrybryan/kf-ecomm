import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductCard from '@/components/product/ProductCard';

export default async function CategoryShopPage({ params }) {
  const { category: categorySlug } = await params;
  let products = [];
  let categoryInfo = null;

  try {
    await connectDB();

    // Map common slug variations
    const querySlug = categorySlug.toLowerCase();
    categoryInfo = await Category.findOne({
      $or: [{ slug: querySlug }, { name: new RegExp(`^${querySlug}$`, 'i') }],
    }).lean();

    products = await Product.find({
      status: 'published',
      $or: [
        { category: querySlug },
        { category: categoryInfo?.slug || '' },
        { category: new RegExp(querySlug, 'i') },
      ],
    })
      .sort({ isFeatured: -1, rating: -1 })
      .lean();
  } catch (err) {
    console.error('Error fetching category shop products:', err);
  }

  const title = categoryInfo?.name || categorySlug.replace(/-/g, ' ').toUpperCase();
  const description =
    categoryInfo?.description ||
    `Explore our curated Scandinavian collection of handcrafted ${title.toLowerCase()}.`;

  return (
    <div className="min-h-screen bg-[#F3ECE1] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B6459] mb-8">
          <Link href="/" className="hover:text-[#1A1613] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#1A1613] transition-colors">
            Shop All
          </Link>
          <span>/</span>
          <span className="text-[#1A1613] font-medium uppercase tracking-wider">{title}</span>
        </div>

        {/* Category Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-6 h-[1.5px] bg-[#A8875E]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#A8875E]">
              COLLECTION
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-heading font-bold text-[#2B2620] uppercase tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-sm text-[#6B6459] font-light leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#DCD1BE]">
            <p className="text-sm text-[#6B6459] mb-4">
              No products found in this category at this time.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#1A1613] hover:bg-[#332c26] text-white px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Browse All Furniture</span>
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={JSON.parse(JSON.stringify(product))} />
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 border border-[#A8875E] hover:border-[#1A1613] hover:bg-[#1A1613] text-[#2B2620] hover:text-[#F3ECE1] px-8 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-[0.16em] transition-all shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back To All Furniture</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
