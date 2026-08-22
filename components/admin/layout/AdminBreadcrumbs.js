'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
        <Home className="w-3.5 h-3.5 text-zinc-400" />
        <span>Dashboard</span>
      </div>
    );
  }

  const breadcrumbs = segments.map((seg, idx) => {
    const url = `/${segments.slice(0, idx + 1).join('/')}`;
    const label = seg.replace(/-/g, ' ').replace(/^([a-z])/, (m) => m.toUpperCase());
    const isLast = idx === segments.length - 1;
    return { url, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
      <Link href="/admin" className="hover:text-zinc-900 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5 text-zinc-400" />
        <span className="hidden sm:inline">Admin</span>
      </Link>

      {breadcrumbs.slice(1).map((crumb, idx) => (
        <React.Fragment key={crumb.url}>
          <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
          {crumb.isLast ? (
            <span className="text-zinc-900 font-semibold truncate max-w-[180px] sm:max-w-none capitalize">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.url}
              className="hover:text-zinc-900 transition-colors truncate max-w-[120px] sm:max-w-none capitalize"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
