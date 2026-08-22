'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ExternalLink,
  Eye,
  Calendar,
  CreditCard,
  Printer,
  ChevronRight,
} from 'lucide-react';
import AdminTable from '@/components/admin/ui/AdminTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('paymentMethod', paymentFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
        setPagination((prev) => ({
          ...prev,
          total: json.pagination.total,
          totalPages: json.pagination.totalPages,
        }));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, paymentFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const columns = [
    {
      label: 'Order #',
      key: 'orderNumber',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-zinc-900 font-mono">{row.orderNumber}</span>
          <p className="text-[11px] text-zinc-400">
            {new Date(row.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      ),
    },
    {
      label: 'Customer',
      key: 'customer',
      render: (row) => (
        <div>
          <p className="font-semibold text-zinc-900">{row.customer?.name}</p>
          <p className="text-[11px] text-zinc-400">{row.customer?.email}</p>
        </div>
      ),
    },
    {
      label: 'Items',
      key: 'items',
      render: (row) => (
        <span className="text-zinc-600">
          {row.items?.reduce((sum, item) => sum + (item.quantity || 1), 0)} items
        </span>
      ),
    },
    {
      label: 'Total',
      key: 'total',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-zinc-900">${row.total?.toLocaleString()}</span>
      ),
    },
    {
      label: 'Payment',
      key: 'paymentMethod',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="text-zinc-700 capitalize text-xs">
            {row.paymentMethod?.replace(/_/g, ' ')}
          </p>
          <StatusBadge status={row.paymentStatus || 'paid'} size="xs" />
        </div>
      ),
    },
    {
      label: 'Fulfillment',
      key: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      label: 'Action',
      key: 'action',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/orders/${row._id}/invoice`}
            target="_blank"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            title="Print Invoice"
          >
            <Printer className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/admin/orders/${row._id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <span>View</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
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
            Order Fulfillment
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track customer deliveries, update order statuses, and inspect audit logs.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <AdminTable
        columns={columns}
        data={orders}
        loading={loading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search order #, customer name, email..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-[#A8875E] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-[#A8875E] cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="apple_pay">Apple Pay</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
