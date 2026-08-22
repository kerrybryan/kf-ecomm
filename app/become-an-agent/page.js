'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, Send, Percent, FileCode, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function BecomeAnAgentPage() {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submittedAgent, setSubmittedAgent] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    experience: '3-5 years',
    salesChannel: 'Interior Designer / Residential',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.salesChannel) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmittedAgent(data.data);
      addToast('Trade application received! Check your email for partnership documents.', 'success');
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
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>NÖRDIKA Trade & Agent Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900 leading-tight">
            Partner with Nordika as a Trade Representative
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-3 leading-relaxed">
            Exclusive privileges, tiered trade commissions (up to 20%), 3D Revit/SketchUp architectural models,
            and dedicated studio project managers for licensed interior designers and regional agents.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 bg-stone-900 text-amber-300 w-fit rounded-xl mb-4">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Tiered Trade Margins
              </h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Enjoy 15% to 25% wholesale trade discounts on all catalog collections with no annual order minimums.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 bg-stone-900 text-amber-300 w-fit rounded-xl mb-4">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                3D BIM & CAD Assets
              </h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Instant access to high-fidelity 3D assets for Revit, Rhino, SketchUp, and Corona rendering engines.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 bg-stone-900 text-amber-300 w-fit rounded-xl mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Dedicated Concierge
              </h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Direct cell hotline to your studio concierge for lead-time estimates and custom swatch delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xs">
          {submittedAgent ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif-luxury font-bold text-stone-900">
                Application Approved & Queued!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Welcome to the network, <strong>{submittedAgent.name}</strong>. Your provisional Trade
                Referral Code is:
              </p>
              <div className="inline-block bg-stone-900 text-amber-300 font-mono text-sm font-bold px-6 py-3 rounded-xl border border-stone-800 shadow-xs">
                {submittedAgent.referralCode}
              </div>
              <p className="text-xs text-stone-400">
                Our trade partnership director will email you your onboarding kit and digital lookbook.
              </p>
              <div className="pt-4">
                <Link
                  href="/shop"
                  className="inline-block bg-stone-900 text-white text-xs font-semibold px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-stone-800"
                >
                  Explore Catalog
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Trade Representative Application
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Complete the verification form below to receive your trade account credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Marcus Lindqvist"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="marcus@lindqviststudio.com"
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
                    placeholder="+1 (415) 555-0144"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Primary City / Region *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="San Francisco, CA / Vancouver, BC"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Industry Role / Sales Channel *
                  </label>
                  <select
                    name="salesChannel"
                    value={formData.salesChannel}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer"
                  >
                    <option value="Interior Designer / Residential">Interior Designer (Residential)</option>
                    <option value="Architect / Commercial">Architect (Commercial / Multi-Family)</option>
                    <option value="Hospitality Procurement">Hospitality Procurement Specialist</option>
                    <option value="Independent Sales Agent">Independent Luxury Sales Representative</option>
                    <option value="Retail Furniture Showroom">Retail Showroom Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Years of Practice / Experience
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer"
                  >
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="6-10 years">6-10 years</option>
                    <option value="10+ years (Master Architect / Principal)">10+ years (Principal / Studio Head)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Portfolio / Studio Website / Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Website URL, Instagram handle, or upcoming project requirements..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-900 focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                >
                  <Briefcase className="w-4 h-4 text-amber-300" />
                  <span>{submitting ? 'Verifying Application...' : 'Submit Trade Application'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
