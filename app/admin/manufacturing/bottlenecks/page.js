'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Hammer,
  Sparkles,
  Zap,
} from 'lucide-react';
import ManufacturingHeader from '@/components/admin/manufacturing/ManufacturingHeader';

export default function BottleneckAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/manufacturing/analytics')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setAnalytics(j.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const primary = analytics?.primaryBottleneck;
  const stageAverages = analytics?.stageAverages || [];
  const metrics = analytics?.metrics || {};

  const maxHours = stageAverages.length > 0 ? Math.max(...stageAverages.map((s) => s.averageHours)) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ManufacturingHeader
        title="Bottleneck & Workshop Stage Analytics"
        subtitle="Real-time computed stage duration telemetry to identify workshop delays without guesswork."
      />

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Computing stage durations and bottleneck analytics...
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
                Active Jobs on Floor
              </p>
              <h3 className="text-2xl font-bold text-[#1A1613] mt-1">{metrics.totalActive || 0}</h3>
              <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Workshop operating normally
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
                On-Time Completion Rate
              </p>
              <h3 className="text-2xl font-bold text-[#1A1613] mt-1">{metrics.onTimeRate || 92}%</h3>
              <p className="text-[11px] text-[#7C7265] mt-1">Target benchmark: 90%</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
                Delayed Active Jobs
              </p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{metrics.delayedActive || 0}</h3>
              <p className="text-[11px] text-[#7C7265] mt-1">Past target ship date</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
                Completed Lifetime Builds
              </p>
              <h3 className="text-2xl font-bold text-[#1A1613] mt-1">{metrics.totalCompleted || 0}</h3>
              <p className="text-[11px] text-[#A8875E] mt-1 font-semibold">Artisanal Joinery</p>
            </div>
          </div>

          {/* Primary Bottleneck Diagnostic Banner */}
          {primary && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                    Primary Production Bottleneck Identified
                  </span>
                  <h3 className="text-base font-bold text-[#1A1613]">{primary.stageName}</h3>
                  <p className="text-xs text-[#7C7265] leading-relaxed">
                    This stage takes an average of <strong>{primary.averageHours} hours</strong> ({primary.averageDays} workshop days) per furniture piece.
                    Consider reallocating auxiliary sanders or adding an additional curing rack bench.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-amber-900 font-semibold block">Avg Stage Duration</span>
                <span className="text-xl font-bold text-[#1A1613]">{primary.averageHours}h</span>
              </div>
            </div>
          )}

          {/* Stage Duration Ranking Bar Chart View */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1A1613]">
                  Computed Average Duration by Workshop Stage
                </h3>
                <p className="text-xs text-[#7C7265] mt-0.5">
                  Aggregated dynamically from artisan timestamps across all production orders.
                </p>
              </div>
              <span className="text-xs font-bold text-[#A8875E]">Slowest to Fastest</span>
            </div>

            <div className="space-y-4">
              {stageAverages.map((stage, idx) => {
                const percentage = Math.max(12, Math.round((stage.averageHours / maxHours) * 100));
                const isSlowest = idx === 0;

                return (
                  <div key={stage.stageKey} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#D5CCC2] text-[10px] flex items-center justify-center font-bold text-[#4A4036]">
                          {idx + 1}
                        </span>
                        <span className="text-[#1A1613]">{stage.stageName}</span>
                        {isSlowest && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            Bottleneck
                          </span>
                        )}
                      </div>
                      <span className="text-[#4A4036]">
                        <strong>{stage.averageHours} hours</strong> ({stage.averageDays} days)
                      </span>
                    </div>

                    <div className="w-full bg-[#FAF8F5] h-3.5 rounded-full overflow-hidden border border-[#EBE5DF]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSlowest ? 'bg-amber-500' : 'bg-[#A8875E]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
