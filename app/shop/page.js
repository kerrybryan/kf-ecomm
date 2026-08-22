'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, ArrowUpDown, X, Loader2, Sparkles } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [material, setMaterial] = useState(searchParams.get('material') || '');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const searchQuery = searchParams.get('search') || '';

  const fetchFilteredProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (material) params.set('material', material);
      if (priceRange.min) params.set('minPrice', priceRange.min);
      if (priceRange.max) params.set('maxPrice', priceRange.max);
      if (inStockOnly) params.set('inStock', 'true');
      if (sortBy) params.set('sort', sortBy);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching catalog products:', err);
    } finally {
      setLoading(false);
    }
  }, [category, material, priceRange, inStockOnly, sortBy, searchQuery]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const newParams = new URLSearchParams(searchParams.toString());
    if (newCat === 'all') newParams.delete('category');
    else newParams.set('category', newCat);
    router.replace(`/shop?${newParams.toString()}`, { scroll: false });
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange({ min, max });
    const newParams = new URLSearchParams(searchParams.toString());
    if (min) newParams.set('minPrice', min);
    else newParams.delete('minPrice');
    if (max) newParams.set('maxPrice', max);
    else newParams.delete('maxPrice');
    router.replace(`/shop?${newParams.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    setCategory('all');
    setMaterial('');
    setPriceRange({ min: '', max: '' });
    setInStockOnly(false);
    setSortBy('featured');
    router.replace('/shop', { scroll: false });
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-widest mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Complete Catalog</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Scandinavian Furniture Collection'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
                Enduring silhouettes crafted from solid European white oak, natural travertine stone,
                and textured tactile bouclé.
              </p>
            </div>

            {/* Sort Dropdown & Mobile Filter Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-stone-300 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-800 shadow-xs"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="relative flex items-center bg-white border border-stone-300 rounded-xl px-3 py-2 shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 mr-2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="featured">Featured & Curated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <ProductFilters
                activeCategory={category}
                onCategoryChange={handleCategoryChange}
                activeMaterial={material}
                onMaterialChange={setMaterial}
                activePriceRange={priceRange}
                onPriceRangeChange={handlePriceRangeChange}
                inStockOnly={inStockOnly}
                onInStockChange={setInStockOnly}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onResetFilters={handleResetFilters}
                totalCount={products.length}
              />
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center text-stone-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-stone-700" />
                <p className="text-xs uppercase tracking-widest font-semibold">
                  Loading Curated Pieces...
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-2 border-b border-stone-200">
                  <span>
                    Showing <strong>{products.length}</strong> handcrafted pieces
                  </span>
                  {category !== 'all' && (
                    <span className="bg-amber-100/80 text-amber-900 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize">
                      {category.replace('-', ' ')}
                    </span>
                  )}
                </div>

                <ProductGrid
                  products={products}
                  emptyMessage="No furniture matched your active filters. Try adjusting price ranges or clearing filters."
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white p-6 shadow-2xl z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Filter Catalog
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-stone-500 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ProductFilters
              activeCategory={category}
              onCategoryChange={(cat) => {
                handleCategoryChange(cat);
                setMobileFilterOpen(false);
              }}
              activeMaterial={material}
              onMaterialChange={(mat) => {
                setMaterial(mat);
                setMobileFilterOpen(false);
              }}
              activePriceRange={priceRange}
              onPriceRangeChange={(min, max) => {
                handlePriceRangeChange(min, max);
                setMobileFilterOpen(false);
              }}
              inStockOnly={inStockOnly}
              onInStockChange={(val) => {
                setInStockOnly(val);
                setMobileFilterOpen(false);
              }}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onResetFilters={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
              totalCount={products.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
