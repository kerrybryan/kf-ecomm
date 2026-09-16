'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import ProductGallery from './ProductGallery';
import ReviewSection from './ReviewSection';
import ProductCard from './ProductCard';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductDetailClient({ product, reviews = [], relatedProducts = [] }) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedMaterial, setSelectedMaterial] = useState(product.materials?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('specs'); // 'specs' | 'materials' | 'shipping' | 'care'

  const isFavorite = isInWishlist(product._id);

  const handleAddToCart = () => {
    addItem(product, quantity, {
      color: selectedColor,
      material: selectedMaterial,
    });
  };

  const handleBuyNow = () => {
    addItem(product, quantity, {
      color: selectedColor,
      material: selectedMaterial,
    });
    router.push('/checkout');
  };

  const toggleTab = (tab) => {
    setOpenAccordion(openAccordion === tab ? null : tab);
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-stone-900">Home</Link>
          <span>/</span>
          <Link href={`/categories/${product.category}`} className="hover:text-stone-900 capitalize">
            {product.category?.replace('-', ' ')}
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            {/* Header / Category / Rating */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-700">
                  {product.category?.replace('-', ' ')}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                  <Check className="w-3 h-3" />
                  {product.inStock ? 'In Stock & Ready to Ship' : 'Backorder / Made to Order'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating review link */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-900">{product.rating || 5.0}</span>
                <a href="#reviews" className="text-stone-500 hover:text-stone-900 underline ml-1">
                  ({reviews.length || product.reviewCount || 0} reviews)
                </a>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-3 border-t border-stone-200">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#B8551F]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-stone-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-[#201C18] leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Color Swatch Picker */}
            {product.colors && product.colors.length > 0 && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#201C18] uppercase tracking-wider mb-2.5">
                  Select Color:{' '}
                  <span className="font-normal text-[#6B6459]">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3.5 py-2 rounded-xl text-xs transition-all border-2 ${
                        selectedColor === col
                          ? 'border-[#B8551F] bg-[#B8551F] text-white font-bold shadow-xs'
                          : 'border-[#E5DDD3] bg-white text-[#201C18] hover:border-[#B8551F]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material Picker */}
            {product.materials && product.materials.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#201C18] uppercase tracking-wider mb-2.5">
                  Material:{' '}
                  <span className="font-normal text-[#6B6459]">{selectedMaterial}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-3.5 py-2 rounded-xl text-xs transition-all border-2 ${
                        selectedMaterial === mat
                          ? 'border-[#B8551F] bg-[#B8551F] text-white font-bold shadow-xs'
                          : 'border-[#E5DDD3] bg-white text-[#201C18] hover:border-[#B8551F]'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Wishlist */}
            <div className="pt-2 flex items-center gap-4">
              <div className="flex items-center border-2 border-[#E5DDD3] rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-[#F3EEE7] text-[#201C18] rounded-lg transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-[#201C18]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-[#F3EEE7] text-[#201C18] rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border-2 transition-colors flex items-center justify-center ${
                  isFavorite
                    ? 'border-[#B8551F] bg-white text-[#B8551F]'
                    : 'border-[#E5DDD3] bg-white text-[#6B6459] hover:border-[#B8551F] hover:text-[#B8551F]'
                }`}
                title={isFavorite ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#B8551F]' : ''}`} />
              </button>
            </div>

            {/* CTAs: Add to Cart & Buy Now */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-[#4C7A3D] hover:bg-[#3E6532] text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-white/90" />
                <span>Add to Cart • {formatPrice(product.price * quantity)}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full bg-[#B8551F] hover:bg-[#8F4116] text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-[#E5DDD3] grid grid-cols-2 gap-3 text-xs text-[#6B6459]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B8551F] shrink-0" />
                <span className="font-medium text-[#201C18]">Free Delivery over 50,000 Birr</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B8551F] shrink-0" />
                <span className="font-medium text-[#201C18]">10-Year Quality Guarantee</span>
              </div>
            </div>

            {/* Expandable Accordions */}
            <div className="pt-4 border-t border-[#E5DDD3] divide-y divide-[#E5DDD3]">
              {/* Specs */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleTab('specs')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#201C18]"
                >
                  <span>Size & Dimensions</span>
                  {openAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'specs' && (
                  <div className="mt-3 text-xs text-[#6B6459] space-y-1.5 leading-relaxed animate-in fade-in">
                    <p><strong>Dimensions:</strong> {product.specs?.dimensions || 'Standard size'}</p>
                    <p><strong>Weight:</strong> {product.specs?.weight || 'Solid wood frame'}</p>
                    <p><strong>Assembly:</strong> {product.specs?.assembly || 'Simple assembly. Easy to set up.'}</p>
                    <p><strong>Warranty:</strong> {product.specs?.warranty || '10-Year Guarantee'}</p>
                  </div>
                )}
              </div>

              {/* Material Details */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleTab('materials')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#201C18]"
                >
                  <span>Materials & Craft</span>
                  {openAccordion === 'materials' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'materials' && (
                  <div className="mt-3 text-xs text-[#6B6459] leading-relaxed animate-in fade-in">
                    <p>{product.specs?.materialDetails || 'Made from natural solid wood and strong fabric.'}</p>
                  </div>
                )}
              </div>

              {/* Care Instructions */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleTab('care')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#201C18]"
                >
                  <span>Care & Cleaning</span>
                  {openAccordion === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'care' && (
                  <div className="mt-3 text-xs text-[#6B6459] leading-relaxed animate-in fade-in">
                    <p>{product.specs?.care || 'Wipe with a clean dry cloth. Keep away from water.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <ReviewSection
          productId={product._id}
          initialReviews={reviews}
          averageRating={product.rating || 5.0}
          reviewCount={reviews.length || product.reviewCount || 0}
        />

        {/* Related Recommendation Carousel */}
        {relatedProducts.length > 0 && (
          <div className="py-14 border-t border-[#E5DDD3]">
            <div className="mb-8">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#B8551F] block mb-1">
                MORE FURNITURE
              </span>
              <h2 className="text-2xl font-heading font-extrabold text-[#201C18]">
                Similar Pieces
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel._id || rel.slug} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
