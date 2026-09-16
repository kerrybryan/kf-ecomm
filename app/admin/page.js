'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  MessageSquareQuote,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Target,
  Zap,
  Users,
  Plus,
  Package,
  ChevronRight,
  Lightbulb,
  BarChart3,
  ShoppingCart,
  Calendar,
  Send,
} from 'lucide-react';
import MetricCard from '@/components/admin/ui/MetricCard';
import AdminCard from '@/components/admin/ui/AdminCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import SalesTrendChart from '@/components/admin/dashboard/SalesTrendChart';
import TopProductsChart from '@/components/admin/dashboard/TopProductsChart';

// Animated counter hook
function useCountUp(target, duration = 1200, enabled = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled || typeof target !== 'number') return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, enabled]);
  return value;
}

// Sales Tips for the intelligence widget
const SALES_TIPS = [
  { icon: '📦', tip: 'Mark your 3 best-selling products as "Featured" to boost homepage visibility.', action: '/admin/products' },
  { icon: '💬', tip: 'You have pending custom quotes — reply within 24h to close 3x more deals.', action: '/admin/inquiries' },
  { icon: '📣', tip: 'Post a product showcase to social media — shops that post weekly see 40% more traffic.', action: '/admin/social' },
  { icon: '🎯', tip: 'Add an "Only X left" tag to low-stock items to create urgency and drive conversions.', action: '/admin/products' },
  { icon: '🤝', tip: 'Activate 2 more trade agents this month to expand your B2B sales channel.', action: '/admin/agents' },
];

// Quick actions config
const QUICK_ACTIONS = [
  { label: 'New Product', href: '/admin/products/new', icon: Package, color: 'bg-[#A8875E]' },
  { label: 'View Orders', href: '/admin/orders', icon: ShoppingBag, color: 'bg-blue-600' },
  { label: 'New Quote', href: '/admin/inquiries', icon: MessageSquareQuote, color: 'bg-purple-600' },
  { label: 'Add Customer', href: '/admin/customers', icon: Users, color: 'bg-emerald-600' },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTip, setActiveTip] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [queuedPostsCount, setQueuedPostsCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [res, qRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/publishing/queue?status=queued').catch(() => null),
      ]);
      const json = await res.json();
      if (json.success) setData(json.data);

      if (qRes) {
        const qJson = await qRes.json();
        if (qJson.success && qJson.counts) {
          setQueuedPostsCount(qJson.counts.queued);
        }
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
    // Cycle tips every 6s
    const tipTimer = setInterval(() => setActiveTip((p) => (p + 1) % SALES_TIPS.length), 6000);
    // Live clock
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    return () => { clearInterval(tipTimer); clearInterval(clockTimer); };
  }, []);

  const kpis = data?.kpis;
  const revenueVal = typeof kpis?.totalSales?.raw === 'number' ? kpis.totalSales.raw : 0;
  const animatedRevenue = useCountUp(revenueVal, 1400, !loading);
  const animatedOrders = useCountUp(kpis?.ordersToday?.value ?? 0, 800, !loading);

  // Revenue goal progress (mock 80% of 500k goal)
  const revenueGoal = 500000;
  const revenueProgress = Math.min((revenueVal / revenueGoal) * 100, 100);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-7">

      {/* === GRADIENT HEADER BANNER === */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1A1613] via-[#2D2218] to-[#1A1613] px-7 py-7 shadow-xl">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #A8875E 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        {/* Amber glow blob */}
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#A8875E]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full bg-[#B8551F]/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Live Dashboard</span>
              <span className="text-[#6B5E4E] text-[11px] ml-2">{currentTime} · {today}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Executive Overview
            </h1>
            <p className="text-[#A3998D] text-xs mt-1">
              Real-time performance · fulfillment pipelines · sales analytics
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick action buttons */}
            {QUICK_ACTIONS.map((qa) => {
              const Icon = qa.icon;
              return (
                <Link
                  key={qa.href}
                  href={qa.href}
                  id={`quick-action-${qa.label.toLowerCase().replace(/\s/g, '-')}`}
                  className={`${qa.color} hover:opacity-90 text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all hover:scale-105 shadow-md`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {qa.label}
                </Link>
              );
            })}

            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              id="refresh-dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-medium text-white/80 cursor-pointer disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#A8875E] ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* === SALES INTELLIGENCE STRIP === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Revenue Goal Progress */}
        <div className="sm:col-span-2 bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#A8875E]" />
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Monthly Revenue Goal</span>
            </div>
            <span className="text-xs font-bold text-zinc-500">
              ETB {animatedRevenue.toLocaleString()} / {revenueGoal.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${revenueProgress}%`,
                background: revenueProgress >= 80
                  ? 'linear-gradient(90deg, #059669, #10b981)'
                  : 'linear-gradient(90deg, #A8875E, #D99A2B)',
              }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-zinc-400">
            <span>{Math.round(revenueProgress)}% achieved</span>
            <span>{revenueProgress < 100 ? `ETB ${(revenueGoal - revenueVal).toLocaleString()} remaining` : '🎉 Goal hit!'}</span>
          </div>
        </div>

        {/* Conversion snapshot */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#A8875E]" />
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Avg Order Value</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              {kpis?.totalSales?.ordersCount > 0
                ? `ETB ${Math.round(revenueVal / kpis.totalSales.ordersCount).toLocaleString()}`
                : 'ETB 0'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">Per transaction this month</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ Higher = better margin</span>
          </div>
        </div>
      </div>

      {/* === 5 KPI METRIC CARDS === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Revenue (Month)"
          value={kpis?.totalSales?.formatted || 'ETB 0'}
          secondaryValue={`${kpis?.totalSales?.ordersCount || 0} orders`}
          trendPercent={kpis?.totalSales?.trendPercent}
          trendDirection={kpis?.totalSales?.trendDirection}
          icon={DollarSign}
          accentColor="gold"
          loading={loading}
        />
        <MetricCard
          label="Orders Today"
          value={loading ? '—' : animatedOrders}
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

      {/* === CHARTS === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminCard title="30-Day Revenue Trend" subtitle="Daily sales volume over the trailing month">
            <SalesTrendChart data={data?.salesTrend} loading={loading} />
          </AdminCard>
        </div>
        <div>
          <AdminCard title="Top Products Sold" subtitle="Ranked by total quantity purchased">
            <TopProductsChart data={data?.topProducts} loading={loading} />
          </AdminCard>
        </div>
      </div>

      {/* === SALES TIP WIDGET + RECENT ORDERS === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2">
          <AdminCard
            title="Recent Orders"
            subtitle="Latest orders across all channels"
            action={
              <Link href="/admin/orders" className="text-xs font-semibold text-[#A8875E] hover:underline flex items-center gap-1">
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
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="h-4 bg-zinc-100 rounded w-3/4" />
                        </td>
                      </tr>
                    ))
                  ) : !data?.recentOrders?.length ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-zinc-400">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    data.recentOrders.map((order, i) => (
                      <tr
                        key={order._id}
                        className={`transition-colors hover:bg-amber-50/30 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40'}`}
                      >
                        <td className="px-6 py-3.5 font-bold text-zinc-900">{order.orderNumber}</td>
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-zinc-800">{order.customer?.name}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{order.customer?.email}</p>
                        </td>
                        <td className="px-6 py-3.5 text-zinc-500">
                          {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-zinc-900">
                          ETB {order.total?.toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={order.status} size="xs" />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#A8875E] hover:text-[#785E3B] transition-colors"
                          >
                            Details
                            <ChevronRight className="w-3 h-3" />
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

        {/* Right column: Sales Tips + Agent Activity */}
        <div className="space-y-5">
          {/* === SALES TIPS WIDGET === */}
          <div className="bg-gradient-to-br from-[#1A1613] to-[#2D2218] rounded-2xl p-5 shadow-lg border border-[#352D26] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#A8875E]/10 blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#A8875E]/20 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-[#D99A2B]" />
                </div>
                <span className="text-xs font-bold text-[#D99A2B] uppercase tracking-wider">Sales Intelligence</span>
              </div>

              {/* Animated tip */}
              <div
                key={activeTip}
                style={{ animation: 'fadeSlideIn 0.4s ease both' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">{SALES_TIPS[activeTip].icon}</span>
                  <p className="text-xs text-[#D5CCC0] leading-relaxed">{SALES_TIPS[activeTip].tip}</p>
                </div>
                <Link
                  href={SALES_TIPS[activeTip].action}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#A8875E] hover:text-[#D99A2B] transition-colors"
                >
                  Take Action
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Tip dots */}
              <div className="mt-5 flex items-center gap-1.5">
                {SALES_TIPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTip(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === activeTip ? 'w-5 h-1.5 bg-[#D99A2B]' : 'w-1.5 h-1.5 bg-[#4E4336]'
                    }`}
                    aria-label={`Tip ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* === PUBLISHING QUEUE WIDGET (Part F) === */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border-2 border-[#E5DDD3] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E5DDD3] flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#B8551F]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#201C18]">Publishing Schedule</h3>
                  <p className="text-[10px] text-[#6B6459]">Manual Social Channels</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FAF8F5] text-[#B8551F] border border-[#E5DDD3]">
                {queuedPostsCount} Queued
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-[#201C18]">
                  {queuedPostsCount > 0 ? `${queuedPostsCount} posts ready to publish` : 'Queue is all caught up!'}
                </p>
                <p className="text-[10px] text-[#6B6459]">
                  Copy captions & download media in 1 click
                </p>
              </div>
              <Link
                href="/admin/publishing"
                className="px-3 py-1.5 bg-[#B8551F] hover:bg-[#8F4116] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
              >
                <span>View Queue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Agent Activity */}
          <AdminCard
            title="Trade Agent Activity"
            subtitle="Recent partner registrations"
            action={
              <Link href="/admin/agents" className="text-xs font-semibold text-[#A8875E] hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1">
                    <div className="h-4 bg-zinc-100 rounded w-1/2" />
                    <div className="h-3 bg-zinc-100 rounded w-1/3" />
                  </div>
                ))
              ) : !data?.recentAgents?.length ? (
                <p className="text-xs text-zinc-400 py-4 text-center">No agent activity yet.</p>
              ) : (
                data.recentAgents.map((agent) => (
                  <div
                    key={agent._id}
                    className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100 flex items-start justify-between gap-3 hover:border-zinc-200 hover:bg-zinc-100/60 transition-all"
                  >
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">{agent.name}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{agent.salesChannel} · {agent.city}</p>
                      {agent.referralCode && (
                        <span className="inline-block mt-1 text-[10px] font-mono font-medium px-1.5 py-0.5 bg-zinc-200/60 rounded text-zinc-600">
                          {agent.referralCode}
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={agent.status} size="xs" />
                      {agent.commissionOwed > 0 && (
                        <p className="text-[11px] font-bold text-amber-700 mt-1">
                          ETB {agent.commissionOwed.toLocaleString()} owed
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

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
