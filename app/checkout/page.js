'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  Loader2,
  Lock,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, estimatedTax, total, isFreeShipping, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    apartment: user?.addresses?.[0]?.apartment || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || 'WA',
    postalCode: user?.addresses?.[0]?.postalCode || '',
    country: 'United States',
    paymentMethod: 'credit_card',
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '888',
    deliveryNotes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      addToast('Your bag is empty. Please add items to checkout.', 'error');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.postalCode) {
      addToast('Please complete all required shipping and contact details.', 'error');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            apartment: formData.apartment,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
        },
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: {
            color: item.variant?.color || '',
            material: item.variant?.material || '',
          },
          image: item.image || '',
        })),
        paymentMethod: formData.paymentMethod,
        deliveryNotes: formData.deliveryNotes,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to place order');
      }

      // Clear local cart
      clearCart();
      addToast('Order confirmed! Generating receipt...', 'success');

      // Redirect to Order Detail Confirmation page
      router.push(`/orders/${result.data._id || result.data.orderNumber}`);
    } catch (err) {
      console.error('Order creation error:', err);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen py-20">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-stone-200 text-center shadow-xs">
          <h2 className="text-xl font-serif-luxury font-bold text-stone-900 mb-2">No Items in Bag</h2>
          <p className="text-xs text-stone-500 mb-6">
            Please add handcrafted Scandinavian furniture pieces before checking out.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-stone-900 text-white text-xs font-semibold px-6 py-3.5 rounded-xl uppercase tracking-wider hover:bg-stone-800"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-widest mb-6">
          <Link href="/cart" className="hover:text-stone-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Bag</span>
          </Link>
        </div>

        <h1 className="text-3xl font-serif-luxury font-bold text-stone-900 mb-8">
          Secure White-Glove Checkout
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Section (Contact & Shipping) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Customer Info */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                    1. Contact Information
                  </h2>
                  {!isAuthenticated && (
                    <Link href="/login" className="text-xs text-amber-700 hover:underline font-medium">
                      Already have an account? Sign In
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Astrid Lindgren"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="astrid@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Mobile Phone (for delivery coordination) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+1 (206) 555-0199"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Destination */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
                  2. White-Glove Delivery Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      placeholder="1200 4th Avenue"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      placeholder="Penthouse 14B"
                      value={formData.apartment}
                      onChange={handleChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Seattle"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="WA"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        placeholder="98101"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method Selection */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                    3. Payment Selection
                  </h2>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>SSL Encrypted</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer bg-stone-50 border-stone-900">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={formData.paymentMethod === 'credit_card'}
                      onChange={handleChange}
                      className="text-stone-900 focus:ring-stone-900"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">Credit / Debit Card (Simulated)</span>
                      <CreditCard className="w-4 h-4 text-stone-700" />
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 border border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="apple_pay"
                      checked={formData.paymentMethod === 'apple_pay'}
                      onChange={handleChange}
                      className="text-stone-900 focus:ring-stone-900"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-800">Apple Pay / Google Pay</span>
                      <span className="text-[11px] bg-stone-200 px-2 py-0.5 rounded font-mono">1-Touch</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 border border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleChange}
                      className="text-stone-900 focus:ring-stone-900"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-medium text-stone-800">Direct Wire Transfer (Trade Orders)</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 sticky top-28">
              <h3 className="text-lg font-serif-luxury font-bold text-stone-900 border-b border-stone-100 pb-4">
                Order Review ({items.reduce((s, i) => s + i.quantity, 0)} Items)
              </h3>

              {/* Items List Preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantKey}`} className="flex gap-3 py-3 text-xs">
                    <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900 line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        Qty: {item.quantity} {item.variant?.color ? `• ${item.variant.color}` : ''}
                      </p>
                      <p className="font-bold text-stone-900 mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>White-Glove In-Home Assembly</span>
                  <span className="font-semibold text-stone-900">
                    {isFreeShipping ? <span className="text-emerald-700 font-bold">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-stone-900">{formatPrice(estimatedTax)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-stone-900 border-t border-stone-200 pt-3 mt-2">
                  <span>Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order • {formatPrice(total)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-stone-500 text-center space-y-1">
                <p>30-Day In-Home Trial with complimentary returns.</p>
                <p className="text-stone-400">By placing order, you agree to NÖRDIKA Terms of Sourcing.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
