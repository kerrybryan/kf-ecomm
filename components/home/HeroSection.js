'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CYCLING_WORDS = ['Living Room', 'Bedroom', 'Dining Room', 'Home Office', 'Outdoor'];

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [fadeState, setFadeState] = useState('in'); // 'in' | 'out'

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % CYCLING_WORDS.length);
        setFadeState('in');
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero-section"
      className="relative w-full bg-[#1F1A15] overflow-hidden"
      style={{ minHeight: 'min(90vh, 700px)' }}
    >
      {/* Background image with parallax-like overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=2000"
          alt="KB Furniture warm living room interior"
          className="w-full h-full object-cover object-center opacity-40"
          style={{ transform: 'scale(1.05)' }}
        />
        {/* Gradient: dark left, fade right for split look */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F1A15] via-[#1F1A15]/80 to-[#1F1A15]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1A15]/70 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-20 lg:py-28">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            id="hero-badge"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#B8551F]/20 border border-[#B8551F]/40 text-[#D99A2B] text-[11px] font-bold uppercase tracking-widest mb-6 animate-fade-in"
            style={{ animationDelay: '0ms', animationFillMode: 'both' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D99A2B] animate-pulse" />
            <span>Handcrafted in Addis Ababa</span>
          </div>

          {/* Headline with animated cycling word */}
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-2"
            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
          >
            Beautiful Furniture
            <br />
            for Your{' '}
            <span
              className="text-[#D99A2B] inline-block transition-all duration-400"
              style={{
                opacity: fadeState === 'in' ? 1 : 0,
                transform: fadeState === 'in' ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              {CYCLING_WORDS[wordIndex]}
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="mt-5 text-base sm:text-lg text-stone-300 leading-relaxed max-w-lg"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            Simple. Strong. Made of solid wood and built to last a lifetime.
            Delivered free across Addis Ababa.
          </p>

          {/* CTAs */}
          <div
            className="mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <Link
              id="hero-cta-shop"
              href="/shop"
              className="group inline-flex items-center gap-2.5 bg-[#B8551F] hover:bg-[#8F4116] text-white px-7 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#B8551F]/25 hover:shadow-[#B8551F]/40 hover:-translate-y-0.5"
            >
              <span>Shop All Furniture</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>

            <Link
              id="hero-cta-custom"
              href="/custom-order"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-white/40 px-7 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200"
            >
              <span>Custom Order</span>
            </Link>
          </div>

          {/* Trust stats row */}
          <div className="mt-10 pt-7 border-t border-white/10 flex flex-wrap gap-8">
            {[
              { stat: '100%', label: 'Solid Wood' },
              { stat: '10-Year', label: 'Quality Guarantee' },
              { stat: 'Free', label: 'Addis Ababa Delivery' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xl font-extrabold text-white leading-none">{item.stat}</p>
                <p className="text-[11px] text-stone-400 mt-1 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2 text-stone-500">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-stone-500 to-transparent" />
      </div>
    </section>
  );
}
