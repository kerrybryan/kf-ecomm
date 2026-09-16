import React from 'react';
import { Truck, Award, TreePine, PenLine } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: 'Free Addis Delivery',
    desc: 'On orders over 50,000 Birr',
    id: 'trust-delivery',
  },
  {
    icon: Award,
    title: '10-Year Guarantee',
    desc: 'On all solid wood furniture',
    id: 'trust-guarantee',
  },
  {
    icon: TreePine,
    title: '100% Solid Wood',
    desc: 'Sustainably sourced hardwoods',
    id: 'trust-wood',
  },
  {
    icon: PenLine,
    title: 'Custom Orders',
    desc: 'Made to your exact dimensions',
    id: 'trust-custom',
  },
];

export default function TrustStrip() {
  return (
    <section
      id="trust-strip"
      className="bg-white border-b border-[#E5DDD3] py-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#E5DDD3] divide-y lg:divide-y-0">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                id={item.id}
                className="flex items-center gap-3.5 px-5 py-5 group hover:bg-[#FAF8F5] transition-colors duration-200"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-[#FDF0E8] flex items-center justify-center group-hover:bg-[#B8551F]/10 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-[#B8551F]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#201C18] leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#6B6459] mt-0.5 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
