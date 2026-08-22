'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Wand2,
  UploadCloud,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Package,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import ImageCanvas from '@/components/admin/image-studio/ImageCanvas';

const DEFAULT_SAMPLE_IMAGES = [
  {
    name: 'Nordika Bouclé Sectional',
    url: 'https://picsum.photos/seed/nordika-haven-modular-boucle-sofa/800/800',
    type: 'Seating',
  },
  {
    name: 'Curved Lounge Armchair',
    url: 'https://picsum.photos/seed/stockholm-curved-lounge-armchair/800/800',
    type: 'Seating',
  },
  {
    name: 'Travertine Coffee Table',
    url: 'https://picsum.photos/seed/aura-travertine-walnut-coffee-table/800/800',
    type: 'Tables',
  },
  {
    name: 'Fluted Oak Sideboard',
    url: 'https://picsum.photos/seed/malmo-fluted-solid-oak-sideboard/800/800',
    type: 'Storage',
  },
];

function ImageStudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sourceId = searchParams.get('sourceId');
  const productId = searchParams.get('productId');
  const initialUrl = searchParams.get('imageUrl');

  const [activeImageUrl, setActiveImageUrl] = useState(initialUrl || DEFAULT_SAMPLE_IMAGES[0].url);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [customFilePreview, setCustomFilePreview] = useState('');

  useEffect(() => {
    if (initialUrl) {
      setActiveImageUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomFilePreview(reader.result);
      setActiveImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCanvas = async (imageDataUrl) => {
    try {
      setIsSaving(true);
      setErrorMsg('');
      setSaveSuccess(null);

      const res = await fetch('/api/admin/image-studio/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl,
          productId: productId || undefined,
          sourceItemId: sourceId || undefined,
          replacePrimary: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save studio asset');
      }

      setSaveSuccess({
        message: 'Studio asset retouched, branded, and reference safeguards cleared!',
        imageUrl: data.data?.imageUrl,
        productId: productId || data.data?.product?._id,
        sourceId: sourceId || data.data?.sourcedItem?._id,
      });
    } catch (err) {
      console.error('Image save error:', err);
      setErrorMsg(err.message || 'Failed to save studio asset');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {sourceId ? (
            <Link
              href={`/admin/source-studio/${sourceId}`}
              className="p-2 rounded-xl border border-[#EBE5DF] bg-white hover:bg-[#FAF8F5] text-[#7C7265]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          ) : productId ? (
            <Link
              href={`/admin/products/${productId}/edit`}
              className="p-2 rounded-xl border border-[#EBE5DF] bg-white hover:bg-[#FAF8F5] text-[#7C7265]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/admin"
              className="p-2 rounded-xl border border-[#EBE5DF] bg-white hover:bg-[#FAF8F5] text-[#7C7265]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-[#1A1613]">Image Studio</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8875E] bg-[#A8875E]/15 px-2 py-0.5 rounded border border-[#A8875E]/30">
                Make It Sellable
              </span>
            </div>
            <p className="text-xs text-[#7C7265] mt-0.5">
              Transform raw inspiration photos into high-resolution studio assets with background removal & watermark branding.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/image-studio/batch"
            className="px-4 py-2 rounded-xl border border-[#D5CCC2] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#4A4036] flex items-center gap-2 shadow-xs transition-all"
          >
            <Layers className="w-4 h-4 text-[#A8875E]" />
            Batch Studio Mode
          </Link>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">{saveSuccess.message}</p>
              <p className="text-[11px] text-emerald-700">
                Reference safeguards removed. This product listing can now be safely published to the live storefront.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess.productId && (
              <Link
                href={`/admin/products/${saveSuccess.productId}/edit`}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                View Product Listing
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            {saveSuccess.sourceId && (
              <Link
                href={`/admin/source-studio/${saveSuccess.sourceId}`}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all shadow-xs"
              >
                Back to Sourced Item
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Image Quick Switcher Bar (if not tied to a single item) */}
      {!sourceId && !productId && (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1613]">Sample Catalog Images:</span>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {DEFAULT_SAMPLE_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageUrl(sample.url)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    activeImageUrl === sample.url
                      ? 'border-[#A8875E] bg-[#FAF8F5] text-[#1A1613] font-bold ring-1 ring-[#A8875E]'
                      : 'border-[#EBE5DF] bg-white text-[#7C7265] hover:border-[#D5CCC2]'
                  }`}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="px-3.5 py-1.5 rounded-xl border border-[#D5CCC2] hover:bg-[#FAF8F5] text-xs font-bold text-[#4A4036] cursor-pointer flex items-center gap-1.5 transition-all">
              <UploadCloud className="w-3.5 h-3.5 text-[#A8875E]" />
              Upload Custom Image
              <input type="file" accept="image/*" onChange={handleCustomUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* Main Studio Canvas Component */}
      <ImageCanvas
        imageUrl={activeImageUrl}
        onSave={handleSaveCanvas}
        isSaving={isSaving}
        isReferenceOnly={Boolean(sourceId || productId)}
      />
    </div>
  );
}

export default function ImageStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading Image Studio...
        </div>
      }
    >
      <ImageStudioContent />
    </Suspense>
  );
}
