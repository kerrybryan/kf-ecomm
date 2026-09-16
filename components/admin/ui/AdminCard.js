import React from 'react';

export default function AdminCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  headerClassName = '',
  noPadding = false,
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-zinc-200/60 shadow-xs hover:shadow-sm transition-shadow duration-200 overflow-hidden ${className}`}
    >
      {(title || subtitle || action) && (
        <div
          className={`px-6 py-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-4 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-zinc-400 mt-0.5 font-normal">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="flex items-center gap-2.5">{action}</div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
