'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DollarSign,
  BookOpen,
  Receipt,
  Download,
  ShieldCheck,
} from 'lucide-react';

const FINANCE_TABS = [
  { name: 'Financial Control & P&L', href: '/admin/finance', icon: DollarSign, matchExact: true },
  { name: 'General Ledger', href: '/admin/finance/ledger', icon: BookOpen },
  { name: 'Operating Expenses', href: '/admin/finance/expenses', icon: Receipt },
];

export default function FinanceHeader({ title = 'Accounting & Financial Control', subtitle = '' }) {
  const pathname = usePathname();

  const isTabActive = (tab) => {
    if (tab.matchExact) return pathname === '/admin/finance';
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#1A1613]">{title}</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8875E] bg-[#A8875E]/15 px-2 py-0.5 rounded border border-[#A8875E]/30">
              Executive & Finance
            </span>
          </div>
          <p className="text-xs text-[#7C7265] mt-0.5">
            {subtitle || 'Auto-populating double-entry general ledger, real-time P&L reporting, product gross margins, and tax tracking.'}
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#EBE5DF] overflow-x-auto pb-px">
        {FINANCE_TABS.map((tab) => {
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
