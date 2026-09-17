'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  ShieldAlert,
  Percent,
  Download,
  Receipt,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import FinanceHeader from '@/components/admin/finance/FinanceHeader';

export default function FinanceDashboardPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/finance/reports')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setReport(j.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pnl = report?.pnl || {};
  const productMargins = report?.productMargins || [];
  const taxSummary = report?.taxSummary || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <FinanceHeader
        title="Financial Control & P&L Statement"
        subtitle="Real-time profit & loss accounting, product gross margin analytics, and regional sales tax liabilities."
      />

      {/* Sanity Check Alert Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-bold">Accountant Review Notice</strong>
          <p className="text-amber-800 leading-relaxed">
            All revenue, expense, and tax categories are auto-populated from workshop transactions for internal executive decision-making. Ensure a certified CPA reviews final ledger classifications before official annual tax filings.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Aggregating financial reports & ledger transactions...
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Total Revenue (30 Days)</p>
<<<<<<< HEAD
              <h3 className="text-2xl font-bold text-[#1A1613] mt-1">ETB {(pnl.totalRevenue || 0).toLocaleString()}</h3>
=======
              <h3 className="text-2xl font-bold text-[#1A1613] mt-1">${(pnl.totalRevenue || 0).toLocaleString()}</h3>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
              <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> From {report?.orderCount || 0} customer orders
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Gross Profit (After COGS)</p>
<<<<<<< HEAD
              <h3 className="text-2xl font-bold text-[#1A1613] mt-1">ETB {(pnl.grossProfit || 0).toLocaleString()}</h3>
=======
              <h3 className="text-2xl font-bold text-[#1A1613] mt-1">${(pnl.grossProfit || 0).toLocaleString()}</h3>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
              <p className="text-[11px] text-[#A8875E] font-semibold mt-1">
                {pnl.grossMarginPercent || 62}% Gross Margin
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Operating Expenses</p>
<<<<<<< HEAD
              <h3 className="text-2xl font-bold text-gray-800 mt-1">ETB {(pnl.operatingExpenses || 0).toLocaleString()}</h3>
=======
              <h3 className="text-2xl font-bold text-gray-800 mt-1">${(pnl.operatingExpenses || 0).toLocaleString()}</h3>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
              <p className="text-[11px] text-[#7C7265] mt-1">{report?.expenseCount || 0} recorded invoices</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Net Operating Profit</p>
<<<<<<< HEAD
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">ETB {(pnl.netOperatingProfit || 0).toLocaleString()}</h3>
=======
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">${(pnl.netOperatingProfit || 0).toLocaleString()}</h3>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
              <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                {pnl.netProfitMarginPercent || 48}% Net Profit Margin
              </p>
            </div>
          </div>

          {/* Two-Column P&L and Tax Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: P&L Detailed Statement */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
<<<<<<< HEAD
                <h3 className="text-sm font-bold text-[#1A1613]">Executive Profit & Loss Statement (ETB)</h3>
=======
                <h3 className="text-sm font-bold text-[#1A1613]">Executive Profit & Loss Statement (USD)</h3>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                <span className="text-xs text-[#7C7265]">Auto-populated from Ledger</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Revenue Group */}
                <div className="space-y-1.5 pb-2 border-b border-[#F3ECE1]">
                  <div className="flex justify-between font-bold text-[#1A1613]">
                    <span>Gross Product Sales</span>
<<<<<<< HEAD
                    <span>ETB {(pnl.grossProductSales || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#7C7265]">
                    <span>Delivery & Logistics Revenue</span>
                    <span>ETB {(pnl.shippingRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#A8875E] pt-1">
                    <span>Total Net Revenue</span>
                    <span>ETB {(pnl.totalRevenue || 0).toLocaleString()}</span>
=======
                    <span>${(pnl.grossProductSales || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#7C7265]">
                    <span>White-Glove & Shipping Revenue</span>
                    <span>${(pnl.shippingRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#A8875E] pt-1">
                    <span>Total Net Revenue</span>
                    <span>${(pnl.totalRevenue || 0).toLocaleString()}</span>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                  </div>
                </div>

                {/* COGS */}
                <div className="space-y-1.5 pb-2 border-b border-[#F3ECE1]">
                  <div className="flex justify-between text-red-700">
                    <span>Cost of Goods Sold (COGS: Timber, Fabrics, Bench Labor)</span>
<<<<<<< HEAD
                    <span>-ETB {(pnl.cogs || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1A1613] pt-1">
                    <span>Gross Profit</span>
                    <span>ETB {(pnl.grossProfit || 0).toLocaleString()} ({pnl.grossMarginPercent}%)</span>
=======
                    <span>-${(pnl.cogs || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1A1613] pt-1">
                    <span>Gross Profit</span>
                    <span>${(pnl.grossProfit || 0).toLocaleString()} ({pnl.grossMarginPercent}%)</span>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                  </div>
                </div>

                {/* Operating Expenses */}
                <div className="space-y-1.5 pb-2 border-b border-[#F3ECE1]">
                  <div className="flex justify-between text-red-700">
                    <span>Operating Expenses (Rent, Fleet Logistics, Marketing, Payroll)</span>
<<<<<<< HEAD
                    <span>-ETB {(pnl.operatingExpenses || 0).toLocaleString()}</span>
=======
                    <span>-${(pnl.operatingExpenses || 0).toLocaleString()}</span>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                  </div>
                </div>

                {/* Net Profit */}
                <div className="flex justify-between font-bold text-base text-emerald-800 pt-2">
                  <span>Net Operating Profit</span>
<<<<<<< HEAD
                  <span>ETB {(pnl.netOperatingProfit || 0).toLocaleString()} ({pnl.netProfitMarginPercent}%)</span>
=======
                  <span>${(pnl.netOperatingProfit || 0).toLocaleString()} ({pnl.netProfitMarginPercent}%)</span>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                </div>
              </div>
            </div>

            {/* RIGHT: Regional Tax Summary */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
<<<<<<< HEAD
                <h3 className="text-sm font-bold text-[#1A1613]">15% VAT Liabilities</h3>
=======
                <h3 className="text-sm font-bold text-[#1A1613]">Sales Tax Liabilities</h3>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                <span className="text-xs text-[#7C7265]">By Jurisdiction</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EBE5DF] text-center space-y-1">
<<<<<<< HEAD
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Total VAT Collected</p>
                <p className="text-2xl font-bold text-[#1A1613]">ETB {(taxSummary.totalTaxCollected || 0).toLocaleString()}</p>
=======
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Total Tax Collected</p>
                <p className="text-2xl font-bold text-[#1A1613]">${(taxSummary.totalTaxCollected || 0).toLocaleString()}</p>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
              </div>

              <div className="space-y-2.5 text-xs">
                {Object.entries(taxSummary.byRegion || {}).map(([region, amt]) => (
                  <div key={region} className="flex items-center justify-between p-2.5 rounded-xl border border-[#EBE5DF]">
                    <span className="font-semibold text-[#4A4036]">{region}</span>
<<<<<<< HEAD
                    <span className="font-bold text-[#1A1613]">ETB {Number(amt).toLocaleString()}</span>
=======
                    <span className="font-bold text-[#1A1613]">${Number(amt).toLocaleString()}</span>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Gross Margin Leaderboard */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#EBE5DF] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1A1613]">Product Gross Margin % Ranking</h3>
                <p className="text-xs text-[#7C7265] mt-0.5">
                  Gross profit per catalog item computed from retail pricing vs workshop fabrication costs.
                </p>
              </div>
              <span className="text-xs font-bold text-[#A8875E]">Profitability Leaderboard</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#EBE5DF] text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
                  <tr>
                    <th className="px-5 py-3.5">Product Name</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Retail Price</th>
                    <th className="px-5 py-3.5">Estimated Cost</th>
<<<<<<< HEAD
                    <th className="px-5 py-3.5">Gross Margin (ETB)</th>
=======
                    <th className="px-5 py-3.5">Gross Margin ($)</th>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                    <th className="px-5 py-3.5 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE5DF]">
                  {productMargins.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#1A1613]">{prod.name}</td>
                      <td className="px-5 py-4 uppercase text-[10px] font-semibold text-[#7C7265]">{prod.category}</td>
<<<<<<< HEAD
                      <td className="px-5 py-4 font-semibold text-[#1A1613]">ETB {prod.price.toLocaleString()}</td>
                      <td className="px-5 py-4 text-[#7C7265]">ETB {prod.estimatedCost.toLocaleString()}</td>
                      <td className="px-5 py-4 font-bold text-emerald-800">+ETB {prod.grossMargin.toLocaleString()}</td>
=======
                      <td className="px-5 py-4 font-semibold text-[#1A1613]">${prod.price.toLocaleString()}</td>
                      <td className="px-5 py-4 text-[#7C7265]">${prod.estimatedCost.toLocaleString()}</td>
                      <td className="px-5 py-4 font-bold text-emerald-800">+${prod.grossMargin.toLocaleString()}</td>
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                          {prod.marginPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
