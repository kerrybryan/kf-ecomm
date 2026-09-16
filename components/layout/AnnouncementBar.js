'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Award, MapPin, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const MESSAGES = [
  {
    id: 'msg-delivery',
    icon: Truck,
    text: 'Free Delivery in Addis Ababa',
    highlight: 'On Orders Over 50,000 Birr',
  },
  {
    id: 'msg-guarantee',
    icon: Award,
    text: '10-Year Quality Guarantee',
    highlight: 'On All Solid Wood Furniture',
  },
  {
    id: 'msg-custom',
    icon: null,
    text: 'Custom Orders Welcome',
    highlight: 'Made to Your Exact Dimensions',
  },
];

export default function AnnouncementBar() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Auto-rotate every 4 seconds with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (idx) => {
    setVisible(false);
    setTimeout(() => {
      setActiveIdx(idx);
      setVisible(true);
    }, 250);
  };

  const goNext = () => goTo((activeIdx + 1) % MESSAGES.length);
  const goPrev = () => goTo((activeIdx - 1 + MESSAGES.length) % MESSAGES.length);

  const active = MESSAGES[activeIdx];
  const Icon = active.icon;

  return (
    <div
      id="announcement-bar"
      className="bg-[#1F1B16] text-[#FAF6F0] h-9 flex items-center border-b border-[#2B2620] select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left navigation arrow */}
        <button
          onClick={goPrev}
          className="text-stone-500 hover:text-[#D99A2B] transition-colors shrink-0 hidden sm:block"
          aria-label="Previous message"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Rotating center message */}
        <div className="flex-1 flex items-center justify-center gap-2 overflow-hidden">
          <div
            className="flex items-center gap-2 text-[12px] transition-all duration-300"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-6px)' }}
          >
            {Icon && <Icon className="w-3.5 h-3.5 text-[#D99A2B] shrink-0" />}
            <span className="font-semibold text-stone-200 whitespace-nowrap">{active.text}</span>
            <span className="text-[#D99A2B] hidden sm:inline">—</span>
            <span className="text-stone-400 text-[11px] hidden sm:inline whitespace-nowrap">
              {active.highlight}
            </span>
          </div>
        </div>

        {/* Right arrow + utility links */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={goNext}
            className="text-stone-500 hover:text-[#D99A2B] transition-colors hidden sm:block"
            aria-label="Next message"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Dot indicators */}
          <div className="hidden md:flex items-center gap-1">
            {MESSAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  i === activeIdx ? 'bg-[#D99A2B] scale-125' : 'bg-stone-600 hover:bg-stone-400'
                }`}
                aria-label={`Go to message ${i + 1}`}
              />
            ))}
          </div>

          {/* Utility nav */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-stone-400 border-l border-stone-700 pl-4">
            <Link
              href="/account#orders"
              className="hover:text-[#D99A2B] transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              <span>Track Order</span>
            </Link>
            <span className="text-stone-700">|</span>
            <Link
              href="/contact"
              className="hover:text-[#D99A2B] transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Help</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
