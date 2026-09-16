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
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-8 h-[2.5px] bg-[#B8551F] rounded-full" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#B8551F]">
              CONTACT US
            </span>
            <span className="w-8 h-[2.5px] bg-[#B8551F] rounded-full" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#201C18]">
            Contact KB Furniture
          </h1>
          <p className="mt-3 text-sm text-[#6B6459] font-normal leading-relaxed">
            Have questions about furniture, custom orders, or delivery in Addis Ababa? Call or message our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Contact Info & Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E5DDD3] shadow-xs space-y-6">
              <h3 className="text-lg font-heading font-extrabold text-[#201C18] border-b border-[#E5DDD3] pb-3">
                Showroom & Workshop
              </h3>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#B8551F] shrink-0 border border-[#E5DDD3]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#201C18]">
                    Addis Ababa Showroom
                  </h4>
                  <p className="text-xs text-[#6B6459] mt-1 leading-relaxed">
                    Bole Sub-City, Cameroon Street<br />
                    Near Edna Mall, Addis Ababa, Ethiopia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#B8551F] shrink-0 border border-[#E5DDD3]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#201C18]">
                    Email
                  </h4>
                  <p className="text-xs text-[#6B6459] mt-1 leading-relaxed">
                    info@kbfurniture.com<br />
                    orders@kbfurniture.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#B8551F] shrink-0 border border-[#E5DDD3]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#201C18]">
                    Phone & WhatsApp
                  </h4>
                  <p className="text-xs text-[#6B6459] mt-1 leading-relaxed">
                    +251 911 234 567<br />
                    Mon–Sat: 8:30 AM – 6:30 PM EAT
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Mini Box */}
            <div className="bg-[#F3EEE7] rounded-2xl p-6 sm:p-8 border-2 border-[#E5DDD3] space-y-4">
              <div className="flex items-center gap-2 text-[#B8551F]">
                <HelpCircle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#201C18]">
                  Quick Questions
                </h4>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <h5 className="font-bold text-[#201C18]">Can I customize sofa or table sizes?</h5>
                  <p className="text-[#6B6459] mt-0.5 font-normal">Yes, our workshop makes furniture to your exact room size.</p>
                </div>
                <div className="border-t border-[#E5DDD3] pt-2.5">
                  <h5 className="font-bold text-[#201C18]">Do you deliver and assemble at home?</h5>
                  <p className="text-[#6B6459] mt-0.5 font-normal">Yes, we deliver and assemble across Addis Ababa and major cities.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-10 border-2 border-[#E5DDD3] shadow-xs">
              {submitted ? (
                <div className="py-14 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#E9F1E6] text-[#4C7A3D] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold text-[#201C18]">
                    Message Received!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B6459] max-w-md mx-auto font-normal leading-relaxed">
                    Thank you, {formData.name}. We received your message and will call or email you shortly.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="bg-[#B8551F] hover:bg-[#8F4116] text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-xl font-heading font-extrabold text-[#201C18] border-b border-[#E5DDD3] pb-3">
                    Send Us a Message
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#201C18] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Abebe Kebede"
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
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="abebe@example.com"
                        className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#201C18] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+251 911 234 567"
                        className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#201C18] mb-1">
                        Topic
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
                      >
                        <option value="general">General Question</option>
                        <option value="custom">Custom Furniture Order</option>
                        <option value="wholesale">Trade & Bulk Order</option>
                        <option value="support">Delivery & Order Status</option>
                      </select>
                    </div>
                  </div>

                  {formData.productContext && (
                    <div>
                      <label className="block text-xs font-bold text-[#201C18] mb-1">
                        Furniture Item
                      </label>
                      <input
                        type="text"
                        name="productContext"
                        value={formData.productContext}
                        onChange={handleChange}
                        className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us what furniture piece you need, preferred size, wood type, or delivery address..."
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#B8551F] hover:bg-[#8F4116] disabled:bg-stone-400 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
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
