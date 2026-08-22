'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function ContactForm() {
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: searchParams.get('type') || 'general',
    productContext: searchParams.get('product') || '',
    message: '',
    referenceImage: '',
  });

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const productParam = searchParams.get('product');
    if (typeParam || productParam) {
      setFormData((prev) => ({
        ...prev,
        type: typeParam || prev.type,
        productContext: productParam || prev.productContext,
      }));
    }
  }, [searchParams]);

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
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitted(true);
      addToast('Inquiry received! Our team will contact you within 24 hours.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3ECE1] py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-[1.5px] bg-[#A8875E]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#A8875E]">
              CONCIERGE & INQUIRIES
            </span>
            <span className="w-6 h-[1.5px] bg-[#A8875E]" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-heading font-bold text-[#2B2620]">
            Connect With Our Studio
          </h1>
          <p className="mt-4 text-sm text-[#6B6459] font-light leading-relaxed">
            Whether inquiring about custom dimensions, architectural trade pricing, or an existing order,
            our craft team is dedicated to assisting you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Contact Info & Studio Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-[#DCD1BE] shadow-xs space-y-6">
              <h3 className="text-lg font-serif-heading font-bold text-[#2B2620]">
                Showroom & Workshop
              </h3>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#F3ECE1] rounded-2xl text-[#A8875E] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B2620]">
                    Seattle Design Studio
                  </h4>
                  <p className="text-xs text-[#6B6459] mt-1 leading-relaxed">
                    440 Westlake Ave N, Suite 300<br />
                    Seattle, WA 98109
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#F3ECE1] rounded-2xl text-[#A8875E] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B2620]">
                    Email Inquiries
                  </h4>
                  <p className="text-xs text-[#6B6459] mt-1 leading-relaxed">
                    concierge@nordika-furniture.com<br />
                    trade@nordika-furniture.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#F3ECE1] rounded-2xl text-[#A8875E] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B2620]">
                    Phone & WhatsApp
                  </h4>
                  <p className="text-xs text-[#6B6459] mt-1 leading-relaxed">
                    +1 (206) 880-4920<br />
                    Mon–Sat: 9:00 AM – 6:00 PM PST
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Mini Accordion */}
            <div className="bg-[#EAE1D2] rounded-3xl p-8 border border-[#DCD1BE] space-y-4">
              <div className="flex items-center gap-2 text-[#A8875E]">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Quick Answers</span>
              </div>
              <div className="space-y-3 text-xs text-[#2B2620]">
                <div>
                  <h5 className="font-semibold">What is the lead time for bespoke pieces?</h5>
                  <p className="text-[#6B6459] mt-0.5 font-light">Custom furniture is handcrafted in 4–6 weeks.</p>
                </div>
                <div className="border-t border-[#DCD1BE] pt-2.5">
                  <h5 className="font-semibold">Do you provide wood & fabric swatches?</h5>
                  <p className="text-[#6B6459] mt-0.5 font-light">Yes, complimentary swatch kits ship within 48 hours.</p>
                </div>
                <div className="border-t border-[#DCD1BE] pt-2.5">
                  <h5 className="font-semibold">Do you work with architects & interior designers?</h5>
                  <p className="text-[#6B6459] mt-0.5 font-light">We offer tiered trade discounts and 3D CAD files for projects.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DCD1BE] shadow-lg">
              {submitted ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#F3ECE1] text-[#A8875E] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif-heading font-bold text-[#2B2620]">
                    Inquiry Received
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B6459] max-w-md mx-auto font-light leading-relaxed">
                    Thank you, {formData.name}. Our master joiners and concierge have received your details
                    and will reply to <span className="font-medium text-[#2B2620]">{formData.email}</span> shortly.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="bg-[#1A1613] hover:bg-[#332c26] text-white px-8 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Submit Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-xl font-serif-heading font-bold text-[#2B2620]">
                    Send a Message or Request Quote
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2B2620] mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Freja Lind"
                        className="w-full bg-[#F3ECE1]/50 border border-[#DCD1BE] rounded-xl px-4 py-3 text-xs text-[#2B2620] focus:outline-none focus:ring-2 focus:ring-[#A8875E] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2B2620] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="freja@studio.com"
                        className="w-full bg-[#F3ECE1]/50 border border-[#DCD1BE] rounded-xl px-4 py-3 text-xs text-[#2B2620] focus:outline-none focus:ring-2 focus:ring-[#A8875E] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2B2620] mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (206) 555-0199"
                        className="w-full bg-[#F3ECE1]/50 border border-[#DCD1BE] rounded-xl px-4 py-3 text-xs text-[#2B2620] focus:outline-none focus:ring-2 focus:ring-[#A8875E] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2B2620] mb-1.5">
                        Inquiry Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-[#F3ECE1]/50 border border-[#DCD1BE] rounded-xl px-4 py-3 text-xs text-[#2B2620] focus:outline-none focus:ring-2 focus:ring-[#A8875E] focus:bg-white"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="custom">Custom Made-to-Order Piece</option>
                        <option value="wholesale">Architect & Trade Program</option>
                        <option value="support">Order Support & Delivery</option>
                      </select>
                    </div>
                  </div>

                  {formData.productContext && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2B2620] mb-1.5">
                        Referenced Product
                      </label>
                      <input
                        type="text"
                        name="productContext"
                        value={formData.productContext}
                        onChange={handleChange}
                        className="w-full bg-[#F3ECE1]/50 border border-[#DCD1BE] rounded-xl px-4 py-3 text-xs text-[#2B2620]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2B2620] mb-1.5">
                      Message / Project Details *
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please specify dimensions, wood preferences (White Oak, Walnut), fabric choices, or delivery address..."
                      className="w-full bg-[#F3ECE1]/50 border border-[#DCD1BE] rounded-xl px-4 py-3 text-xs text-[#2B2620] focus:outline-none focus:ring-2 focus:ring-[#A8875E] focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#1A1613] hover:bg-[#332c26] disabled:bg-stone-400 text-white py-4 rounded-xl text-xs font-semibold uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#A8875E]" />
                    <span>{submitting ? 'Transmitting Details...' : 'Send Inquiry To Studio'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F3ECE1] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#1A1613]" />
        </div>
      }
    >
      <ContactForm />
    </Suspense>
  );
}
