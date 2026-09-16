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
    <div className="bg-[#FAF8F5] min-h-screen py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#B8551F]/10 border border-[#B8551F]/30 text-[#B8551F] text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-[#B8551F]" />
            <span>KB Furniture Trade & Agents</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#201C18] leading-tight">
            Partner With KB Furniture
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6459] mt-3 leading-relaxed font-normal">
            Earn good commissions by recommending or selling solid wood furniture to your clients in Addis Ababa and across Ethiopia.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#E5DDD3] shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 bg-[#FAF8F5] text-[#B8551F] w-fit rounded-xl mb-4 border border-[#E5DDD3]">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#201C18]">
                Good Commissions
              </h3>
              <p className="text-xs text-[#6B6459] mt-2 leading-relaxed font-normal">
                Earn 10% to 20% on every order placed by your clients with fast payouts.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-[#E5DDD3] shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 bg-[#FAF8F5] text-[#B8551F] w-fit rounded-xl mb-4 border border-[#E5DDD3]">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#201C18]">
                Catalog & Photos
              </h3>
              <p className="text-xs text-[#6B6459] mt-2 leading-relaxed font-normal">
                Get full product catalogs, high quality photos, and wood material samples.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-[#E5DDD3] shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 bg-[#FAF8F5] text-[#B8551F] w-fit rounded-xl mb-4 border border-[#E5DDD3]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#201C18]">
                Direct Support
              </h3>
              <p className="text-xs text-[#6B6459] mt-2 leading-relaxed font-normal">
                Direct phone and WhatsApp support from our Addis Ababa workshop team.
              </p>
            </div>
          </div>
        </div>

        {/* Application Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border-2 border-[#E5DDD3] shadow-xs">
          {submittedAgent ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-[#E9F1E6] rounded-full flex items-center justify-center mx-auto text-[#4C7A3D]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-[#201C18]">
                Application Received!
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6459] max-w-md mx-auto">
                Thank you, <strong>{submittedAgent.name}</strong>. Our team will review your application and call you within 24 hours.
              </p>
              <div className="pt-4">
                <Link
                  href="/shop"
                  className="inline-block bg-[#B8551F] hover:bg-[#8F4116] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Browse Furniture Catalog
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#E5DDD3] pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#201C18]">
                  Agent Application Form
                </h2>
                <p className="text-xs text-[#6B6459] mt-1">
                  Fill in your details below to become a registered KB Furniture agent.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Abebe Kebede"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="abebe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Phone Number *
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
                    City / Location *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Addis Ababa, Hawassa, Bahir Dar"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Your Profession *
                  </label>
                  <select
                    name="salesChannel"
                    value={formData.salesChannel}
                    onChange={handleChange}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
                  >
                    <option value="Interior Designer / Residential">Interior Designer</option>
                    <option value="Architect / Commercial">Architect</option>
                    <option value="Independent Sales Agent">Independent Sales Representative</option>
                    <option value="Retail Furniture Showroom">Showroom / Shop Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Years of Experience
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
                  >
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="6-10 years">6-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Tell us about your work, clients, or questions..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-4 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-50 text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-white" />
                  <span>{submitting ? 'Submitting Application...' : 'Apply as an Agent'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
