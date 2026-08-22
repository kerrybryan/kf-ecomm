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
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 shadow-xs max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400 mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif-luxury font-bold text-stone-900">
              Your bag is currently empty
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto leading-relaxed">
              Explore our curated architectural furniture collections to start curating your living space.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block bg-stone-900 text-white text-xs font-semibold px-8 py-4 rounded-xl uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-md"
            >
              Discover Furniture
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Milestone */}
              <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    {isFreeShipping ? (
                      <span className="text-amber-300 font-semibold">
                        You unlocked FREE White-Glove Delivery!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-amber-400">{formatPrice(amountToFreeShipping)}</strong> more to get Free White-Glove Shipping
                      </span>
                    )}
                  </div>
                  <span className="text-stone-400 font-semibold">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs divide-y divide-stone-100">
                {items.map((item) => (
                  <CartItem key={`${item.productId}-${item.variantKey}`} item={item} />
                ))}
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
                  Delivery & Special Handling Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Specific gate codes, elevator access, or preferred delivery dates..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Exploring Catalog</span>
              </Link>
            </div>

            {/* Summary & Checkout Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 sticky top-28">
              <h3 className="text-lg font-serif-luxury font-bold text-stone-900 border-b border-stone-100 pb-4">
                Order Summary
              </h3>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. NORDIC10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs uppercase text-stone-900 focus:outline-none focus:border-stone-900"
                />
                <button
                  type="submit"
                  className="bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-stone-800 transition-colors"
                >
                  Apply
                </button>
              </form>
              {promoApplied && (
                <p className="text-xs text-emerald-700 font-medium">
                  ✓ 10% Scandinavian Welcome Discount Applied!
                </p>
              )}

              {/* Costs breakdown */}
              <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                {promoApplied && (
                  <div className="flex items-center justify-between text-emerald-700 font-medium">
                    <span>Promo Discount (10%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>White-Glove Shipping & Assembly</span>
                  <span className="font-semibold text-stone-900">
                    {isFreeShipping ? <span className="text-emerald-700">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-stone-900">{formatPrice(estimatedTax)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-stone-900 border-t border-stone-200 pt-3 mt-2">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-4 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Guaranteed Safe & Secure Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
