'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function TopProductsChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-zinc-50/50 rounded-xl animate-pulse">
        <span className="text-xs text-zinc-400">Loading top products...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-zinc-50/50 rounded-xl">
        <span className="text-xs text-zinc-400">No product sales recorded yet.</span>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item._id && item._id.length > 22 ? `${item._id.substring(0, 22)}...` : item._id,
    fullName: item._id,
    unitsSold: item.unitsSold,
    revenue: item.totalRevenue,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-zinc-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-zinc-800 space-y-1">
          <p className="font-semibold text-zinc-200">{d.fullName}</p>
          <p className="text-[#A8875E] font-bold text-sm">{d.unitsSold} units sold</p>
          <p className="text-zinc-400 text-[11px]">ETB {d.revenue?.toLocaleString()} total revenue</p>
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#A8875E', '#C2A37B', '#8F6F46', '#D6BC99', '#705432'];

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#4B5563', fontSize: 10 }}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="unitsSold" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
