import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const ACCENT_MAP = {
  gold:    { bg: 'bg-amber-50',   text: 'text-[#A8875E]', border: 'border-amber-100', glow: 'shadow-amber-100' },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',   border: 'border-blue-100',  glow: 'shadow-blue-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600',border: 'border-emerald-100',glow: 'shadow-emerald-100' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',  border: 'border-amber-100', glow: 'shadow-amber-100' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600', border: 'border-purple-100',glow: 'shadow-purple-100' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',   border: 'border-rose-100',  glow: 'shadow-rose-100' },
};

export default function MetricCard({
  label,
  value,
  secondaryValue,
  icon: Icon,
  trendPercent,
  trendDirection,
  trendLabel = 'vs last month',
  accentColor = 'gold',
  loading = false,
}) {
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.gold;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 bg-zinc-100 rounded w-20" />
          <div className="w-10 h-10 bg-zinc-100 rounded-xl" />
        </div>
        <div className="h-8 bg-zinc-100 rounded w-28 mb-2" />
        <div className="h-2.5 bg-zinc-100 rounded w-16" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest leading-tight">
          {label}
        </p>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${accent.bg} ${accent.border} group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon className={`w-5 h-5 ${accent.text}`} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight tabular-nums">
          {value}
        </span>
        {secondaryValue && (
          <span className="text-xs text-zinc-400 font-medium">({secondaryValue})</span>
        )}
      </div>

      {/* Trend */}
      {trendPercent !== undefined && (
        <div className="mt-3.5 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-xs">
          {trendDirection === 'up' ? (
            <span className="inline-flex items-center text-emerald-600 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{trendPercent}%
            </span>
          ) : trendDirection === 'down' ? (
            <span className="inline-flex items-center text-rose-600 font-bold">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trendPercent}%
            </span>
          ) : (
            <span className="inline-flex items-center text-zinc-400 font-bold">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              0%
            </span>
          )}
          <span className="text-zinc-400 text-[11px]">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
