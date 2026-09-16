'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LOGO_SRC_MAP = {
  default: '/logo.png',
  terracotta: '/logo-terracotta.png',
  white: '/logo-white.png',
  dark: '/logo-dark.png',
};

const SIZES = {
  xs: { icon: 22, textKB: 'text-base', textSub: 'text-[8px]', gap: 'gap-1.5' },
  sm: { icon: 28, textKB: 'text-lg', textSub: 'text-[9px]', gap: 'gap-2' },
  md: { icon: 34, textKB: 'text-xl', textSub: 'text-[10px]', gap: 'gap-2.5' },
  lg: { icon: 44, textKB: 'text-2xl', textSub: 'text-[11px]', gap: 'gap-3' },
  xl: { icon: 56, textKB: 'text-3xl', textSub: 'text-[12px]', gap: 'gap-3.5' },
};

export default function BrandLogo({
  variant = 'terracotta',
  size = 'md',
  showText = true,
  href = '/',
  className = '',
  iconClassName = '',
  textClassName = '',
  asLink = true,
}) {
  const logoSrc = LOGO_SRC_MAP[variant] || LOGO_SRC_MAP.terracotta;
  const sizeConfig = SIZES[size] || SIZES.md;

  const content = (
    <div className={`flex items-center ${sizeConfig.gap} shrink-0 group select-none ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`relative shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconClassName}`}
        style={{ width: sizeConfig.icon, height: sizeConfig.icon }}
      >
        <Image
          src={logoSrc}
          alt="KB Furniture Logo"
          width={sizeConfig.icon * 2}
          height={sizeConfig.icon * 2}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className={`flex flex-col justify-center leading-none ${textClassName}`}>
          <div className="flex items-baseline gap-1">
            <span
              className={`font-black tracking-tight ${sizeConfig.textKB}`}
              style={{
                color: variant === 'white' ? '#FFFFFF' : '#B8551F',
                fontFamily: 'var(--font-heading, inherit)',
              }}
            >
              KB
            </span>
            <span
              className={`font-extrabold uppercase tracking-[0.22em] ${sizeConfig.textSub} transition-colors ${
                variant === 'white'
                  ? 'text-stone-300 group-hover:text-white'
                  : 'text-[#201C18] group-hover:text-[#B8551F]'
              }`}
            >
              FURNITURE
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (asLink && href) {
    return (
      <Link href={href} aria-label="KB Furniture — Home" className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
