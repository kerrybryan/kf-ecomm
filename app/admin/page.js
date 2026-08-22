'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  MessageSquareQuote,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import MetricCard from '@/components/admin/ui/MetricCard';
import AdminCard from '@/components/admin/ui/AdminCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import SalesTrendChart from '@/components/admin/dashboard/SalesTrendChart';
import TopProductsChart from '@/components/admin/dashboard/TopProductsChart';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpis = data?.kpis;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
            Executive Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time business performance, fulfillment pipelines, and sales analytics.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-medium text-zinc-700 shadow-xs cursor-pointer disabled:opacity-50 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#A8875E] ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Revenue (Month)"
          value={kpis?.totalSales?.formatted || '$0'}
          secondaryValue={`${kpis?.totalSales?.ordersCount || 0} orders`}
          trendPercent={kpis?.totalSales?.trendPercent}
          trendDirection={kpis?.totalSales?.trendDirection}
          icon={DollarSign}
          accentColor="gold"
          loading={loading}
        />

        <MetricCard
          label="Orders Today"
          value={kpis?.ordersToday?.value ?? 0}
          icon={ShoppingBag}
          accentColor="blue"
          loading={loading}
        />

        <MetricCard
          label="Pending Quotes"
          value={kpis?.pendingQuotes?.value ?? 0}
          icon={MessageSquareQuote}
          accentColor="purple"
          loading={loading}
        />

        <MetricCard
          label="Active Agents"
          value={kpis?.activeAgents?.value ?? 0}
          icon={Briefcase}
          accentColor="emerald"
          loading={loading}
        />

        <MetricCard
          label="Low Stock Alerts"
          value={kpis?.lowStock?.value ?? 0}
          icon={AlertTriangle}
          accentColor={kpis?.lowStock?.value > 0 ? 'rose' : 'amber'}
          loading={loading}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend (30 Days) */}
        <div className="lg:col-span-2">
          <AdminCard
            title="30-Day Revenue Trend"
            subtitle="Daily sales volume over the trailing month"
          >
            <SalesTrendChart data={data?.salesTrend} loading={loading} />
          </AdminCard>
        </div>

        {/* Top 5 Products Sold */}
        <div>
          <AdminCard
            title="Top Products Sold"
            subtitle="Ranked by total quantity purchased"
          >
            <TopProductsChart data={data?.topProducts} loading={loading} />
          </AdminCard>
        </div>
      </div>

      {/* Recent Activity Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2">
          <AdminCard
            title="Recent Orders"
            subtitle="Latest 10 orders submitted across all channels"
            action={
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-[#A8875E] hover:underline flex items-center gap-1"
              >
                <span>All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="overflow-x-auto -mx-6 -my-6">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Order #</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Items</th>
                    <th className="px-6 py-3.5">Total</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-normal">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-3.5">
                          <div className="h-4 bg-zinc-100 rounded w-3/4" />
                        </td>
                      </tr>
                    ))
                  ) : data?.recentOrders?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    data?.recentOrders?.map((order) => (
                      <tr key={order._id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-zinc-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-medium text-zinc-800">{order.customer?.name}</p>
                          <p className="text-[11px] text-zinc-400">{order.customer?.email}</p>
                        </td>
                        <td className="px-6 py-3.5 text-zinc-500">
                          {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-zinc-900">
                          ${order.total?.toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={order.status} size="xs" />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="text-xs font-semibold text-[#A8875E] hover:underline"
                          >
                            Details →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>

        {/* Recent Agent Activity */}
        <div>
          <AdminCard
            title="Trade Agent Activity"
            subtitle="Recent partner registrations & commissions"
            action={
              <Link
                href="/admin/agents"
                className="text-xs font-semibold text-[#A8875E] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1">
                    <div className="h-4 bg-zinc-100 rounded w-1/2" />
                    <div className="h-3 bg-zinc-100 rounded w-1/3" />
                  </div>
                ))
              ) : data?.recentAgents?.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">No agent activity yet.</p>
              ) : (
                data?.recentAgents?.map((agent) => (
                  <div
                    key={agent._id}
                    className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100 flex items-start justify-between gap-3 hover:border-zinc-200 transition-all"
                  >
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">{agent.name}</p>
                      <p className="text-[11px] text-zinc-400">{agent.salesChannel} • {agent.city}</p>
                      {agent.referralCode && (
                        <span className="inline-block mt-1 text-[10px] font-mono font-medium px-1.5 py-0.5 bg-zinc-200/60 rounded text-zinc-700">
                          {agent.referralCode}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={agent.status} size="xs" />
                      {agent.commissionOwed > 0 && (
                        <p className="text-[11px] font-semibold text-amber-700 mt-1">
                          ${agent.commissionOwed.toLocaleString()} owed
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
