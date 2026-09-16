'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Eye, ShoppingBag, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import AdminTable from '@/components/admin/ui/AdminTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
        setPagination((prev) => ({
          ...prev,
          total: json.pagination.total,
          totalPages: json.pagination.totalPages,
        }));
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const columns = [
    {
      label: 'Customer Name',
      key: 'name',
      render: (row) => (
        <div>
          <p className="font-bold text-zinc-900">{row.name}</p>
          <p className="text-[11px] text-zinc-400">{row.email}</p>
        </div>
      ),
    },
    {
      label: 'Contact',
      key: 'phone',
      render: (row) => <span className="text-zinc-600 text-xs">{row.phone || '—'}</span>,
    },
    {
      label: 'Orders Placed',
      key: 'totalOrders',
      render: (row) => (
        <span className="font-semibold text-zinc-800">
          {row.totalOrders || 0} {row.totalOrders === 1 ? 'order' : 'orders'}
        </span>
      ),
    },
    {
      label: 'Lifetime Spend',
      key: 'totalSpent',
      render: (row) => (
        <span className="font-bold text-zinc-900">ETB {(row.totalSpent || 0).toLocaleString()}</span>
      ),
    },
    {
      label: 'Member Since',
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
      label: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status || 'active'} size="xs" />,
    },
    {
      label: 'Action',
      key: 'action',
      className: 'text-right',
      render: (row) => (
        <Link
          href={`/admin/customers/${row._id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <span>CRM File</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Review client purchasing patterns, lifetime spending, and internal account notes.
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <AdminTable
        columns={columns}
        data={customers}
        loading={loading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search customer by name, email, phone..."
        pagination={pagination}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
      />
    </div>
  );
}
