'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import FinanceHeader from '@/components/admin/finance/FinanceHeader';

export default function GeneralLedgerPage() {
  const [entries, setEntries] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/finance/ledger', window.location.origin);
      if (selectedType !== 'all') url.searchParams.set('type', selectedType);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setEntries(data.data || []);
        setTotals(data.totals || {});
      }
    } catch (err) {
      console.error('Fetch ledger error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLedger();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <FinanceHeader
        title="General Ledger Journal"
        subtitle="Immutable auto-populating double-entry audit journal synchronized across sales, materials, expenses & payouts."
      />

      {/* Totals Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Total Credits (Inflow)</p>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">
            +${(totals.totalCredits || 0).toLocaleString()}
          </h3>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Total Debits (Outflow)</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">
            -${(totals.totalDebits || 0).toLocaleString()}
          </h3>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Net Operating Balance</p>
          <h3 className="text-2xl font-bold text-[#1A1613] mt-1">
            ${(totals.netBalance || 0).toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'revenue', 'expense', 'agent_payout', 'cogs_material'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedType === t
                  ? 'bg-[#1A1613] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#7C7265] hover:text-[#1A1613]'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#A3998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search entry #, description, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#EBE5DF] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
          />
        </form>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading ledger entries...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EBE5DF] text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
                <tr>
                  <th className="px-5 py-3.5">Entry #</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Category & Description</th>
                  <th className="px-5 py-3.5">Ref ID</th>
                  <th className="px-5 py-3.5 text-right">Debit ($)</th>
                  <th className="px-5 py-3.5 text-right">Credit ($)</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE5DF]">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-[#FAF8F5]/60 transition-colors font-mono text-[11px]">
                    <td className="px-5 py-3.5 font-bold text-[#A8875E]">{entry.entryNumber}</td>
                    <td className="px-5 py-3.5 text-[#7C7265] whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <p className="font-bold text-[#1A1613] text-xs">{entry.description}</p>
                      <span className="text-[10px] uppercase font-bold text-[#7C7265]">{entry.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#7C7265]">{entry.referenceId || '—'}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-red-600">
                      {entry.debit > 0 ? `-$${entry.debit.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-700">
                      {entry.credit > 0 ? `+$${entry.credit.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                        Posted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
