import React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'The solid wood dining table we ordered is absolutely stunning. The quality of the wood and the craftsmanship is beyond what we expected at this price.',
    author: 'Hana Tesfaye',
    role: 'Interior Stylist, Addis Ababa',
    rating: 5,
    initials: 'HT',
  },
  {
    quote:
      'Our custom bedroom set was delivered on time and fits perfectly. The finish is smooth, durable, and looks exactly like the showroom display.',
    author: 'Dawit & Selamawit',
    role: 'Homeowners, Bole',
    rating: 5,
    initials: 'DS',
  },
  {
    quote:
      'We ordered custom office desks for our entire floor. KB Furniture delivered every piece on schedule with zero defects. Will order again.',
    author: 'Yonas Girma',
    role: 'Operations Manager, Addis',
    rating: 5,
    initials: 'YG',
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials-section"
      className="py-16 sm:py-20 bg-[#FAF8F5] border-t border-[#E5DDD3]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#B8551F] block mb-2">
            Customer Stories
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1A15] tracking-tight">
            Loved by Homeowners Across Addis
          </h2>
          <p className="mt-3 text-sm text-[#6B6459]">
            Real experiences from people living with KB Furniture every day.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              id={`testimonial-${idx}`}
              className="bg-white rounded-2xl border border-[#E5DDD3] p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#D99A2B]/40 transition-all duration-300 group"
            >
              <div>
                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-[#D99A2B] fill-[#D99A2B]"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-[#201C18] leading-relaxed font-normal italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author row */}
              <div className="mt-6 pt-4 border-t border-[#E5DDD3] flex items-center gap-3">
                {/* Amber avatar circle */}
                <div className="w-9 h-9 rounded-full bg-[#D99A2B]/15 border-2 border-[#D99A2B]/30 flex items-center justify-center shrink-0 group-hover:bg-[#D99A2B]/25 transition-colors">
                  <span className="text-xs font-extrabold text-[#B8551F]">{t.initials}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#201C18]">{t.author}</p>
                  <p className="text-[11px] text-[#6B6459] mt-0.5">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall rating summary */}
        <div className="mt-10 flex justify-center items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-[#D99A2B] fill-[#D99A2B]" />
            ))}
          </div>
          <p className="text-sm font-bold text-[#201C18]">4.9 out of 5</p>
          <span className="text-stone-300">·</span>
          <p className="text-xs text-[#6B6459]">Based on 200+ customer reviews</p>
        </div>
      </div>
    </section>
  );
}
