import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function BespokePromo() {
  return (
    <section className="py-20 bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-stone-900 rounded-3xl overflow-hidden shadow-2xl">
          {/* Background Ambient Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80"
              alt="Bespoke Architectural Project"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-stone-950/40" />
          </div>

          <div className="relative z-10 p-8 sm:p-14 lg:p-20 max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs uppercase font-bold tracking-widest mb-4">
              <Sparkles className="w-4 h-4" />
              <span>KB Studio Custom Concierge</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold leading-tight">
              Require Custom Dimensions or Commercial Trade Pricing?
            </h2>

            <p className="mt-4 text-stone-300 text-sm leading-relaxed">
              We collaborate with residential homeowners, interior designers, and hospitality architects.
              Specify custom sectional configurations, tabletop lengths, or custom upholstery palettes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/custom-order"
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-8 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <span>Submit Bespoke Request</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/become-an-agent"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center transition-colors"
              >
                <span>Join Trade Program</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
