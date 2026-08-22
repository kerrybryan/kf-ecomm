'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  UploadCloud,
  Link2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileImage,
} from 'lucide-react';

const SAMPLE_INSPIRATION_PRESETS = [
  {
    title: 'Minimalist Bouclé Curved Armchair',
    url: 'https://picsum.photos/seed/nordika-armchair-insp/800/800',
    source: 'Scandinavian Design Gallery',
  },
  {
    title: 'Solid European Oak Butterfly Dining Table',
    url: 'https://picsum.photos/seed/nordika-table-insp/800/800',
    source: 'Architectural Digest Showcase',
  },
  {
    title: 'Floating Walnut Platform Bed Frame',
    url: 'https://picsum.photos/seed/nordika-bed-insp/800/800',
    source: 'Nordic Sanctuary Portfolio',
  },
];

export default function SourceStudioNewPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [pastedUrl, setPastedUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewDataUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const imageInput = activeTab === 'upload' ? previewDataUrl : pastedUrl;

    if (!imageInput) {
      setErrorMsg(activeTab === 'upload' ? 'Please select an image file to upload' : 'Please enter an image link');
      return;
    }

    try {
      setIsSubmitting(true);
      setAnalysisStep(1); // Uploading & ingesting image

      setTimeout(() => setAnalysisStep(2), 700); // Running Claude Vision extraction
      setTimeout(() => setAnalysisStep(3), 1400); // Computing manufacturing cost formulas

      const res = await fetch('/api/admin/source-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageInput,
          sourceUrl: activeTab === 'url' ? pastedUrl : '',
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to import and analyze image');
      }

      setAnalysisStep(4); // Finished
      setTimeout(() => {
        router.push(`/admin/source-studio/${data.data._id}`);
      }, 500);
    } catch (err) {
      console.error('Import error:', err);
      setErrorMsg(err.message || 'Something went wrong during image analysis');
      setIsSubmitting(false);
      setAnalysisStep(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/source-studio"
          className="p-2 rounded-xl border border-[#EBE5DF] bg-white hover:bg-[#FAF8F5] text-[#7C7265] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-serif font-bold text-[#1A1613]">Import Inspiration Image</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8875E] bg-[#A8875E]/15 px-2 py-0.5 rounded border border-[#A8875E]/30">
              Step 1 of 2
            </span>
          </div>
          <p className="text-xs text-[#7C7265] mt-0.5">
            Upload an inspiration photo or paste a URL to run Claude Vision classification and workshop costing.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analysis Progress Overlay */}
      {isSubmitting ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center shadow-lg space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-[#A8875E]/20 border-t-[#A8875E] animate-spin" />
            <Sparkles className="w-6 h-6 text-[#A8875E] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#1A1613]">Analyzing Furniture Inspiration</h3>
            <p className="text-xs text-[#7C7265] mt-1">Our AI is extracting materials, joinery details, and calculating workshop costs</p>
          </div>

          <div className="max-w-sm mx-auto space-y-2.5 text-left text-xs font-semibold text-[#4A4036]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 1 ? 'text-emerald-600' : 'text-gray-300'}`} />
              <span className={analysisStep >= 1 ? 'text-[#1A1613]' : 'text-gray-400'}>
                Uploading & verifying image asset
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 2 ? 'text-emerald-600' : 'text-gray-300'}`} />
              <span className={analysisStep >= 2 ? 'text-[#1A1613]' : 'text-gray-400'}>
                Extracting furniture category & timber/fabric materials
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 3 ? 'text-emerald-600' : 'text-gray-300'}`} />
              <span className={analysisStep >= 3 ? 'text-[#1A1613]' : 'text-gray-400'}>
                Computing manufacturing breakdown & market price range
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#EBE5DF] bg-[#FAF8F5]">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-[#1A1613] border-b-2 border-[#A8875E] shadow-sm'
                  : 'text-[#7C7265] hover:text-[#1A1613]'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-[#A8875E]" />
              Upload Image File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-[#1A1613] border-b-2 border-[#A8875E] shadow-sm'
                  : 'text-[#7C7265] hover:text-[#1A1613]'
              }`}
            >
              <Link2 className="w-4 h-4 text-[#A8875E]" />
              Paste Web / Pinterest URL
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* TAB 1: File Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    previewDataUrl
                      ? 'border-[#A8875E] bg-[#FAF8F5]'
                      : 'border-[#D5CCC2] hover:border-[#A8875E] bg-[#FCFAF7]'
                  }`}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {previewDataUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden shadow-md border border-[#EBE5DF]">
                        <Image src={previewDataUrl} alt="Preview" fill className="object-cover" />
                      </div>
                      <p className="text-xs font-semibold text-[#1A1613]">{selectedFile?.name || 'Image Ready'}</p>
                      <p className="text-[11px] text-[#A8875E] font-medium">Click to choose a different photo</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white border border-[#EBE5DF] text-[#A8875E] flex items-center justify-center mx-auto shadow-sm">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A1613]">Drag & drop your furniture photo here</p>
                        <p className="text-[11px] text-[#7C7265] mt-0.5">Supports high-res JPG, PNG, WEBP files up to 10MB</p>
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-white border border-[#D5CCC2] text-xs font-bold text-[#4A4036] hover:bg-[#FAF8F5] shadow-xs"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: URL Input */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4A4036]">Paste Inspiration Image URL</label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-[#A3998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or https://pinterest.com/..."
                      value={pastedUrl}
                      onChange={(e) => setPastedUrl(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#D5CCC2] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
                    />
                  </div>
                </div>

                {pastedUrl && (
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EBE5DF] flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white border border-[#EBE5DF] shrink-0">
                      <Image
                        src={pastedUrl}
                        alt="URL Preview"
                        fill
                        className="object-cover"
                        onError={() => setErrorMsg('Failed to load image from this URL. Please check the link.')}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#1A1613] truncate">{pastedUrl}</p>
                      <p className="text-[11px] text-emerald-700 font-medium">✓ Image preview accessible</p>
                    </div>
                  </div>
                )}

                {/* Quick Presets for Demo */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-[#7C7265] uppercase tracking-wider mb-2">
                    Or choose a sample inspiration photo:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SAMPLE_INSPIRATION_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPastedUrl(preset.url)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          pastedUrl === preset.url
                            ? 'border-[#A8875E] bg-[#FAF8F5] ring-1 ring-[#A8875E]'
                            : 'border-[#EBE5DF] bg-white hover:border-[#D5CCC2]'
                        }`}
                      >
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                          <Image src={preset.url} alt={preset.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#1A1613] truncate">{preset.title}</p>
                          <p className="text-[9px] text-[#7C7265] truncate">{preset.source}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sourcing Notes */}
            <div className="space-y-1.5 pt-2 border-t border-[#EBE5DF]">
              <label className="text-xs font-bold text-[#4A4036]">Internal Sourcing Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Sourced from Milan Design Week 2026 gallery. Look into solid oak vs walnut framing."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CCC2] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBE5DF]">
              <Link
                href="/admin/source-studio"
                className="px-4 py-2.5 rounded-xl border border-[#D5CCC2] text-xs font-bold text-[#4A4036] hover:bg-[#FAF8F5]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Analyze with Claude Vision
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
