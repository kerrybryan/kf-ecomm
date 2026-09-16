'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  ArrowRight,
  Calculator,
  Wand2,
  Package,
  Layers,
  RefreshCw,
  ExternalLink,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import StatusBadge from '@/components/admin/ui/StatusBadge';

export default function SourceStudioListPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total: 0, new: 0, priced: 0, content_ready: 0, converted: 0, discarded: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/source-studio', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
      if (categoryFilter !== 'all') url.searchParams.set('category', categoryFilter);
      if (searchTerm) url.searchParams.set('search', searchTerm);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load sourced items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B8551F]" />
            <span className="text-[11px] font-bold text-[#B8551F] uppercase tracking-wider">
              SOURCE STUDIO · INSPIRATION HUB
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#201C18] tracking-tight">
            Sourced Inspiration Pieces
          </h1>
          <p className="text-xs text-[#6B6459] mt-1">
            Track furniture inspirations from photos and links, price them via the Category Pricing Engine, and create social content in Content Studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/pricing/calculate"
            className="px-3.5 py-2.5 rounded-xl border-2 border-[#E5DDD3] bg-white text-xs font-bold text-[#201C18] hover:bg-[#FAF8F5] flex items-center gap-2 transition-all shadow-xs"
          >
            <Calculator className="w-4 h-4 text-[#B8551F]" />
            Pricing Calculator
          </Link>
          <Link
            href="/admin/content-studio"
            className="px-3.5 py-2.5 rounded-xl border-2 border-[#E5DDD3] bg-white text-xs font-bold text-[#201C18] hover:bg-[#FAF8F5] flex items-center gap-2 transition-all shadow-xs"
          >
            <Wand2 className="w-4 h-4 text-[#B8551F]" />
            Content Studio
          </Link>
          <Link
            href="/admin/source-studio/new"
            id="import-inspiration-btn"
            className="px-4 py-2.5 rounded-xl bg-[#B8551F] hover:bg-[#8F4116] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Import Piece
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white border-[#B8551F] shadow-sm'
              : 'bg-white/60 border-[#E5DDD3] hover:border-[#B8551F]/50'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6459]">
            Total Pieces
          </span>
          <p className="text-xl font-extrabold text-[#201C18] mt-0.5">{counts.total || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('new')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'new'
              ? 'bg-white border-amber-500 shadow-sm'
              : 'bg-white/60 border-[#E5DDD3] hover:border-amber-400'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
            Unpriced (New)
          </span>
          <p className="text-xl font-extrabold text-amber-600 mt-0.5">{counts.new || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('priced')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'priced'
              ? 'bg-white border-emerald-500 shadow-sm'
              : 'bg-white/60 border-[#E5DDD3] hover:border-emerald-400'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
            Priced
          </span>
          <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{counts.priced || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('content_ready')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'content_ready'
              ? 'bg-white border-blue-500 shadow-sm'
              : 'bg-white/60 border-[#E5DDD3] hover:border-blue-400'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
            Content Ready
          </span>
          <p className="text-xl font-extrabold text-blue-600 mt-0.5">{counts.content_ready || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('converted_to_product')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'converted_to_product'
              ? 'bg-white border-[#B8551F] shadow-sm'
              : 'bg-white/60 border-[#E5DDD3] hover:border-[#B8551F]/50'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B8551F]">
            Converted
          </span>
          <p className="text-xl font-extrabold text-[#B8551F] mt-0.5">{counts.converted || 0}</p>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border-2 border-[#E5DDD3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search piece name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-2.5 pl-10 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
          />
          <Search className="w-4 h-4 text-[#6B6459] absolute left-3.5 top-3" />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={fetchItems}
            className="p-2.5 rounded-xl border border-[#E5DDD3] bg-[#FAF8F5] hover:bg-white text-[#6B6459] hover:text-[#201C18] transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 bg-white rounded-2xl border-2 border-[#E5DDD3] p-4 animate-pulse" />
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-2xl border-2 border-dashed border-[#E5DDD3] text-center space-y-3">
            <Layers className="w-10 h-10 text-[#6B6459] mx-auto opacity-50" />
            <p className="text-sm font-bold text-[#201C18]">No sourced inspiration pieces found</p>
            <p className="text-xs text-[#6B6459]">Import your first photo or reference link to start pricing</p>
            <Link
              href="/admin/source-studio/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B8551F] text-white rounded-xl text-xs font-bold uppercase tracking-wider mt-2"
            >
              <Plus className="w-4 h-4" />
              Import Piece
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border-2 border-[#E5DDD3] hover:border-[#B8551F] overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-4/3 bg-[#FAF8F5] overflow-hidden">
                  <img
                    src={item.sourceImageUrl}
                    alt={item.name || item.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {item.price > 0 ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                        Priced · {item.price.toLocaleString()} ETB
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                        Unpriced (Draft)
                      </span>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/70 text-white backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-extrabold text-[#201C18] line-clamp-1">
                    {item.name || 'Untitled Piece'}
                  </h3>

                  {item.notes && (
                    <p className="text-[11px] text-[#6B6459] line-clamp-2 italic">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Pricing Breakdown Snapshot if priced */}
                  {item.costBreakdown?.totalCost > 0 && (
                    <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] text-[11px] space-y-1">
                      <div className="flex justify-between text-[#6B6459]">
                        <span>Craft Cost:</span>
                        <span className="font-bold text-[#201C18]">
                          {item.costBreakdown.totalCost.toLocaleString()} Birr
                        </span>
                      </div>
                      <div className="flex justify-between text-[#6B6459]">
                        <span>Selling Price:</span>
                        <span className="font-extrabold text-[#B8551F]">
                          {item.price.toLocaleString()} Birr ({item.costBreakdown.marginPercent}% margin)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/pricing/calculate?sourceItemId=${item._id}&category=${encodeURIComponent(
                      item.category
                    )}`}
                    className="w-full bg-[#FAF8F5] hover:bg-[#EAE1D2] border border-[#E5DDD3] py-2 px-2 rounded-xl text-[11px] font-bold text-[#201C18] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#B8551F]" />
                    <span>{item.price > 0 ? 'Edit Price' : 'Set Price'}</span>
                  </Link>

                  <Link
                    href={`/admin/content-studio?targetId=${item._id}&targetType=SourcedItem`}
                    className={`w-full py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      item.price > 0
                        ? 'bg-[#201C18] hover:bg-[#B8551F] text-white'
                        : 'bg-stone-200 text-stone-500 cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Studio {item.price > 0 ? '' : '🔒'}</span>
                  </Link>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
