import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, Shield, Leaf } from 'lucide-react';

export default function CraftsmanshipStory() {
  return (
    <section className="py-24 bg-stone-900 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story & Philosophy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Architectural Integrity</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white leading-tight">
              Honest Materials. Traditional Joinery. Zero Compromises.
            </h2>

            <p className="mt-6 text-sm text-stone-300 leading-relaxed">
              Every curve, mortise-and-tenon joint, and hand-rubbed oil finish is executed with
              unhurried dedication. We select only sustainably harvested European White Oak,
              solid American Walnut, and subterranean Italian Travertine with rich natural variations.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Sustainably Harvested Hardwoods</h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    100% FSC-certified timber seasoned slowly to prevent warping across changing seasons.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Commercial-Grade Durability</h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    High-resilience memory foam cores tested for 100,000 compression cycles without sagging.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Non-Toxic Organic Finishes</h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Zero-VOC organic oils that let natural wood breathe while resisting moisture and spills.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/custom-order"
                className="inline-block bg-amber-400 hover:bg-amber-300 text-stone-950 px-8 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-widest transition-colors shadow-lg"
              >
                Inquire About Bespoke Pieces
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Composite Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
                alt="Woodcrafting and joinery"
                className="rounded-2xl w-full h-64 object-cover shadow-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80"
                alt="Travertine stone carving"
                className="rounded-2xl w-full h-64 object-cover mt-8 shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
