'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Sparkles,
  Wand2,
  Package,
  ShieldAlert,
  Save,
  Trash2,
  RefreshCw,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import CostCalculator from '@/components/admin/source-studio/CostCalculator';

export default function SourcedItemReviewPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const itemId = resolvedParams.id;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [calculatorState, setCalculatorState] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/source-studio/${itemId}`);
      const data = await res.json();
      if (data.success) {
        setItem(data.data);
      } else {
        setErrorMsg(data.error || 'Failed to load sourced item');
      }
    } catch (err) {
      console.error('Fetch sourced item error:', err);
      setErrorMsg('Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const handleSavePricing = async () => {
    try {
      setIsSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch(`/api/admin/source-studio/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualOverride: calculatorState,
          status: 'reviewed',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save pricing');
      }

      setItem(data.data);
      setSuccessMsg('Workshop pricing formulas saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToDraft = async () => {
    try {
      setIsConverting(true);
      setErrorMsg('');

      // First save current calculator values
      if (calculatorState) {
        await fetch(`/api/admin/source-studio/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ manualOverride: calculatorState }),
        });
      }

      // Convert to product
      const res = await fetch(`/api/admin/source-studio/${itemId}/convert`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to convert to product');
      }

      const productId = data.data?.product?._id;
      if (productId) {
        router.push(`/admin/products/${productId}/edit?converted=true`);
      } else {
        fetchItem();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Conversion failed');
      setIsConverting(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      setIsReanalyzing(true);
      setErrorMsg('');

      const res = await fetch('/api/admin/source-studio/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI re-analysis failed');
      }

      setItem(data.data);
      setSuccessMsg('AI classification and price estimation updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Re-analysis failed');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm('Are you sure you want to mark this sourced item as discarded?')) return;
    try {
      await fetch(`/api/admin/source-studio/${itemId}`, { method: 'DELETE' });
      router.push('/admin/source-studio');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-16 text-center">
        <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#7C7265]">Loading sourced inspiration profile...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
        <h3 className="text-sm font-bold text-[#1A1613]">Sourced Item Not Found</h3>
        <Link
          href="/admin/source-studio"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A8875E] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Source Studio
        </Link>
      </div>
    );
  }

  const ai = item.aiAnalysis || {};
  const isRef = item.isReferenceOnly;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/source-studio"
            className="p-2 rounded-xl border border-[#EBE5DF] bg-white hover:bg-[#FAF8F5] text-[#7C7265] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-[#1A1613]">
                {ai.furnitureType || 'Sourced Inspiration Review'}
              </h1>
              <StatusBadge status={item.status} size="sm" />
            </div>
            <p className="text-xs text-[#7C7265] mt-0.5">
              Review AI joinery classification, set workshop labor & material formulas, and convert into a live listing.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="px-3.5 py-2 rounded-xl border border-[#D5CCC2] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#4A4036] flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#A8875E] ${isReanalyzing ? 'animate-spin' : ''}`} />
            {isReanalyzing ? 'Re-analyzing...' : 'Re-run AI Analysis'}
          </button>

          <button
            type="button"
            onClick={handleDiscard}
            className="p-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors"
            title="Discard Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            href={`/admin/image-studio?sourceId=${item._id}&imageUrl=${encodeURIComponent(item.sourceImageUrl)}`}
            className="px-4 py-2 rounded-xl border border-[#A8875E] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#A8875E] flex items-center gap-2 transition-all shadow-xs"
          >
            <Wand2 className="w-4 h-4" />
            Edit in Image Studio
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Converted Product Notification Banner */}
      {item.linkedProductId && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Converted to Draft Product: {item.linkedProductId.name || 'Nordika Catalog Product'}
              </p>
              <p className="text-[11px] text-emerald-700">
                This item is now a draft catalog listing priced at ${item.linkedProductId.price?.toLocaleString()}.
              </p>
            </div>
          </div>
          <Link
            href={`/admin/products/${item.linkedProductId._id || item.linkedProductId}/edit`}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            Open Product Listing
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Two-Column Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Large Preview & Safeguard Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm">
            <div className="relative h-96 w-full bg-[#FAF8F5]">
              <Image
                src={item.sourceImageUrl}
                alt={ai.furnitureType || 'Sourced Piece'}
                fill
                className="object-cover"
                priority
              />

              {isRef ? (
                <div className="absolute top-3 left-3 bg-amber-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/50 flex items-center gap-1.5 shadow-md">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                  Reference Only — Unbranded
                </div>
              ) : (
                <div className="absolute top-3 left-3 bg-emerald-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/50 flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Branded Studio Asset
                </div>
              )}
            </div>

            <div className="p-5 space-y-3">
              {isRef ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    Reference Image Safeguard
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    This photo is stored as internal reference material. Storefront publication is protected until the photo is retouched and branded in Image Studio.
                  </p>
                  <Link
                    href={`/admin/image-studio?sourceId=${item._id}&imageUrl=${encodeURIComponent(item.sourceImageUrl)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#A8875E] hover:underline pt-1"
                  >
                    Launch Image Studio Canvas →
                  </Link>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>This image has been retouched and branded with the Nordika Studio mark.</span>
                </div>
              )}

              {item.sourceUrl && (
                <div className="pt-2 text-xs text-[#7C7265] flex items-center justify-between">
                  <span>Source URL:</span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#A8875E] hover:underline font-mono truncate max-w-[200px]"
                  >
                    {item.sourceUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Suggestions & Cost Calculator */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Banner */}
          <div className="rounded-2xl border border-amber-300 bg-[#FFFDF5] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    AI-Suggested Estimate — Verify Before Publishing
                  </h3>
                  <p className="text-[11px] text-amber-800">Generated via Claude Vision model analysis</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded">
                {ai.complexityRating || 'Medium'} Complexity
              </span>
            </div>

            {/* AI Classification Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">Identified Type</span>
                <span className="font-bold text-[#1A1613] mt-0.5 block">{ai.furnitureType || 'Custom Furniture'}</span>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">Estimated Proportions</span>
                <span className="font-bold text-[#1A1613] mt-0.5 block font-mono">
                  {ai.estimatedDimensions || 'Standard Proportions'}
                </span>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">Likely Materials</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {ai.materials?.map((mat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-amber-100/60 text-amber-950 font-semibold text-[11px] border border-amber-200"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">AI Valuation & Reasoning</span>
                <p className="text-xs text-[#4A4036] mt-1 italic leading-relaxed">
                  &ldquo;{ai.confidenceNote || 'Analyzed Scandinavian furniture piece based on materials and joints.'}&rdquo;
                </p>
                <div className="mt-2 text-sm font-bold text-[#1A1613]">
                  Suggested Market Retail: ${ai.suggestedPriceMin?.toLocaleString() || 0} – ${ai.suggestedPriceMax?.toLocaleString() || 0} USD
                </div>
              </div>
            </div>
          </div>

          {/* Manufacturing Cost Calculator */}
          <CostCalculator
            initialValues={item.manualOverride || {}}
            aiSuggestedMin={ai.suggestedPriceMin || 0}
            aiSuggestedMax={ai.suggestedPriceMax || 0}
            onChange={(vals) => setCalculatorState(vals)}
          />

          {/* Action Buttons Bar */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <button
              type="button"
              onClick={handleSavePricing}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-[#D5CCC2] hover:bg-[#FAF8F5] text-xs font-bold text-[#4A4036] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#A8875E]" />
              {isSaving ? 'Saving...' : 'Save Pricing Formulas'}
            </button>

            <div className="flex items-center gap-3">
              {!item.linkedProductId && (
                <button
                  type="button"
                  onClick={handleConvertToDraft}
                  disabled={isConverting}
                  className="px-6 py-2.5 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Package className="w-4 h-4" />
                  {isConverting ? 'Creating Draft Product...' : 'Save as Draft Product'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
