'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  DollarSign,
  UserCheck,
  Calendar,
  CreditCard,
  History,
  Send,
  AlertCircle,
  Building,
  Save,
} from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import { FormField, TextInput, TextArea } from '@/components/admin/ui/FormControls';
import AdminModal from '@/components/admin/ui/AdminModal';

export default function AgentDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit rate state
  const [commissionRate, setCommissionRate] = useState(10);
  const [savingRate, setSavingRate] = useState(false);

  // Payout modal state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/agents/${id}`);
      const json = await res.json();
      if (json.success) {
        setAgent(json.data);
        setCommissionRate(json.data.commissionRate || 10);
      } else {
        setError(json.error || 'Agent not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAgent();
  }, [id]);

  const handleSaveRate = async (e) => {
    e.preventDefault();
    try {
      setSavingRate(true);
      const res = await fetch(`/api/admin/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: Number(commissionRate) }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAgent();
      }
    } catch (err) {
      console.error('Save rate failed:', err);
    } finally {
      setSavingRate(false);
    }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!payoutAmount) return;

    try {
      setProcessingPayout(true);
      const res = await fetch(`/api/admin/agents/${id}/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payoutAmount,
          reference: payoutRef,
          notes: payoutNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPayoutModalOpen(false);
        setPayoutAmount('');
        setPayoutRef('');
        setPayoutNotes('');
        fetchAgent();
      }
    } catch (err) {
      console.error('Payout failed:', err);
    } finally {
      setProcessingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-400">
        <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading trade agent file...</span>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center text-xs text-rose-700">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
        <p className="font-bold">{error || 'Agent record not found'}</p>
        <Link href="/admin/agents" className="text-[#A8875E] font-semibold underline mt-2 inline-block">
          Return to Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/agents"
            className="p-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
                {agent.name}
              </h1>
              <StatusBadge status={agent.status} size="sm" />
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {agent.salesChannel} • {agent.city}
            </p>
          </div>
        </div>

        {agent.commissionOwed > 0 && (
          <button
            onClick={() => {
              setPayoutAmount(agent.commissionOwed.toString());
              setPayoutModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Pay Commission (${agent.commissionOwed?.toLocaleString()})</span>
          </button>
        )}
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-zinc-400">Referral Code</p>
          <p className="text-sm font-bold font-mono text-[#A8875E] mt-1">
            {agent.referralCode || 'NOT ASSIGNED'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-zinc-400">Total Attributed Sales</p>
          <p className="text-lg font-bold text-zinc-900 mt-1">
            ${agent.totalSales?.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-zinc-400">Commission Rate</p>
          <p className="text-lg font-bold text-zinc-900 mt-1">{agent.commissionRate || 10}%</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-zinc-400">Pending Commission Owed</p>
          <p className="text-lg font-bold text-amber-700 mt-1">
            ${agent.commissionOwed?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Grid: Left Attributed Orders & Payout History, Right Agent Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attributed Orders */}
          <AdminCard
            title="Attributed Trade Orders"
            subtitle="Customer orders linked via this partner's unique referral code"
          >
            <div className="overflow-x-auto -mx-6 -my-6">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Order #</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Total</th>
                    <th className="px-6 py-3.5">Estimated Commission</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-normal">
                  {agent.attributedOrders?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-400">
                        No orders attributed to code {agent.referralCode} yet.
                      </td>
                    </tr>
                  ) : (
                    agent.attributedOrders?.map((ord) => (
                      <tr key={ord._id} className="hover:bg-zinc-50">
                        <td className="px-6 py-3.5 font-bold text-zinc-900 font-mono">
                          <Link href={`/admin/orders/${ord._id}`} className="hover:underline text-[#A8875E]">
                            {ord.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 font-medium text-zinc-800">
                          {ord.customer?.name}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-zinc-900">
                          ${ord.total?.toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 text-amber-700 font-bold font-mono">
                          ${Math.round(ord.total * ((agent.commissionRate || 10) / 100)).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={ord.status} size="xs" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>

          {/* Payout History Log */}
          <AdminCard
            title="Commission Payout History"
            subtitle="Immutable records of historical partner settlements"
          >
            <div className="space-y-3">
              {agent.payoutHistory?.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">No payouts recorded yet.</p>
              ) : (
                agent.payoutHistory?.map((pay, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <p className="font-bold text-zinc-900">
                        ${pay.amount?.toLocaleString()} Paid
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Ref: <span className="font-mono">{pay.reference}</span> • {pay.notes}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-600 font-medium">
                        {new Date(pay.paidAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-zinc-400">By: {pay.paidBy}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right Column (1 Col): Partner Profile & Rate Overrides */}
        <div className="space-y-6">
          {/* Partner Information */}
          <AdminCard title="Partner Profile">
            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Email Address</p>
                <a href={`mailto:${agent.email}`} className="text-[#A8875E] hover:underline font-medium">
                  {agent.email}
                </a>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Phone</p>
                <p className="text-zinc-800 font-medium">{agent.phone}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Region / Studio Location</p>
                <p className="text-zinc-800 font-medium">{agent.city}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Experience / Firm Bio</p>
                <p className="text-zinc-600 leading-relaxed">{agent.experience || '—'}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Partner Since</p>
                <p className="text-zinc-600">
                  {new Date(agent.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </AdminCard>

          {/* Commission Rate Override */}
          <AdminCard
            title="Commission Settings"
            subtitle="Custom override rate for this specific trade partner"
          >
            <form onSubmit={handleSaveRate} className="space-y-3">
              <FormField label="Commission Rate (%)">
                <TextInput
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                />
              </FormField>

              <button
                type="submit"
                disabled={savingRate}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingRate ? 'Saving...' : 'Update Commission Rate'}
              </button>
            </form>
          </AdminCard>
        </div>
      </div>

      {/* Payout Modal */}
      <AdminModal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        title={`Settle Trade Commission: ${agent.name}`}
        subtitle={`Referral Code: ${agent.referralCode}`}
        footer={
          <>
            <button
              onClick={() => setPayoutModalOpen(false)}
              disabled={processingPayout}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handlePayoutSubmit}
              disabled={processingPayout || !payoutAmount}
              className="px-5 py-2 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {processingPayout ? 'Recording...' : 'Confirm Payment'}
            </button>
          </>
        }
      >
        <form onSubmit={handlePayoutSubmit} className="space-y-4">
          <FormField label="Payout Amount ($ USD)" required>
            <TextInput
              type="number"
              min="1"
              max={agent.commissionOwed}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Wire / Reference ID">
            <TextInput
              value={payoutRef}
              onChange={(e) => setPayoutRef(e.target.value)}
              placeholder="e.g. WIRE-Q1-NORD-09"
            />
          </FormField>

          <FormField label="Internal Memo">
            <TextArea
              rows={2}
              value={payoutNotes}
              onChange={(e) => setPayoutNotes(e.target.value)}
              placeholder="Notes on invoice # or transaction details..."
            />
          </FormField>
        </form>
      </AdminModal>
    </div>
  );
}
