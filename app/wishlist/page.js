'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { wishlist, wishlistCount, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [loadedProducts, setLoadedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // If wishlist contains ObjectIds or product objects, ensure we have full product details
  useEffect(() => {
    async function loadWishlistDetails() {
      try {
        setLoading(true);
        if (wishlist.length === 0) {
          setLoadedProducts([]);
          return;
        }

        // Check if items are already full objects
        const areFullObjects = wishlist.every((item) => typeof item === 'object' && item.name);
        if (areFullObjects) {
          setLoadedProducts(wishlist);
          return;
        }

        // Fetch products if wishlist contains IDs
        const ids = wishlist.map((item) => (typeof item === 'object' ? item._id : item));
        const res = await fetch('/api/products?limit=100');
        const data = await res.json();
        if (data.success) {
          const matched = data.data.filter((p) => ids.includes(p._id));
          setLoadedProducts(matched);
        }
      } catch (err) {
        console.error('Failed to load wishlist details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistDetails();
  }, [wishlist]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-widest mb-1">
              <Link href="/" className="hover:text-stone-900">Home</Link>
              <span>/</span>
              <span className="text-stone-900 font-semibold">Saved Wishlist</span>
            </div>
            <h1 className="text-3xl font-serif-luxury font-bold text-stone-900">
              Saved Moodboard & Wishlist ({loadedProducts.length})
            </h1>
          </div>
        </div>

        {loadedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 shadow-xs max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400 mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif-luxury font-bold text-stone-900">
              Your wishlist is empty
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto leading-relaxed">
              Tap the heart icon on any architectural furniture piece to save it to your private moodboard.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block bg-stone-900 text-white text-xs font-semibold px-8 py-4 rounded-xl uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-md"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadedProducts.map((prod) => (
              <ProductCard key={prod._id || prod.slug} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
