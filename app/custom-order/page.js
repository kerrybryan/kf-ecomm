'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Send, CheckCircle2, Shield, Ruler, Paintbrush, Clock } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function CustomOrderPage() {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'custom',
    dimensions: '',
    budget: '$3,000 - $6,000',
    productContext: '',
    referenceImage: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit custom inquiry');
      }

      setSubmitted(true);
      addToast('Custom inquiry submitted! A design director will contact you within 24 hours.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Studio Bespoke Concierge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900 leading-tight">
            Custom Furniture & Architectural Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-3 leading-relaxed">
            Need tailored sofa dimensions, rare walnut slabs, custom stone dining tables, or
            commercial wholesale orders? Our studio woodworkers and design directors bring your concept to life.
          </p>
        </div>

        {/* Value Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-stone-50 rounded-xl text-stone-900 shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Precision Millimeter Scaling
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                Customize sectional lengths, seat depths, and tabletop configurations for your floorplan.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-stone-50 rounded-xl text-stone-900 shrink-0">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Curated Material Library
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                Access imported Italian velvets, bouclés, Roman travertine slabs, and smoked oak finishes.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-stone-50 rounded-xl text-stone-900 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                24-Hour Studio Response
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                Receive initial technical feasibility, material swatch samples, and 3D CAD renders.
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold text-stone-900">
                Inquiry Successfully Received
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. Our custom furniture director will review
                your dimensions and reach out within 24 hours with material suggestions and an itemized quote.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      type: 'custom',
                      dimensions: '',
                      budget: '$3,000 - $6,000',
                      productContext: '',
                      referenceImage: '',
                      message: '',
                    });
                  }}
                  className="bg-stone-900 text-white text-xs font-semibold px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-stone-800"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type selection pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-900 mb-3">
                  Inquiry Purpose *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'custom', label: 'Bespoke Custom Piece' },
                    { id: 'wholesale', label: 'Trade / Commercial' },
                    { id: 'general', label: 'General Product Inquiry' },
                    { id: 'support', label: 'Post-Delivery Support' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.id })}
                      className={`py-3 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                        formData.type === t.id
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Henrik Larsson"
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
                    placeholder="henrik@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+1 (206) 555-0182"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* Custom Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Target Dimensions or Reference Piece
                  </label>
                  <input
                    type="text"
                    name="dimensions"
                    placeholder="e.g. 120 inch sectional, 10-seater walnut table"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Estimated Project Budget
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer"
                  >
                    <option value="$1,500 - $3,000">$1,500 - $3,000</option>
                    <option value="$3,000 - $6,000">$3,000 - $6,000</option>
                    <option value="$6,000 - $12,000">$6,000 - $12,000</option>
                    <option value="$12,000+ (Commercial / Multi-room)">$12,000+ (Commercial / Multi-room)</option>
                  </select>
                </div>
              </div>

              {/* Reference Image / Link */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Reference Moodboard / Image URL (Optional)
                </label>
                <input
                  type="url"
                  name="referenceImage"
                  placeholder="https://pinterest.com/... or cloud image link"
                  value={formData.referenceImage}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Project Description & Finish Preferences *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Describe wood species (Oak, Walnut), fabric preferences (Bouclé, Linen, Velvet), floor plan constraints, or delivery timeline..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-900 focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{submitting ? 'Submitting to Studio...' : 'Submit Bespoke Inquiry'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
