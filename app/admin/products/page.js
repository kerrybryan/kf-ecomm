'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Upload,
  Trash2,
  Edit,
  Star,
  ExternalLink,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import AdminTable from '@/components/admin/ui/AdminTable';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import AdminModal from '@/components/admin/ui/AdminModal';
import { parseProductCSV } from '@/lib/csv';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Delete modal state
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // CSV Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.set('search', search);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (stockFilter !== 'all') params.set('stockStatus', stockFilter);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        setPagination((prev) => ({
          ...prev,
          total: json.pagination.total,
          totalPages: json.pagination.totalPages,
        }));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, selectedCategory, selectedStatus, stockFilter, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/content/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/products/${deleteProduct._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setDeleteProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error('Delete product error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const { valid, errors } = parseProductCSV(text);
        setCsvPreview({ text, valid, errors });
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (!csvPreview?.text) return;
    try {
      setImporting(true);
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: csvPreview.text }),
      });
      const json = await res.json();
      if (json.success) {
        setImportResult(json);
        fetchProducts();
      } else {
        setImportResult({ error: json.error, details: json.details });
      }
    } catch (err) {
      setImportResult({ error: err.message });
    } finally {
      setImporting(false);
    }
  };

  const columns = [
    {
      label: 'Product',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-zinc-100 border border-zinc-200/80 overflow-hidden shrink-0">
            {row.images?.[0] ? (
              <img
                src={row.images[0]}
                alt={row.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                No Img
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-zinc-900 truncate max-w-[220px]">{row.name}</p>
            <p className="text-[11px] text-zinc-400 font-mono truncate">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      label: 'Category',
      key: 'category',
      sortable: true,
      render: (row) => (
        <span className="capitalize px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded text-xs">
          {row.category?.replace(/-/g, ' ')}
        </span>
      ),
    },
    {
      label: 'Price',
      key: 'price',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-zinc-900">ETB {row.price?.toLocaleString()}</span>
          {row.originalPrice && (
            <span className="text-[11px] text-zinc-400 line-through ml-1.5">
              ETB {row.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
    {
      label: 'Stock',
      key: 'stockCount',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge
            status={row.stockCount > 5 ? 'in_stock' : row.stockCount > 0 ? 'low_stock' : 'out_of_stock'}
            label={`${row.stockCount || 0} in stock`}
            size="xs"
          />
        </div>
      ),
    },
    {
      label: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="xs" />,
    },
    {
      label: 'Rating',
      key: 'rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 text-zinc-700">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium">{row.rating?.toFixed(1) || '5.0'}</span>
          <span className="text-zinc-400 text-[11px]">({row.reviewCount || 0})</span>
        </div>
      ),
    },
    {
      label: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/product/${row.slug}`}
            target="_blank"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            title="View on Storefront"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/admin/products/${row._id}/edit`}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
            title="Edit Product"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDeleteProduct(row)}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
            Product Catalog
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage inventory, pricing, specifications, and bulk CSV uploads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setImportModalOpen(true);
              setCsvFile(null);
              setCsvPreview(null);
              setImportResult(null);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#A8875E]" />
            <span>Bulk CSV Import</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Product List Table with Custom Filter Slot */}
      <AdminTable
        columns={columns}
        data={products}
        loading={loading}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search product name, slug, description..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-[#A8875E] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-[#A8875E] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-[#A8875E] cursor-pointer"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt; 5)</option>
              <option value="low_stock">Low Stock (1–5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        title="Soft Delete Product"
        subtitle="Are you sure you want to remove this item from active catalog?"
        footer={
          <>
            <button
              onClick={() => setDeleteProduct(null)}
              disabled={deleting}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Move to Trash'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              This product will be soft-deleted and unlisted from the store. Past customer orders
              and historical sales analytics referencing this product ID will be preserved safely.
            </p>
          </div>
          {deleteProduct && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
              <img
                src={deleteProduct.images?.[0] || ''}
                alt={deleteProduct.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <p className="text-xs font-bold text-zinc-900">{deleteProduct.name}</p>
                <p className="text-[11px] text-zinc-500">ETB {deleteProduct.price?.toLocaleString()} • {deleteProduct.category}</p>
              </div>
            </div>
          )}
        </div>
      </AdminModal>

      {/* Bulk CSV Import Modal */}
      <AdminModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Bulk Product CSV Import"
        subtitle="Upload a spreadsheet with product details to batch create or update catalog"
        maxWidth="max-w-3xl"
        footer={
          <>
            <button
              onClick={() => setImportModalOpen(false)}
              disabled={importing}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            {csvPreview?.valid?.length > 0 && !importResult?.stats && (
              <button
                onClick={handleImportConfirm}
                disabled={importing}
                className="px-4 py-2 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {importing ? 'Importing Batch...' : `Confirm Import (${csvPreview.valid.length} items)`}
              </button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-zinc-200 hover:border-[#A8875E] rounded-2xl p-6 text-center transition-colors bg-zinc-50/50">
            <FileSpreadsheet className="w-10 h-10 text-[#A8875E] mx-auto mb-2" />
            <p className="text-xs font-semibold text-zinc-800">
              Select or drop your CSV file here
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Supports columns: name, category, price, description, images, materials, colors, dimensions, stock_count, status
            </p>
            <label className="mt-3 inline-block px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-all">
              <span>Browse CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
            {csvFile && <p className="text-xs font-mono text-[#A8875E] mt-2">{csvFile.name}</p>}
          </div>

          {/* Import Result Notification */}
          {importResult?.stats && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900">{importResult.message}</p>
                <p className="text-emerald-700 mt-0.5">
                  Created: {importResult.stats.insertedCount} | Updated: {importResult.stats.updatedCount} | Failed: {importResult.stats.failedCount}
                </p>
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          {csvPreview?.valid?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-600 font-semibold">
                <span>Preview Parsed Products ({csvPreview.valid.length} valid rows):</span>
                {csvPreview.errors?.length > 0 && (
                  <span className="text-rose-600 font-normal">
                    {csvPreview.errors.length} rows skipped with errors
                  </span>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto border border-zinc-200 rounded-xl">
                <table className="w-full text-left text-[11px] text-zinc-600">
                  <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-500 uppercase sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {csvPreview.valid.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="px-3 py-2 font-medium text-zinc-900 truncate max-w-[180px]">
                          {row.name}
                        </td>
                        <td className="px-3 py-2 capitalize">{row.category}</td>
                        <td className="px-3 py-2 font-semibold">ETB {row.price}</td>
                        <td className="px-3 py-2">{row.stockCount}</td>
                        <td className="px-3 py-2 capitalize">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvPreview.valid.length > 10 && (
                <p className="text-[11px] text-zinc-400 text-right">
                  + {csvPreview.valid.length - 10} more rows will be imported
                </p>
              )}
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
