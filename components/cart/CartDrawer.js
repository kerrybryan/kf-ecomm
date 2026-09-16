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
          <div className="p-5 border-b border-[#E5DDD3] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#201C18]" />
              <h2 className="text-base font-heading font-extrabold text-[#201C18]">
                Your Shopping Bag ({itemsCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-[#6B6459] hover:text-[#201C18] hover:bg-[#E5DDD3] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Milestone Indicator */}
          <div className="bg-[#1F1A15] text-stone-200 px-6 py-3.5 text-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-[#D99A2B]" />
                {isFreeShipping ? (
                  <span className="text-[#D99A2B] font-bold">
                    You have FREE Delivery in Addis Ababa!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-white">{formatPrice(amountToFreeShipping)}</strong> more for Free Delivery
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 font-bold">
                {Math.round(freeShippingProgress)}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#D99A2B] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border-2 border-[#E5DDD3] flex items-center justify-center text-[#B8551F] mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#201C18]">Your cart is empty</h3>
                <p className="text-xs text-[#6B6459] mt-1 max-w-xs leading-relaxed">
                  Look at our furniture to find tables, sofas, and beds for your home.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-6 bg-[#B8551F] hover:bg-[#8F4116] text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors uppercase tracking-wider shadow-sm"
                >
                  Shop Furniture
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E5DDD3]">
                {items.map((item) => (
                  <CartItem key={`${item.productId}-${item.variantKey}`} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E5DDD3] bg-[#FAF8F5] space-y-4">
              <div className="space-y-1.5 text-xs text-[#6B6459]">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-extrabold text-[#B8551F] text-base">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Delivery</span>
                  <span className="font-bold text-[#201C18]">
                    {isFreeShipping ? (
                      <span className="text-[#4C7A3D]">FREE</span>
                    ) : (
                      formatPrice(1500)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6B6459]">
                  <span>Estimated 15% VAT</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-[#4C7A3D] hover:bg-[#3E6532] text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md group cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center justify-center gap-2 text-[11px] text-[#6B6459] mt-3 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#4C7A3D]" />
                  <span>Quality Guarantee • Cash on Delivery or Telebirr</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
