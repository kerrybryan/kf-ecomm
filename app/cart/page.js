'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import CartItem from '@/components/cart/CartItem';

export default function CartPage() {
  const {
    items,
    itemsCount,
    subtotal,
    shippingFee,
    estimatedTax,
    total,
    isFreeShipping,
    amountToFreeShipping,
    freeShippingProgress,
    clearCart,
  } = useCart();

  const [orderNotes, setOrderNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'NORDIC10') {
      setPromoApplied(true);
    } else {
      alert('Invalid promo code. Try "NORDIC10" for 10% off.');
    }
  };

  const discountAmount = promoApplied ? subtotal * 0.1 : 0;
  const finalTotal = Math.max(0, total - discountAmount);

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-widest mb-1">
              <Link href="/" className="hover:text-stone-900">Home</Link>
              <span>/</span>
              <span className="text-stone-900 font-semibold">Shopping Bag</span>
            </div>
            <h1 className="text-3xl font-serif-luxury font-bold text-stone-900">
              Shopping Bag ({itemsCount})
            </h1>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-stone-500 hover:text-rose-600 font-medium transition-colors"
            >
              Clear Bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 sm:p-16 text-center border-2 border-[#E5DDD3] shadow-xs max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 bg-[#FAF8F5] border-2 border-[#E5DDD3] rounded-2xl flex items-center justify-center mx-auto text-[#B8551F] mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-[#201C18]">
              Your cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6459] mt-2 max-w-md mx-auto leading-relaxed">
              Look at our furniture collection to find solid wood tables, comfortable sofas, and beds.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block bg-[#B8551F] text-white text-xs font-bold px-8 py-4 rounded-xl uppercase tracking-wider hover:bg-[#8F4116] transition-colors shadow-md"
            >
              Shop Furniture
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Milestone */}
              <div className="bg-[#1F1A15] text-white rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D99A2B]" />
                    {isFreeShipping ? (
                      <span className="text-[#D99A2B] font-bold">
                        You unlocked FREE Delivery in Addis Ababa!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-[#D99A2B] font-bold">{formatPrice(amountToFreeShipping)}</strong> more to get Free Delivery
                      </span>
                    )}
                  </div>
                  <span className="text-stone-400 font-bold">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D99A2B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E5DDD3] shadow-xs divide-y divide-[#E5DDD3]">
                {items.map((item) => (
                  <CartItem key={`${item.productId}-${item.variantKey}`} item={item} />
                ))}
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl p-6 border-2 border-[#E5DDD3] shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#201C18] mb-2">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="House number, landmark, floor, or preferred delivery time..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] resize-none"
                />
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B8551F] hover:text-[#8F4116] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Summary & Checkout Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E5DDD3] shadow-xs space-y-6 sticky top-28">
              <h3 className="text-lg font-heading font-extrabold text-[#201C18] border-b border-[#E5DDD3] pb-4">
                Order Summary
              </h3>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs uppercase text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
                <button
                  type="submit"
                  className="bg-[#201C18] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#B8551F] transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {promoApplied && (
                <p className="text-xs text-[#4C7A3D] font-bold">
                  ✓ 10% Discount Applied!
                </p>
              )}

              {/* Costs breakdown */}
              <div className="space-y-2.5 text-xs text-[#6B6459] border-t border-[#E5DDD3] pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-[#201C18]">{formatPrice(subtotal)}</span>
                </div>
                {promoApplied && (
                  <div className="flex items-center justify-between text-[#4C7A3D] font-bold">
                    <span>Promo Discount (10%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Delivery</span>
                  <span className="font-bold text-[#201C18]">
                    {isFreeShipping ? <span className="text-[#4C7A3D] font-bold">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">15% VAT</span>
                  <span className="font-bold text-[#201C18]">{formatPrice(estimatedTax)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-extrabold text-[#B8551F] border-t border-[#E5DDD3] pt-3 mt-2">
                  <span>Total</span>
                  <span className="text-xl">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-[#4C7A3D] hover:bg-[#3E6532] text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#6B6459] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#4C7A3D]" />
                <span>Fast Delivery • Cash on Delivery or Telebirr</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
