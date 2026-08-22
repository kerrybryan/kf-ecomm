'use client';

import React from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminTable({
  columns = [],
  data = [],
  loading = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterSlot,
  actionSlot,
  sortBy,
  sortOrder = 'desc',
  onSort,
  pagination,
  onPageChange,
  emptyMessage = 'No records found matching your criteria.',
  onRowClick,
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
      {/* Top Toolbar: Search + Filter Slot + Action Slot */}
      {(onSearchChange || filterSlot || actionSlot) && (
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 bg-zinc-50/40">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {onSearchChange && (
              <div className="relative min-w-[240px] max-w-sm flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9.5 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E] transition-all"
                />
              </div>
            )}
            {filterSlot}
          </div>

          {actionSlot && <div className="flex items-center gap-2.5 shrink-0">{actionSlot}</div>}
        </div>
      )}

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200/80 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider select-none">
            <tr>
              {columns.map((col) => {
                const isSortable = col.sortable && onSort;
                const isActiveSort = sortBy === col.key;

                return (
                  <th
                    key={col.key || col.label}
                    className={`px-5 py-3.5 ${col.className || ''} ${
                      isSortable ? 'cursor-pointer hover:bg-zinc-100/80 transition-colors' : ''
                    }`}
                    onClick={() => isSortable && onSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {isSortable && (
                        <span className="text-zinc-400">
                          {isActiveSort ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-[#A8875E]" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-[#A8875E]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 bg-white font-normal">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-4 bg-zinc-100 rounded w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-400">
                  <div className="max-w-xs mx-auto space-y-1">
                    <p className="text-sm font-medium text-zinc-600">{emptyMessage}</p>
                    <p className="text-xs text-zinc-400">Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-zinc-50/70 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key || col.label} className={`px-5 py-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(row, idx) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="px-5 py-3.5 border-t border-zinc-100 bg-zinc-50/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            Showing{' '}
            <span className="font-medium text-zinc-700">
              {data.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-medium text-zinc-700">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium text-zinc-700">{pagination.total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-medium text-zinc-700">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>

            <button
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= (pagination.totalPages || 1) || loading}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
