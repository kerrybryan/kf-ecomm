'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function SalesTrendChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-zinc-50/50 rounded-xl animate-pulse">
        <span className="text-xs text-zinc-400">Loading sales trend...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-zinc-50/50 rounded-xl">
        <span className="text-xs text-zinc-400">No sales recorded in the last 30 days.</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const rev = payload[0].value;
      const orders = payload[0].payload.orders;
      return (
        <div className="bg-zinc-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-zinc-800 space-y-1">
          <p className="font-semibold text-zinc-200">{payload[0].payload.date}</p>
          <p className="text-[#A8875E] font-bold text-sm">ETB {rev.toLocaleString()}</p>
          <p className="text-zinc-400 text-[11px]">{orders} orders placed</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="goldRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A8875E" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#A8875E" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#A8875E"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#goldRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
