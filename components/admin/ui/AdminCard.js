import React from 'react';

export default function AdminCard({ title, subtitle, action, children, className = '', headerClassName = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className={`px-6 py-4.5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-4 ${headerClassName}`}>
          <div>
            {title && <h3 className="text-base font-semibold text-zinc-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2.5">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
