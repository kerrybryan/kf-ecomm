'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquareQuote,
  Eye,
  Send,
  Calendar,
  User,
  Mail,
  Phone,
  Layers,
  DollarSign,
  Ruler,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import AdminTable from '@/components/admin/ui/AdminTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import AdminModal from '@/components/admin/ui/AdminModal';
import { FormField, TextArea, Select, TextInput } from '@/components/admin/ui/FormControls';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Detail Modal State
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.set('search', search);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setInquiries(json.data);
        setPagination((prev) => ({
          ...prev,
          total: json.pagination.total,
          totalPages: json.pagination.totalPages,
        }));
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const openDetailModal = (inquiry) => {
    setActiveInquiry(inquiry);
    setNewStatus(inquiry.status);
    setNoteInput('');
  };

  const handleStatusChange = async (statusVal) => {
    if (!activeInquiry) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/inquiries/${activeInquiry._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusVal }),
      });
      const json = await res.json();
      if (json.success) {
        setActiveInquiry((prev) => ({ ...prev, status: statusVal }));
        fetchInquiries();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteInput.trim() || !activeInquiry) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/inquiries/${activeInquiry._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setNoteInput('');
        setActiveInquiry((prev) => ({
          ...prev,
          internalNotes: json.data,
        }));
        fetchInquiries();
      }
    } catch (err) {
      console.error('Add note failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      label: 'Prospect / Client',
      key: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-zinc-900">{row.name}</p>
          <p className="text-[11px] text-zinc-400">{row.email}</p>
        </div>
      ),
    },
    {
      label: 'Type',
      key: 'type',
      render: (row) => <StatusBadge status={row.type} size="xs" />,
    },
    {
      label: 'Subject / Project Context',
      key: 'message',
      render: (row) => (
        <div className="max-w-xs truncate">
          <p className="text-zinc-800 font-medium truncate">
            {row.productContext || row.message}
          </p>
          <p className="text-[11px] text-zinc-400 truncate">{row.message}</p>
        </div>
      ),
    },
    {
      label: 'Date',
      key: 'createdAt',
      render: (row) => (
        <span className="text-zinc-500 text-xs">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      label: 'Pipeline Stage',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      label: 'Action',
      key: 'action',
      className: 'text-right',
      render: (row) => (
        <button
          onClick={() => openDetailModal(row)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
            Custom Quotes & Wholesale CRM
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Bespoke commissions, trade inquiries, and hotel procurement leads.
          </p>
        </div>
      </div>

      {/* Inquiries Table */}
      <AdminTable
        columns={columns}
        data={inquiries}
        loading={loading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search client name, email, project keyword..."
        pagination={pagination}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-[#A8875E] cursor-pointer"
            >
              <option value="all">All Inquiry Types</option>
              <option value="general">General</option>
              <option value="custom">Custom Order</option>
              <option value="wholesale">Wholesale / Trade</option>
              <option value="support">Support</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-[#A8875E] cursor-pointer"
            >
              <option value="all">All Pipeline Stages</option>
              <option value="new">New</option>
              <option value="in_review">In Review</option>
              <option value="quoted">Quoted</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        }
      />

      {/* Inquiry Detail Modal */}
      <AdminModal
        isOpen={!!activeInquiry}
        onClose={() => setActiveInquiry(null)}
        title={`Inquiry File: ${activeInquiry?.name || ''}`}
        subtitle={`Submitted on ${
          activeInquiry ? new Date(activeInquiry.createdAt).toLocaleDateString() : ''
        }`}
        maxWidth="max-w-2xl"
      >
        {activeInquiry && (
          <div className="space-y-6">
            {/* Status Pipeline Buttons */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                Pipeline Stage:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['new', 'in_review', 'quoted', 'won', 'lost'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      activeInquiry.status === st
                        ? 'bg-[#A8875E] text-[#1A1613] shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Prospect</p>
                <p className="font-bold text-zinc-900 mt-0.5">{activeInquiry.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Email</p>
                <a
                  href={`mailto:${activeInquiry.email}`}
                  className="text-[#A8875E] hover:underline font-medium mt-0.5 block truncate"
                >
                  {activeInquiry.email}
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400">Phone</p>
                <p className="text-zinc-800 font-medium mt-0.5">{activeInquiry.phone || '—'}</p>
              </div>
            </div>

            {/* Project Specifications */}
            {(activeInquiry.productContext || activeInquiry.dimensions || activeInquiry.budget) && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {activeInquiry.productContext && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-amber-700">Project Context</p>
                    <p className="font-semibold text-zinc-900 mt-0.5">{activeInquiry.productContext}</p>
                  </div>
                )}
                {activeInquiry.dimensions && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-amber-700">Dimensions</p>
                    <p className="font-semibold text-zinc-900 mt-0.5">{activeInquiry.dimensions}</p>
                  </div>
                )}
                {activeInquiry.budget && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-amber-700">Target Budget</p>
                    <p className="font-semibold text-zinc-900 mt-0.5">{activeInquiry.budget}</p>
                  </div>
                )}
              </div>
            )}

            {/* Client Message */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Client Request Message:
              </label>
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed">
                {activeInquiry.message}
              </div>
            </div>

            {/* Reference Image */}
            {activeInquiry.referenceImage && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Attached Reference Image:
                </label>
                <a href={activeInquiry.referenceImage} target="_blank" rel="noreferrer">
                  <img
                    src={activeInquiry.referenceImage}
                    alt="Reference"
                    className="w-full max-h-48 object-cover rounded-xl border border-zinc-200 hover:opacity-90 transition-opacity"
                  />
                </a>
              </div>
            )}

            {/* Staff Internal Notes Section */}
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <label className="block text-xs font-semibold text-zinc-800">
                Staff CRM Internal Notes:
              </label>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <TextInput
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add internal note (e.g. Sent sample fabric swatches)..."
                  className="flex-1"
                />
                <button
                  type="submit"
                  disabled={updating || !noteInput.trim()}
                  className="px-4 py-2 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeInquiry.internalNotes?.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 italic">No notes added yet.</p>
                ) : (
                  activeInquiry.internalNotes?.map((n, idx) => (
                    <div key={idx} className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100 text-xs">
                      <p className="text-zinc-800">{n.note}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {n.createdBy} • {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
