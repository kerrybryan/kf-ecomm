import React from 'react';

const STATUS_STYLES = {
  // Orders
  pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  processing: { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  shipped: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  delivered: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },

  // Products
  published: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  draft: { bg: 'bg-zinc-100 text-zinc-600 border-zinc-200', dot: 'bg-zinc-400' },
  in_stock: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  out_of_stock: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  low_stock: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },

  // Inquiries
  new: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  in_review: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  quoted: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  won: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  lost: { bg: 'bg-zinc-100 text-zinc-600 border-zinc-200', dot: 'bg-zinc-400' },

  // Agents
  approved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  paid: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  pending_payout: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },

  // Users
  active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  suspended: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },

  // Inquiry Types
  general: { bg: 'bg-zinc-100 text-zinc-700 border-zinc-200', dot: 'bg-zinc-400' },
  custom: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  wholesale: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  support_type: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },

  // Roles
  super_admin: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  product_manager: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  sales_manager: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  support: { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
};

export default function StatusBadge({ status, label, size = 'sm', showDot = true }) {
  const normalizedKey = String(status || '').toLowerCase().replace(/[\s-]+/g, '_');
  const style = STATUS_STYLES[normalizedKey] || {
    bg: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    dot: 'bg-zinc-400',
  };

  const displayText = label || (status ? String(status).replace(/_/g, ' ') : 'Unknown');

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border capitalize ${style.bg} ${sizeClasses[size] || sizeClasses.sm}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />}
      <span>{displayText}</span>
    </span>
  );
}
