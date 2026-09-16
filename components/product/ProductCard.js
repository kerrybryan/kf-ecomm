'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFavorite = isInWishlist(product._id);
  const primaryImage =
    product.images?.[0] ||
    'https://picsum.photos/seed/kb-furniture-sofa/600/600';
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, {
      color: product.colors?.[0] || '',
      material: product.materials?.[0] || '',
    });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border-2 border-[#E5DDD3] hover:shadow-xl hover:border-[#B8551F] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container on Warm Light Background */}
      <div className="relative aspect-square bg-[#F3EEE7]/60 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={imgError ? 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=75' : (isHovered && secondaryImage ? secondaryImage : primaryImage)}
            alt={`${product.name} — KB Furniture`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out p-3"
            onError={() => setImgError(true)}
          />
        </Link>

        {/* Heart Wishlist Icon top-right */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 z-10 cursor-pointer ${
            isFavorite
              ? 'bg-white text-[#B8551F] shadow-sm ring-1 ring-[#B8551F]/30'
              : 'bg-white/90 hover:bg-white text-[#6B6459] hover:text-[#B8551F] shadow-xs'
          }`}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#B8551F] text-[#B8551F]' : ''}`} />
        </button>

        {/* Full-width "Add to Cart" slide-up button on Hover (Green Accent) */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-[#4C7A3D] hover:bg-[#3E6532] text-white py-3 px-4 text-xs font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white/90" />
            <span>Add To Cart</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Star rating row */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center gap-0.5 text-[#D99A2B]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(product.rating || 5)
                      ? 'fill-[#D99A2B]'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#6B6459] font-medium">
              ({product.reviewCount || 14})
            </span>
          </div>

          {/* Product Name */}
          <Link
            href={`/products/${product.slug}`}
            className="block text-xs sm:text-[13px] font-bold text-[#201C18] hover:text-[#B8551F] transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        {/* Price in Big Bold Terracotta */}
        <div className="mt-3 pt-2.5 border-t border-[#E5DDD3] flex items-baseline justify-between">
          <span className="text-base sm:text-lg font-extrabold text-[#B8551F]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-[#6B6459] line-through font-normal">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
