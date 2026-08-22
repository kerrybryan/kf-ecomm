import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { CheckCircle2, Package, Truck, Clock, ArrowRight, ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_STEPS = [
  { id: 'pending', label: 'Order Placed', desc: 'Crafting queue confirmed' },
  { id: 'processing', label: 'In Studio Preparation', desc: 'Inspection & white-glove packing' },
  { id: 'shipped', label: 'With White-Glove Courier', desc: 'Appointment window scheduling' },
  { id: 'delivered', label: 'Delivered & Assembled', desc: 'Placed in your room of choice' },
];

export default async function OrderConfirmationPage({ params }) {
  const { id } = await params;
  await connectDB();

  let order;
  if (mongoose.Types.ObjectId.isValid(id)) {
    order = await Order.findById(id).lean();
  }
  if (!order) {
    order = await Order.findOne({ orderNumber: id }).lean();
  }

  if (!order) {
    notFound();
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.id === order.status);
  const activeStep = currentStepIndex > -1 ? currentStepIndex : 0;

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xs text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase font-bold tracking-widest text-amber-700 block mb-1">
            Order Confirmed & Logged
          </span>
          <h1 className="text-3xl font-serif-luxury font-bold text-stone-900">
            Thank you for choosing NÖRDIKA, {order.customer.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-lg mx-auto">
            A confirmation receipt and tracking itinerary have been dispatched to{' '}
            <strong className="text-stone-800">{order.customer.email}</strong>.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 bg-stone-50 border border-stone-200 px-5 py-2.5 rounded-full text-xs font-mono">
            <span className="text-stone-500 font-sans">Order Reference:</span>
            <span className="font-bold text-stone-900">{order.orderNumber}</span>
          </div>
        </div>

        {/* Live Delivery Status Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-6">
            White-Glove Delivery Timeline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
            {STATUS_STEPS.map((step, idx) => {
              const isPassed = idx <= activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div key={step.id} className="flex flex-col items-start relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors ${
                      isPassed
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <h4 className={`text-xs font-semibold ${isCurrent ? 'text-amber-700 font-bold' : 'text-stone-900'}`}>
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details & Delivery Destination */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
          {/* Items Summary */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
              Crafted Items in Order ({order.items.length})
            </h3>

            <div className="divide-y divide-stone-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 py-3 text-xs">
                  <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold text-stone-900">{item.name}</p>
                      {(item.variant?.color || item.variant?.material) && (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {item.variant.color && `Color: ${item.variant.color}`}
                          {item.variant.material && ` • Material: ${item.variant.material}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-stone-500">Qty: {item.quantity}</span>
                      <span className="font-bold text-stone-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="border-t border-stone-100 pt-4 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>White-Glove Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Paid</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-stone-700" />
                <span>Shipping Address</span>
              </h3>
              <div className="text-xs text-stone-600 leading-relaxed space-y-0.5 bg-stone-50 p-4 rounded-xl">
                <p className="font-semibold text-stone-900">{order.customer.name}</p>
                <p>{order.customer.address.street}</p>
                {order.customer.address.apartment && <p>{order.customer.address.apartment}</p>}
                <p>
                  {order.customer.address.city}, {order.customer.address.state}{' '}
                  {order.customer.address.postalCode}
                </p>
                <p>{order.customer.address.country}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-stone-700" />
                <span>Contact Info</span>
              </h3>
              <div className="text-xs text-stone-600 space-y-1 bg-stone-50 p-4 rounded-xl">
                <p><strong>Email:</strong> {order.customer.email}</p>
                <p><strong>Phone:</strong> {order.customer.phone}</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/shop"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-3.5 px-6 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
