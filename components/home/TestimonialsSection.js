import React from 'react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "The Haven Modular Sofa in bouclé is an absolute revelation. The depth and fabric quality rival custom Italian sofas triple the price point.",
    author: "Elena Rostova",
    role: "Lead Architect, Studio Oslo",
    rating: 5,
  },
  {
    quote: "Our extendable Stockholm oak dining table has survived dinner parties and toddler breakfasts with grace. The joinery is pure perfection.",
    author: "Liam & Sarah Thorne",
    role: "Seattle, WA",
    rating: 5,
  },
  {
    quote: "The White-Glove delivery crew was punctual, unboxed the travertine table with meticulous care, and removed every scrap of packing material.",
    author: "Christian Møller",
    role: "Interior Designer",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-stone-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-700 block mb-2">
            Client Experiences
          </span>
          <h2 className="text-3xl font-serif-luxury font-bold text-stone-900">
            Endorsed by Designers & Homeowners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-stone-300 mb-2" />
                <p className="text-sm text-stone-700 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-900">{t.author}</h4>
                <p className="text-[11px] text-stone-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
