'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PenSquare,
  Calendar,
  Clock,
  History,
  Link2,
  Sliders,
  Share2,
} from 'lucide-react';

const SOCIAL_TABS = [
  { name: 'Composer', href: '/admin/social', icon: PenSquare, matchExact: true },
  { name: 'Content Calendar', href: '/admin/social/calendar', icon: Calendar },
  { name: 'Publish Queue', href: '/admin/social/queue', icon: Clock },
  { name: 'Post History', href: '/admin/social/history', icon: History },
  { name: 'Accounts', href: '/admin/social/accounts', icon: Link2 },
  { name: 'Automation Rules', href: '/admin/social/automation', icon: Sliders },
];

export default function SocialHeader({ title = 'Social Media Publishing Hub', subtitle = '' }) {
  const pathname = usePathname();

  const isTabActive = (tab) => {
    if (tab.matchExact) {
      return pathname === '/admin/social' || pathname === '/admin/social/compose';
    }
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="space-y-4">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#1A1613]">{title}</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8875E] bg-[#A8875E]/15 px-2 py-0.5 rounded border border-[#A8875E]/30">
              Multi-Channel
            </span>
          </div>
          <p className="text-xs text-[#7C7265] mt-0.5">
            {subtitle || 'Push branded Nordic studio imagery, reels, and AI-captioned posts across Instagram, Facebook, TikTok & Pinterest.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/social"
            className="px-4 py-2 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PenSquare className="w-4 h-4" />
            Compose Post
          </Link>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#EBE5DF] overflow-x-auto pb-px">
        {SOCIAL_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                active
                  ? 'border-[#A8875E] text-[#A8875E] bg-[#FAF8F5]'
                  : 'border-transparent text-[#7C7265] hover:text-[#1A1613] hover:bg-[#FAF8F5]/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
