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
          {/* Decorative Rule Accent */}
          {eyebrow ? (
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[2.5px] bg-[#B8551F] rounded-full" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#B8551F]">
                {eyebrow}
              </span>
            </div>
          ) : (
            <div className="w-10 h-[2.5px] bg-[#B8551F] mb-2 rounded-full" />
          )}

          {/* Section Title */}
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#201C18] tracking-tight">
            {title}
          </h2>

          {/* Optional Short Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#6B6459] mt-1 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional View All Link */}
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#B8551F] hover:text-[#8F4116] transition-colors group self-start sm:self-end"
          >
            <span>{viewAllText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
