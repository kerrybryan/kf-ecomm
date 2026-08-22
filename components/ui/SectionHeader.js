import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  viewAllLink,
  viewAllText = 'View All',
  className = '',
}) {
  return (
    <div className={`mb-8 sm:mb-10 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          {/* Decorative Thin Rule Accent */}
          {eyebrow ? (
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[1.5px] bg-[#A8875E]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#A8875E]">
                {eyebrow}
              </span>
            </div>
          ) : (
            <div className="w-8 h-[1.5px] bg-[#A8875E] mb-2" />
          )}

          {/* Section Title */}
          <h2 className="text-2xl sm:text-3xl font-serif-heading font-bold text-[#2B2620] tracking-tight">
            {title}
          </h2>

          {/* Optional Short Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#6B6459] mt-1.5 font-light">
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional View All Link */}
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#A8875E] hover:text-[#2B2620] transition-colors group self-start sm:self-end"
          >
            <span>{viewAllText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
