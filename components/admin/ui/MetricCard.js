import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({
  label,
  value,
  secondaryValue,
  icon: Icon,
  trendPercent,
  trendDirection,
  trendLabel = 'vs last month',
  accentColor = 'gold', // gold, blue, emerald, amber, purple
  loading = false,
}) {
  const accentStyles = {
    gold: 'bg-amber-50 text-[#A8875E] border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-zinc-200 rounded w-24" />
          <div className="w-10 h-10 bg-zinc-200 rounded-lg" />
        </div>
        <div className="h-8 bg-zinc-200 rounded w-32 mb-2" />
        <div className="h-3 bg-zinc-200 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-5.5 shadow-xs hover:border-zinc-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight font-sans">
              {value}
            </span>
            {secondaryValue && (
              <span className="text-xs text-zinc-400 font-medium">({secondaryValue})</span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
              accentStyles[accentColor] || accentStyles.gold
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trendPercent !== undefined && (
        <div className="mt-3.5 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-xs">
          {trendDirection === 'up' ? (
            <span className="inline-flex items-center text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{trendPercent}%
            </span>
          ) : trendDirection === 'down' ? (
            <span className="inline-flex items-center text-rose-600 font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trendPercent}%
            </span>
          ) : (
            <span className="inline-flex items-center text-zinc-400 font-semibold">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              0%
            </span>
          )}
          <span className="text-zinc-400 text-[11px] font-normal">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
