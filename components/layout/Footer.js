'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), source: 'footer' }),
        });
      } catch (err) {
        console.error('Newsletter error:', err);
      }
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#201B15] text-[#F3ECE1] border-t border-[#3A3127] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Column 1: Logo Placeholder & Studio Bio */}
          <div className="space-y-4">
            {/* Logo Image Placeholder (130x40px, subtle dashed border, warm timber tone) */}
            <Link
              href="/"
              className="w-[130px] h-[40px] border border-dashed border-[#4E4336] hover:border-[#A8875E] rounded-md bg-[#2A231B] flex items-center justify-center transition-colors shrink-0"
              title="Logo Placeholder"
              aria-label="Homepage"
            >
              <span className="sr-only">Homepage</span>
            </Link>

            <p className="text-xs text-[#D5CCC0] font-light leading-relaxed max-w-xs">
              Handcrafted Scandinavian luxury furniture designed for life. Honest natural materials,
              traditional European wood joinery, and enduring silhouettes.
            </p>

            {/* Social Circle Icons (Inline SVG with warm timber borders) */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-[#4E4336] hover:border-[#A8875E] flex items-center justify-center text-[#D5CCC0] hover:text-[#A8875E] transition-colors bg-[#2A231B]/50"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-[#4E4336] hover:border-[#A8875E] flex items-center justify-center text-[#D5CCC0] hover:text-[#A8875E] transition-colors bg-[#2A231B]/50"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-[#4E4336] hover:border-[#A8875E] flex items-center justify-center text-[#D5CCC0] hover:text-[#A8875E] transition-colors bg-[#2A231B]/50"
                aria-label="Twitter / X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-[#4E4336] hover:border-[#A8875E] flex items-center justify-center text-[#D5CCC0] hover:text-[#A8875E] transition-colors bg-[#2A231B]/50"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop Collections */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#A8875E] mb-4">
              Shop Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D5CCC0]">
              <li>
                <Link href="/categories/living-room" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Living Room
                </Link>
              </li>
              <li>
                <Link href="/categories/bedroom" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Bedroom Sanctuary
                </Link>
              </li>
              <li>
                <Link href="/categories/dining-room" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Dining & Tables
                </Link>
              </li>
              <li>
                <Link href="/categories/home-office" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Executive Home Office
                </Link>
              </li>
              <li>
                <Link href="/categories/lighting-decor" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Lighting & Decor
                </Link>
              </li>
              <li>
                <Link href="/categories/outdoor" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Outdoor & Lounge
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#A8875E] mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D5CCC0]">
              <li>
                <Link href="/account#orders" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Track Order Status
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  White-Glove Delivery
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  30-Day Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  10-Year Craft Warranty
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About Studio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#A8875E] mb-4">
              The Studio
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D5CCC0]">
              <li>
                <Link href="/become-an-agent" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Our Craft Philosophy
                </Link>
              </li>
              <li>
                <Link href="/become-an-agent" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Sustainable Hardwoods
                </Link>
              </li>
              <li>
                <Link href="/become-an-agent" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Trade & Architect Program
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Custom Studio Concierge
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#F3ECE1] hover:underline underline-offset-4 transition-colors">
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#A8875E] mb-2">
              Nordic Journal
            </h4>
            <p className="text-xs text-[#D5CCC0] font-light leading-relaxed mb-3">
              Subscribe for private collection previews, seasonal material releases, and interior styling essays.
            </p>

            {subscribed ? (
              <p className="text-xs text-[#A8875E] font-medium bg-[#2A231B] p-3 rounded-xl border border-[#4E4336]">
                ✓ Thank you for subscribing to Nordic Journal!
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#2A231B] border border-[#4E4336] rounded-xl px-3.5 py-3 text-xs text-[#F3ECE1] placeholder:text-[#8E8475] focus:outline-none focus:border-[#A8875E] transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-[#A8875E] hover:bg-[#96764e] text-[#1A1613] font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-[0.15em] transition-colors shadow-sm cursor-pointer"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#332B22] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9C9283]">
          <p>© {new Date().getFullYear()} NORDIKA / KB Furniture Studio. All rights reserved.</p>

          <div className="flex items-center gap-6 text-[11px]">
            <span className="hover:text-[#F3ECE1] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#F3ECE1] cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-[#F3ECE1] cursor-pointer transition-colors">Sustainable Sourcing</span>
          </div>

          <div className="flex items-center gap-2 text-[#9C9283] text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A8875E]" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
