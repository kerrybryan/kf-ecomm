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
    city: user?.addresses?.[0]?.city || 'Addis Ababa',
    state: user?.addresses?.[0]?.state || 'Addis Ababa',
    postalCode: user?.addresses?.[0]?.postalCode || '1000',
    country: 'Ethiopia',
    paymentMethod: 'cash_on_delivery',
    cardNumber: '•••• •••• •••• 4242',
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
      addToast('Your cart is empty. Please add items to checkout.', 'error');
      return;
    }

    if (!formData.name || !formData.phone || !formData.street || !formData.city) {
      addToast('Please enter your name, phone number, and delivery address.', 'error');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customer: {
          name: formData.name,
          email: formData.email || 'customer@kbfurniture.com',
          phone: formData.phone,
          address: {
            street: formData.street,
            apartment: formData.apartment,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode || '1000',
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
      addToast('Order placed successfully! We will contact you soon.', 'success');

      // Redirect to Order Detail Confirmation page
      router.push(`/orders/${result.data._id || result.data.orderNumber}`);
    } catch (err) {
      console.error('Checkout error:', err);
      addToast(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen py-20">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border-2 border-[#E5DDD3] text-center shadow-xs">
          <h2 className="text-xl font-heading font-extrabold text-[#201C18] mb-2">No Items in Bag</h2>
          <p className="text-xs text-[#6B6459] mb-6">
            Please add furniture pieces before checking out.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#B8551F] text-white text-xs font-bold px-6 py-3.5 rounded-xl uppercase tracking-wider hover:bg-[#8F4116]"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B8551F] hover:text-[#8F4116] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping Cart</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#201C18] mb-8">
          Checkout
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Section (Contact & Shipping) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Customer Info */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E5DDD3] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#201C18]">
                    1. Contact Details
                  </h2>
                  {!isAuthenticated && (
                    <Link href="/login" className="text-xs text-[#B8551F] hover:underline font-bold">
                      Have an account? Log In
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Abebe Kebede"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      Phone Number (for delivery call) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+251 911 234 567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="abebe@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Destination */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E5DDD3] shadow-xs space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#201C18] border-b border-[#E5DDD3] pb-3">
                  2. Delivery Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Addis Ababa"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      Sub-City / Area *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="e.g. Bole, Yeka, Kirkos, Hawassa"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      Street Address / House / Landmark *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      placeholder="e.g. Near Edna Mall, House #204, Cameroon St"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      Building / Floor / Extra Details (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      placeholder="e.g. 3rd Floor, Apartment 3B"
                      value={formData.apartment}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method Selection */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E5DDD3] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#201C18]">
                    3. Payment Method
                  </h2>
                  <div className="flex items-center gap-1 text-[11px] text-[#4C7A3D] font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Safe & Verified</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Primary Option 1: Cash on Delivery */}
                  <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    formData.paymentMethod === 'cash_on_delivery' ? 'bg-[#FAF8F5] border-[#B8551F] shadow-xs' : 'border-[#E5DDD3] hover:bg-[#FAF8F5]'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={handleChange}
                      className="text-[#B8551F] focus:ring-[#B8551F] mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#201C18]">Cash on Delivery (Recommended)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Most Popular</span>
                      </div>
                      <p className="text-[11px] text-[#6B6459] mt-0.5">Pay in cash or Telebirr after your furniture is delivered and inspected.</p>
                    </div>
                  </label>

                  {/* Primary Option 2: Bank Transfer / Telebirr */}
                  <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    formData.paymentMethod === 'bank_transfer' ? 'bg-[#FAF8F5] border-[#B8551F] shadow-xs' : 'border-[#E5DDD3] hover:bg-[#FAF8F5]'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleChange}
                      className="text-[#B8551F] focus:ring-[#B8551F] mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#201C18]">Bank Transfer / Telebirr</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">CBE / Telebirr</span>
                      </div>
                      <p className="text-[11px] text-[#6B6459] mt-0.5">Commercial Bank of Ethiopia (CBE), Telebirr, Awash Bank, or Dashen Bank.</p>
                    </div>
                  </label>

                  {/* Optional Option 3: Credit / Debit Card */}
                  <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    formData.paymentMethod === 'credit_card' ? 'bg-[#FAF8F5] border-[#B8551F] shadow-xs' : 'border-[#E5DDD3] hover:bg-[#FAF8F5]'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={formData.paymentMethod === 'credit_card'}
                      onChange={handleChange}
                      className="text-[#B8551F] focus:ring-[#B8551F] mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#201C18]">Credit / Debit Card (International)</span>
                        <CreditCard className="w-4 h-4 text-[#6B6459]" />
                      </div>
                      <p className="text-[11px] text-[#6B6459] mt-0.5">Visa, Mastercard for international cards.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E5DDD3] shadow-xs space-y-6 sticky top-28">
              <h3 className="text-lg font-heading font-extrabold text-[#201C18] border-b border-[#E5DDD3] pb-4">
                Order Review ({items.reduce((s, i) => s + i.quantity, 0)} Items)
              </h3>

              {/* Items List Preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-[#E5DDD3] pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantKey}`} className="flex gap-3 py-3 text-xs">
                    <div className="w-14 h-14 bg-[#FAF8F5] rounded-xl overflow-hidden shrink-0 border border-[#E5DDD3]">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#201C18] line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-[#6B6459]">
                        Qty: {item.quantity} {item.variant?.color ? `• ${item.variant.color}` : ''}
                      </p>
                      <p className="font-extrabold text-[#B8551F] mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 text-xs text-[#6B6459] border-t border-[#E5DDD3] pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-[#201C18]">{formatPrice(subtotal)}</span>
                </div>
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
                  <span>Total Amount</span>
                  <span className="text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order CTA Button (Green Accent) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4C7A3D] hover:bg-[#3E6532] disabled:opacity-50 text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white/90" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order • {formatPrice(total)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-[#6B6459] text-center space-y-1">
                <p>Inspect your furniture upon delivery before payment.</p>
                <p className="text-stone-400">By placing order, you agree to KB Furniture Delivery Terms.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
