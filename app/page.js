import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Setting from '@/models/Setting';

import HeroSection from '@/components/home/HeroSection';
import TrustStrip from '@/components/home/TrustStrip';
import CategoryCircleSlider from '@/components/home/CategoryCircleSlider';
import BestSellingFilterableGrid from '@/components/home/BestSellingFilterableGrid';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BespokePromo from '@/components/home/BespokePromo';
import SectionHeader from '@/components/ui/SectionHeader';
import ProductCard from '@/components/product/ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// ISR: Cache homepage HTML for 60 seconds for instantaneous response times
export const revalidate = 60;

async function getHomepageData() {
  try {
    await connectDB();

    const [bestSellers, trendingProducts, categories, setting] = await Promise.all([
      Product.find({ status: 'published', deletedAt: null })
        .sort({ isBestSeller: -1, isFeatured: -1, rating: -1 })
        .limit(16)
        .lean(),
      Product.find({ status: 'published', deletedAt: null })
        .sort({ trending: -1, createdAt: -1, rating: -1 })
        .limit(8)
        .lean(),
      Category.find({}).sort({ order: 1, name: 1 }).limit(12).lean(),
      Setting.findOne({}).lean(),
    ]);

    return {
      bestSellers: JSON.parse(JSON.stringify(bestSellers)),
      trendingProducts: JSON.parse(JSON.stringify(trendingProducts)),
      categories: JSON.parse(JSON.stringify(categories)),
      setting: setting?.homepageSections || {},
    };
  } catch (error) {
    console.error('Error fetching homepage data from MongoDB:', error.message);
    return { bestSellers: [], trendingProducts: [], categories: [], setting: {} };
  }
}

export default async function HomePage() {
  const { bestSellers, trendingProducts, categories, setting } = await getHomepageData();

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      {/* 1. Hero Section — Bold full-width with animated headline */}
      <HeroSection />

      {/* 2. Trust Strip — 4-pillar value props directly below hero */}
      <TrustStrip />

      {/* 3. Shop by Category — Auto-Sliding Rounded Cards */}
      <CategoryCircleSlider categories={categories} />

      {/* 4. Primary Product Grid — "Today's Best Selling" with Filter Tabs */}
      <BestSellingFilterableGrid
        initialProducts={bestSellers}
        sectionTitle={setting?.bestSellersTitle}
        sectionSubtitle={setting?.bestSellersSubtitle}
      />

      {/* 5. Room Inspiration Banner — Full-bleed split layout */}
      <section
        id="room-inspiration-banner"
        className="bg-[#F3EEE7] border-t border-[#E5DDD3]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[360px] lg:min-h-[420px]">
            {/* Left: Image */}
            <div className="relative overflow-hidden order-2 lg:order-1 h-64 lg:h-auto">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85"
                alt="Living room with solid wood furniture"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1F1A15]/20 to-transparent" />
            </div>

            {/* Right: Copy */}
            <div className="flex flex-col justify-center px-8 py-12 lg:px-14 order-1 lg:order-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#B8551F] mb-3">
                ROOM IDEAS
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#201C18] leading-tight tracking-tight">
                Furnish Your Home With Quality Wood
              </h2>
              <p className="mt-4 text-sm text-[#6B6459] leading-relaxed max-w-md font-normal">
                Browse our room ideas and see how KB Furniture&apos;s solid wood
                pieces bring comfort and durability to your living space.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  id="inspiration-cta-shop"
                  href="/shop"
                  className="group inline-flex items-center gap-2 bg-[#B8551F] hover:bg-[#8F4116] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md"
                >
                  <span>Shop Furniture</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  id="inspiration-cta-categories"
                  href="/shop?category=living-room"
                  className="inline-flex items-center gap-2 bg-white border-2 border-[#E5DDD3] hover:border-[#B8551F] text-[#201C18] hover:text-[#B8551F] px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200"
                >
                  Living Room
                </Link>
                <Link
                  id="inspiration-cta-bedroom"
                  href="/shop?category=bedroom"
                  className="inline-flex items-center gap-2 bg-white border-2 border-[#E5DDD3] hover:border-[#B8551F] text-[#201C18] hover:text-[#B8551F] px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200"
                >
                  Bedroom
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Shop by Room — Featured Category Grid */}
      <FeaturedCategories />

      {/* 7. Trending Now — Secondary Product Grid */}
      <section
        id="trending-section"
        className="py-12 sm:py-16 bg-[#FAF8F5] border-t border-[#E5DDD3]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="TRENDING"
            title={setting?.trendingTitle || 'Trending Now'}
            subtitle={setting?.trendingSubtitle || 'Popular furniture for home and office'}
            viewAllLink="/shop?sort=newest"
            viewAllText="View All"
          />

          {trendingProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#E5DDD3]">
              <p className="text-xs text-[#6B6459] font-medium">No trending products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={`trending-${product._id || product.slug}`} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. Testimonials — Customer Reviews */}
      <TestimonialsSection />

      {/* 9. Bespoke Promo — Custom & Trade CTA */}
      <BespokePromo />
    </div>
  );
}
