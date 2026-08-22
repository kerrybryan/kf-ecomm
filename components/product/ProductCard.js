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

  const isFavorite = isInWishlist(product._id);
  const primaryImage =
    product.images?.[0] ||
    'https://picsum.photos/seed/nordika-sofa/600/600';
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
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#DCD1BE] hover:shadow-xl hover:border-[#A8875E]/70 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container on Light Background */}
      <div className="relative aspect-square bg-[#F3ECE1]/60 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out p-3"
          />
        </Link>

        {/* Heart Wishlist Icon top-right */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 z-10 ${
            isFavorite
              ? 'bg-white text-[#1A1613] shadow-sm ring-1 ring-[#1A1613]/20'
              : 'bg-white/90 hover:bg-white text-[#6B6459] hover:text-[#1A1613] shadow-xs'
          }`}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#1A1613] text-[#1A1613]' : ''}`} />
        </button>

        {/* Full-width "Add to Cart" slide-up button on Hover */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-[#1A1613] hover:bg-[#332c26] text-white py-3 px-4 text-xs font-semibold uppercase tracking-[0.14em] flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#A8875E]" />
            <span>Add To Cart</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Star rating row */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center gap-0.5 text-[#A8875E]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(product.rating || 5)
                      ? 'fill-[#A8875E]'
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
            className="block text-xs sm:text-[13px] font-medium text-[#2B2620] hover:text-[#A8875E] transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        {/* Price in Bold Dark */}
        <div className="mt-3 pt-2.5 border-t border-[#F3ECE1] flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-[#1A1613]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-[#6B6459] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
