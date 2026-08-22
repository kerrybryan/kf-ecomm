'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Award } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-stone-950 text-white overflow-hidden">
      {/* Background Editorial Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85"
          alt="Nordika Luxury Scandinavian Interior"
          className="w-full h-full object-cover object-center opacity-40 scale-105 animate-in fade-in duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026 Scandinavian Collection</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-bold tracking-tight text-white leading-[1.15]">
            Quiet Elegance. Handcrafted for a Lifetime.
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base sm:text-lg text-stone-300 font-light leading-relaxed">
            Discover architectural silhouettes sculpted from sustainably harvested solid oak,
            raw Italian travertine stone, and textural bouclé upholstery. Built to outlive trends.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/shop"
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-8 py-4 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-950/20 group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/custom-order"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <span>Custom Concierge</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 text-xs text-stone-400">
            <div>
              <p className="text-white font-bold text-lg font-serif-luxury">100%</p>
              <p className="mt-0.5 text-[11px]">FSC-Certified Woods</p>
            </div>
            <div>
              <p className="text-white font-bold text-lg font-serif-luxury">10-Year</p>
              <p className="mt-0.5 text-[11px]">Frame Guarantee</p>
            </div>
            <div>
              <p className="text-white font-bold text-lg font-serif-luxury">White-Glove</p>
              <p className="mt-0.5 text-[11px]">In-Home Assembly</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
