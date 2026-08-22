'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  DollarSign,
  UserCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import AdminTable from '@/components/admin/ui/AdminTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import AdminModal from '@/components/admin/ui/AdminModal';
import { FormField, TextInput, TextArea } from '@/components/admin/ui/FormControls';

export default function AdminAgentsPage() {
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'applicants'
  const [agents, setAgents] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Payout Modal State
  const [payoutAgent, setPayoutAgent] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);

  // Reject / Approve Action State
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const status = activeTab === 'applicants' ? 'pending' : 'approved';
      const params = new URLSearchParams({
        status,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/agents?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setAgents(json.data);
        setCounts(json.counts);
        setPagination((prev) => ({
          ...prev,
          total: json.pagination.total,
          totalPages: json.pagination.totalPages,
        }));
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleAgentAction = async (agentId, action) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAgents();
      }
    } catch (err) {
      console.error('Agent action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!payoutAgent || !payoutAmount) return;

    try {
      setProcessingPayout(true);
      const res = await fetch(`/api/admin/agents/${payoutAgent._id}/payout`, {
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
        setPayoutAgent(null);
        setPayoutAmount('');
        setPayoutRef('');
        setPayoutNotes('');
        fetchAgents();
      }
    } catch (err) {
      console.error('Payout failed:', err);
    } finally {
      setProcessingPayout(false);
    }
  };

  const activeColumns = [
    {
      label: 'Agent / Partner',
      key: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-zinc-900">{row.name}</p>
          <p className="text-[11px] text-zinc-400">{row.email} • {row.city}</p>
        </div>
      ),
    },
    {
      label: 'Referral Code',
      key: 'referralCode',
      render: (row) => (
        <span className="font-mono font-bold text-xs bg-amber-50 text-[#A8875E] border border-amber-200 px-2 py-0.5 rounded-md">
          {row.referralCode || '—'}
        </span>
      ),
    },
    {
      label: 'Sales Channel',
      key: 'salesChannel',
      render: (row) => <span className="text-zinc-600 text-xs">{row.salesChannel}</span>,
    },
    {
      label: 'Total Attributed Sales',
      key: 'totalSales',
      render: (row) => (
        <span className="font-bold text-zinc-900">${row.totalSales?.toLocaleString()}</span>
      ),
    },
    {
      label: 'Commission Owed',
      key: 'commissionOwed',
      render: (row) => (
        <div>
          <span className={`font-bold ${row.commissionOwed > 0 ? 'text-amber-700 font-mono' : 'text-zinc-400'}`}>
            ${row.commissionOwed?.toLocaleString()}
          </span>
          <span className="text-[10px] text-zinc-400 block font-normal">
            ({row.commissionRate || 10}% rate)
          </span>
        </div>
      ),
    },
    {
      label: 'Payout Status',
      key: 'payoutStatus',
      render: (row) => (
        <StatusBadge
          status={row.commissionOwed > 0 ? 'pending_payout' : 'paid'}
          label={row.commissionOwed > 0 ? 'Pending Payout' : 'Up to Date'}
          size="xs"
        />
      ),
    },
    {
      label: 'Action',
      key: 'action',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.commissionOwed > 0 && (
            <button
              onClick={() => {
                setPayoutAgent(row);
                setPayoutAmount(row.commissionOwed.toString());
              }}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Pay ${row.commissionOwed}
            </button>
          )}
          <Link
            href={`/admin/agents/${row._id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <span>File</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      ),
    },
  ];

  const applicantColumns = [
    {
      label: 'Applicant Name',
      key: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-zinc-900">{row.name}</p>
          <p className="text-[11px] text-zinc-400">{row.email} • {row.phone}</p>
        </div>
      ),
    },
    {
      label: 'City / Region',
      key: 'city',
      render: (row) => <span className="text-zinc-700 text-xs">{row.city}</span>,
    },
    {
      label: 'Sales Channel',
      key: 'salesChannel',
      render: (row) => <span className="font-medium text-zinc-800 text-xs">{row.salesChannel}</span>,
    },
    {
      label: 'Experience & Background',
      key: 'experience',
      render: (row) => (
        <p className="text-zinc-600 text-xs truncate max-w-xs">{row.experience || '—'}</p>
      ),
    },
    {
      label: 'Applied On',
      key: 'createdAt',
      render: (row) => (
        <span className="text-zinc-500 text-xs">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      label: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleAgentAction(row._id, 'approve')}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => handleAgentAction(row._id, 'reject')}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
            Trade & Agent Network
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Interior designer commission partners, wholesale reps, and trade applicants.
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          onClick={() => {
            setActiveTab('active');
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className={`pb-3.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'active'
              ? 'border-[#A8875E] text-[#A8875E]'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Active Partners ({counts.approved})
        </button>

        <button
          onClick={() => {
            setActiveTab('applicants');
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className={`pb-3.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'applicants'
              ? 'border-[#A8875E] text-[#A8875E]'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <span>Pending Applicants</span>
          {counts.pending > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {counts.pending}
            </span>
          )}
        </button>
      </div>

      {/* Agents Table */}
      <AdminTable
        columns={activeTab === 'active' ? activeColumns : applicantColumns}
        data={agents}
        loading={loading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search agent name, email, city, referral code..."
        pagination={pagination}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        emptyMessage={
          activeTab === 'active'
            ? 'No approved trade agents found.'
            : 'No pending agent applications waiting for review.'
        }
      />

      {/* Payout Modal */}
      <AdminModal
        isOpen={!!payoutAgent}
        onClose={() => setPayoutAgent(null)}
        title={`Process Commission Payout: ${payoutAgent?.name || ''}`}
        subtitle={`Referral Code: ${payoutAgent?.referralCode || 'N/A'}`}
        footer={
          <>
            <button
              onClick={() => setPayoutAgent(null)}
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
              {processingPayout ? 'Recording Payout...' : 'Confirm Payout'}
            </button>
          </>
        }
      >
        {payoutAgent && (
          <form onSubmit={handlePayoutSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Total Attributed Sales</p>
                <p className="font-bold text-zinc-900 mt-0.5">${payoutAgent.totalSales?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Currently Owed</p>
                <p className="font-bold text-amber-700 mt-0.5">${payoutAgent.commissionOwed?.toLocaleString()}</p>
              </div>
            </div>

            <FormField label="Payout Amount ($ USD)" required>
              <TextInput
                type="number"
                min="1"
                max={payoutAgent.commissionOwed}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Transaction / Reference #" helperText="e.g. WIRE-ACH-89120 or Bank Transfer Ref">
              <TextInput
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
                placeholder="ACH-WIRE-88910"
              />
            </FormField>

            <FormField label="Internal Payout Memo">
              <TextArea
                rows={2}
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                placeholder="e.g. Q1 residential commission paid via bank wire..."
              />
            </FormField>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
