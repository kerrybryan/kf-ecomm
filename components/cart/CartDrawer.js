'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import CartItem from './CartItem';

export default function CartDrawer() {
  const {
    items,
    itemsCount,
    subtotal,
    isFreeShipping,
    amountToFreeShipping,
    freeShippingProgress,
    freeShippingThreshold,
    isCartOpen,
    closeCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="text-base font-serif-luxury font-bold text-stone-900 tracking-wide">
                Your Shopping Bag ({itemsCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Milestone Indicator */}
          <div className="bg-stone-900 text-stone-200 px-6 py-3 text-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-amber-400" />
                {isFreeShipping ? (
                  <span className="text-amber-300 font-semibold">
                    You unlocked FREE White-Glove Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-white">{formatPrice(amountToFreeShipping)}</strong> more for Free White-Glove Delivery
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-medium text-stone-800">Your bag is empty</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                  Explore our curated Scandinavian collections to find handcrafted architectural pieces.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-6 bg-stone-900 text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-stone-800 transition-colors uppercase tracking-wider"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {items.map((item) => (
                  <CartItem key={`${item.productId}-${item.variantKey}`} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 text-sm">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>White-Glove Shipping</span>
                  <span className="font-medium text-stone-900">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      formatPrice(120)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>Estimated Tax & Duties</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 mt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure 256-Bit Encrypted Checkout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
