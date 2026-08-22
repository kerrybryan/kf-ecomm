'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Wand2,
  Package,
  Layers,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import StatusBadge from '@/components/admin/ui/StatusBadge';

export default function SourceStudioListPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total: 0, analyzing: 0, reviewed: 0, converted: 0, discarded: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/source-studio', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
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
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#1A1613]">Source Studio</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8875E] bg-[#A8875E]/15 px-2 py-0.5 rounded border border-[#A8875E]/30">
              AI Vision & Sourcing
            </span>
          </div>
          <p className="text-xs text-[#7C7265] mt-1">
            Turn inspiration photos from Pinterest and web links into priced, branded Nordic furniture listings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/image-studio"
            className="px-4 py-2.5 rounded-xl border border-[#D5CCC2] text-xs font-semibold text-[#4A4036] hover:bg-[#FAF8F5] flex items-center gap-2 transition-all shadow-sm"
          >
            <Wand2 className="w-4 h-4 text-[#A8875E]" />
            Image Studio
          </Link>
          <Link
            href="/admin/source-studio/new"
            className="px-4 py-2.5 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Import Inspiration Image
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'border-[#A8875E] bg-[#FAF8F5] ring-1 ring-[#A8875E]'
              : 'border-[#EBE5DF] bg-white hover:border-[#D5CCC2]'
          }`}
        >
          <p className="text-[10px] uppercase font-bold text-[#7C7265] tracking-wider">Total Sourced</p>
          <p className="text-xl font-serif font-bold text-[#1A1613] mt-1">{counts.total}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('reviewed')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'reviewed'
              ? 'border-[#A8875E] bg-[#FAF8F5] ring-1 ring-[#A8875E]'
              : 'border-[#EBE5DF] bg-white hover:border-[#D5CCC2]'
          }`}
        >
          <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Priced & Reviewed</p>
          <p className="text-xl font-serif font-bold text-[#1A1613] mt-1">{counts.reviewed}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('converted_to_product')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'converted_to_product'
              ? 'border-[#A8875E] bg-[#FAF8F5] ring-1 ring-[#A8875E]'
              : 'border-[#EBE5DF] bg-white hover:border-[#D5CCC2]'
          }`}
        >
          <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Converted</p>
          <p className="text-xl font-serif font-bold text-[#1A1613] mt-1">{counts.converted}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('analyzing')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'analyzing'
              ? 'border-[#A8875E] bg-[#FAF8F5] ring-1 ring-[#A8875E]'
              : 'border-[#EBE5DF] bg-white hover:border-[#D5CCC2]'
          }`}
        >
          <p className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Analyzing</p>
          <p className="text-xl font-serif font-bold text-[#1A1613] mt-1">{counts.analyzing}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('discarded')}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === 'discarded'
              ? 'border-[#A8875E] bg-[#FAF8F5] ring-1 ring-[#A8875E]'
              : 'border-[#EBE5DF] bg-white hover:border-[#D5CCC2]'
          }`}
        >
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Discarded</p>
          <p className="text-xl font-serif font-bold text-[#1A1613] mt-1">{counts.discarded}</p>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-[#EBE5DF] p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#A3998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search furniture type, materials, URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[#EBE5DF] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={fetchItems}
            className="p-2 rounded-lg border border-[#EBE5DF] hover:bg-[#FAF8F5] text-[#7C7265] hover:text-[#1A1613] transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sourced Items Catalog Grid / Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#7C7265]">Loading sourced inspiration catalog...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EBE5DF] text-[#A8875E] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-bold text-[#1A1613]">No Sourced Items Found</h3>
            <p className="text-xs text-[#7C7265] mt-1">
              Import an inspiration image from Pinterest, a designer portfolio, or upload a photo to start AI classification and workshop pricing.
            </p>
          </div>
          <Link
            href="/admin/source-studio/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Import First Inspiration Photo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const hasAi = Boolean(item.aiAnalysis?.furnitureType);
            const isRef = item.isReferenceOnly;
            const price = item.manualOverride?.finalPrice || item.aiAnalysis?.suggestedPriceMin;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Thumbnail Header */}
                <div className="relative h-52 w-full bg-[#FAF8F5] border-b border-[#EBE5DF] overflow-hidden">
                  <Image
                    src={item.sourceImageUrl}
                    alt={item.aiAnalysis?.furnitureType || 'Sourced Furniture Piece'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <StatusBadge status={item.status} size="xs" />
                    {isRef && (
                      <span className="text-[9px] font-bold text-amber-900 bg-amber-100/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-sm">
                        <ShieldAlert className="w-2.5 h-2.5 text-amber-700" />
                        Reference Photo
                      </span>
                    )}
                  </div>

                  {item.aiAnalysis?.complexityRating && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {item.aiAnalysis.complexityRating} complexity
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-[#1A1613] line-clamp-1">
                      {item.aiAnalysis?.furnitureType || 'Analyzing Furniture Piece...'}
                    </h3>

                    {/* Materials tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.aiAnalysis?.materials?.slice(0, 3).map((mat, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium text-[#4A4036] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EBE5DF]"
                        >
                          {mat}
                        </span>
                      ))}
                    </div>

                    {/* Dimensions & Confidence */}
                    {item.aiAnalysis?.estimatedDimensions && (
                      <p className="text-[11px] text-[#7C7265] font-mono">
                        📐 {item.aiAnalysis.estimatedDimensions}
                      </p>
                    )}
                  </div>

                  {/* Pricing Comparison */}
                  <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EBE5DF] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7C7265] block">AI Market Range</span>
                      <span className="text-xs font-semibold text-[#4A4036]">
                        ${item.aiAnalysis?.suggestedPriceMin || 0} – ${item.aiAnalysis?.suggestedPriceMax || 0}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#A8875E] block">Workshop Final</span>
                      <span className="text-sm font-serif font-bold text-[#1A1613]">
                        {price ? `$${price.toLocaleString()}` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-2 border-t border-[#EBE5DF] flex items-center justify-between gap-2">
                    {item.linkedProductId ? (
                      <Link
                        href={`/admin/products/${item.linkedProductId._id || item.linkedProductId}/edit`}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <Package className="w-3.5 h-3.5" />
                        View Draft Product
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/image-studio?sourceId=${item._id}&imageUrl=${encodeURIComponent(item.sourceImageUrl)}`}
                        className="text-xs font-semibold text-[#7C7265] hover:text-[#1A1613] flex items-center gap-1"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-[#A8875E]" />
                        Retouch Image
                      </Link>
                    )}

                    <Link
                      href={`/admin/source-studio/${item._id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#A8875E] hover:text-white text-[#1A1613] text-xs font-bold border border-[#D5CCC2] transition-all flex items-center gap-1.5"
                    >
                      Review & Price
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
