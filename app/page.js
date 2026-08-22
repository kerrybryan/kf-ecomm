import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Setting from '@/models/Setting';
import CategoryCircleSlider from '@/components/home/CategoryCircleSlider';
import BestSellingFilterableGrid from '@/components/home/BestSellingFilterableGrid';
import SectionHeader from '@/components/ui/SectionHeader';
import ProductCard from '@/components/product/ProductCard';

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
    <div className="flex flex-col min-h-screen bg-[#F3ECE1]">
      {/* 1. Shop by Category — Auto-Sliding Circular Icons (Directly below Navbar, No Hero) */}
      <CategoryCircleSlider categories={categories} />

      {/* 2. Primary Product Grid — "Today's Best Selling" with Pill Filter Tabs (Background: #F3ECE1) */}
      <BestSellingFilterableGrid
        initialProducts={bestSellers}
        sectionTitle={setting?.bestSellersTitle}
        sectionSubtitle={setting?.bestSellersSubtitle}
      />

      {/* 3. Secondary Product Grid — "Trending Now" (Alternating Background: #EAE1D2) */}
      <section className="py-14 sm:py-20 bg-[#EAE1D2] border-t border-[#DCD1BE]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="CURATED SPOTLIGHT"
            title={setting?.trendingTitle || 'Trending Now'}
            subtitle={setting?.trendingSubtitle || 'What customers are loving this month'}
            viewAllLink="/shop?sort=newest"
            viewAllText="View All"
          />

          {trendingProducts.length === 0 ? (
            <div className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-[#DCD1BE]">
              <p className="text-xs text-[#6B6459]">No trending products available yet.</p>
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
    </div>
  );
}
