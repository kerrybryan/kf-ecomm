'use client';

import React, { useState } from 'react';
import { ZoomIn } from 'lucide-react';

export default function ProductGallery({ images = [], name = 'Product' }) {
  const imageList = images && images.length > 0
    ? images
    : ['https://picsum.photos/seed/nordika-sofa/1200/800'];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnail column */}
      {imageList.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[580px] shrink-0 scrolling-touch pb-2 md:pb-0">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                activeIndex === idx
                  ? 'border-stone-900 ring-2 ring-stone-900/10'
                  : 'border-stone-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Preview Image */}
      <div className="relative flex-1 aspect-[4/3] md:aspect-[5/4] bg-stone-100 rounded-2xl overflow-hidden border border-stone-200/80 group">
        <img
          src={imageList[activeIndex]}
          alt={`${name} view ${activeIndex + 1}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute bottom-4 right-4 bg-stone-900/80 backdrop-blur-xs text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
