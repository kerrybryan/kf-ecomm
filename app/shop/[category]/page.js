import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductCard from '@/components/product/ProductCard';

export async function generateMetadata({ params }) {
  const { category: categorySlug } = await params;
  await connectDB();

  const querySlug = categorySlug.toLowerCase();
  const categoryInfo = await Category.findOne({
    $or: [{ slug: querySlug }, { name: new RegExp(`^${querySlug}$`, 'i') }],
  }).lean();

  const title = categoryInfo?.name || categorySlug.replace(/-/g, ' ').toUpperCase();
  const description =
    categoryInfo?.description ||
    `Browse solid wood ${title.toLowerCase()} furniture for your home in Addis Ababa, Ethiopia.`;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kbfurniture.et';
  const categoryUrl = `${siteUrl}/shop/${categorySlug}`;

  return {
    title: `${title} Furniture`,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title: `${title} Furniture | KB Furniture Addis Ababa`,
      description,
      url: categoryUrl,
      type: 'website',
      images: categoryInfo?.image ? [{ url: categoryInfo.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} Furniture | KB Furniture`,
      description,
      images: categoryInfo?.image ? [categoryInfo.image] : [],
    },
  };
}

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
    `Browse solid wood ${title.toLowerCase()} for your home.`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B6459] mb-8">
          <Link href="/" className="hover:text-[#B8551F] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#B8551F] transition-colors">
            Shop All
          </Link>
          <span>/</span>
          <span className="text-[#201C18] font-bold uppercase tracking-wider">{title}</span>
        </div>

        {/* Category Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-8 h-[2.5px] bg-[#B8551F] rounded-full" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#B8551F]">
              CATEGORY
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#201C18] tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-sm text-[#6B6459] font-normal leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-[#E5DDD3]">
            <p className="text-sm text-[#6B6459] mb-4">
              No products found in this category at this time.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#B8551F] hover:bg-[#8F4116] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
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
                className="inline-flex items-center gap-2 bg-[#B8551F] hover:bg-[#8F4116] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-[0.16em] transition-all shadow-md"
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
