import React from 'react';
import Link from 'next/link';
import { Truck, Sparkles, MapPin, HelpCircle } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-[#1F1B16] text-[#FAF6F0] text-[12px] h-8 flex items-center px-4 sm:px-6 lg:px-8 border-b border-[#2B2620] select-none">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Left Item */}
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#C9A876]" />
          <span className="font-normal text-stone-200">
            Free Shipping on Orders Over $50
          </span>
        </div>

        {/* Center Tagline */}
        <div className="hidden md:flex items-center gap-2 text-stone-300 text-[11px] uppercase tracking-wider">
          <span>Premium Quality</span>
          <span className="text-[#C9A876]">•</span>
          <span>Timeless Design</span>
          <span className="text-[#C9A876]">•</span>
          <span>Sustainable Materials</span>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-4 text-[11px] text-stone-300">
          <Link
            href="/account#orders"
            className="hover:text-[#C9A876] transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-3 h-3 text-[#C9A876]" />
            <span>Track Order</span>
          </Link>
          <span className="text-stone-700">|</span>
          <Link
            href="/custom-order"
            className="hover:text-[#C9A876] transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3 h-3 text-[#C9A876]" />
            <span>Help Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
