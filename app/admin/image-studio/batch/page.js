'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Layers,
  ArrowLeft,
  UploadCloud,
  Wand2,
  Check,
  CheckCircle2,
  Sparkles,
  Sliders,
  Crop,
  Palette,
  ExternalLink,
} from 'lucide-react';

const BATCH_SAMPLE_CATALOG = [
  {
    id: 'batch-1',
    name: 'KB Furniture Haven Bouclé Sofa',
    url: 'https://picsum.photos/seed/kb-haven-modular-boucle-sofa/800/800',
    selected: true,
  },
  {
    id: 'batch-2',
    name: 'Stockholm Curved Lounge Armchair',
    url: 'https://picsum.photos/seed/stockholm-curved-lounge-armchair/800/800',
    selected: true,
  },
  {
    id: 'batch-3',
    name: 'Aura Travertine Coffee Table',
    url: 'https://picsum.photos/seed/aura-travertine-walnut-coffee-table/800/800',
    selected: true,
  },
  {
    id: 'batch-4',
    name: 'Malmö Fluted Solid Oak Sideboard',
    url: 'https://picsum.photos/seed/malmo-fluted-solid-oak-sideboard/800/800',
    selected: true,
  },
];

export default function ImageStudioBatchPage() {
  const [items, setItems] = useState(BATCH_SAMPLE_CATALOG);
  const [bgPreset, setBgPreset] = useState('white');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [watermarkPos, setWatermarkPos] = useState('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(40);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResults, setProcessedResults] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);

  const toggleSelect = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map((file, idx) => ({
      id: `uploaded-${Date.now()}-${idx}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file),
      selected: true,
    }));

    setItems((prev) => [...newItems, ...prev]);
  };

  const handleRunBatch = () => {
    const selectedItems = items.filter((i) => i.selected);
    if (selectedItems.length === 0) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setProcessedResults([]);

    let current = 0;
    const total = selectedItems.length;

    const interval = setInterval(() => {
      current += 1;
      const pct = Math.round((current / total) * 100);
      setProgressPercent(pct);

      if (current >= total) {
        clearInterval(interval);
        setTimeout(() => {
          setProcessedResults(
            selectedItems.map((item) => ({
              ...item,
              processedUrl: item.url, // In production composites on canvas
              presetApplied: `${bgPreset} • ${aspectRatio} • Watermark ${watermarkPos}`,
              status: 'ready',
            }))
          );
          setIsProcessing(false);
        }, 400);
      }
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/image-studio"
            className="p-2 rounded-xl border border-[#EBE5DF] bg-white hover:bg-[#FAF8F5] text-[#7C7265]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-[#1A1613]">Batch Image Studio</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8875E] bg-[#A8875E]/15 px-2 py-0.5 rounded border border-[#A8875E]/30">
                Batch Presets
              </span>
            </div>
            <p className="text-xs text-[#7C7265] mt-0.5">
              Apply unified studio backdrops, aspect ratios, and watermark overlays across multiple catalog images at once.
            </p>
          </div>
        </div>

        <label className="px-4 py-2 rounded-xl bg-white border border-[#D5CCC2] hover:bg-[#FAF8F5] text-xs font-bold text-[#4A4036] flex items-center gap-2 shadow-xs cursor-pointer">
          <UploadCloud className="w-4 h-4 text-[#A8875E]" />
          Upload Multiple Files
          <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Preset Controls Card */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#A8875E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
              Configure Global Studio Preset
            </h3>
          </div>
          <span className="text-[11px] text-[#7C7265]">Applies across all selected photos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Background */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#4A4036] flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#A8875E]" />
              Studio Environment
            </label>
            <select
              value={bgPreset}
              onChange={(e) => setBgPreset(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCC2] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
            >
              <option value="white">Studio White (#FFFFFF)</option>
              <option value="warm_neutral">Nordic Warm Beige (#F3ECE1)</option>
              <option value="dark_ebony">Ebony Dark Studio (#1A1613)</option>
              <option value="soft_gradient">Studio Gradient</option>
              <option value="transparent">Transparent PNG</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#4A4036] flex items-center gap-1">
              <Crop className="w-3.5 h-3.5 text-[#A8875E]" />
              Aspect Ratio Preset
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCC2] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
            >
              <option value="1:1">Product Listing Square (1:1)</option>
              <option value="16:9">Homepage Banner (16:9)</option>
              <option value="4:5">Social Catalog Post (4:5)</option>
              <option value="9:16">Story / Reel (9:16)</option>
            </select>
          </div>

          {/* Watermark */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#4A4036] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#A8875E]" />
              Watermark Placement
            </label>
            <select
              value={watermarkPos}
              onChange={(e) => setWatermarkPos(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D5CCC2] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
            >
              <option value="bottom-right">Bottom-Right (Standard)</option>
              <option value="bottom-left">Bottom-Left</option>
              <option value="top-right">Top-Right</option>
              <option value="center">Center Overlay</option>
              <option value="none">No Watermark</option>
            </select>
          </div>
        </div>

        {/* Trigger Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EBE5DF]">
          <span className="text-xs text-[#7C7265]">
            {items.filter((i) => i.selected).length} image(s) queued for batch processing
          </span>
          <button
            type="button"
            onClick={handleRunBatch}
            disabled={isProcessing || items.filter((i) => i.selected).length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            {isProcessing ? `Processing Batch (${progressPercent}%)...` : 'Process All Selected Images'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="bg-white rounded-xl border border-[#EBE5DF] p-5 space-y-2 shadow-sm">
          <div className="flex justify-between text-xs font-bold text-[#1A1613]">
            <span>Applying studio presets across batch queue...</span>
            <span className="text-[#A8875E]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#FAF8F5] h-2.5 rounded-full overflow-hidden border border-[#EBE5DF]">
            <div
              className="bg-[#A8875E] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Results or Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
            {processedResults.length > 0 ? 'Processed Batch Results' : 'Select Images to Retouch'}
          </h3>
          {processedResults.length > 0 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              ✓ Batch Complete ({processedResults.length} assets ready)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(processedResults.length > 0 ? processedResults : items).map((item) => (
            <div
              key={item.id}
              onClick={() => !processedResults.length && toggleSelect(item.id)}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs transition-all cursor-pointer group ${
                item.selected
                  ? 'border-[#A8875E] ring-1 ring-[#A8875E]'
                  : 'border-[#EBE5DF] opacity-60 hover:opacity-100'
              }`}
            >
              <div className="relative h-44 w-full bg-[#FAF8F5]">
                <Image src={item.url} alt={item.name} fill className="object-cover" />
                {item.selected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#A8875E] text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                {processedResults.length > 0 && (
                  <div className="absolute top-2.5 left-2.5 bg-emerald-900/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Branded
                  </div>
                )}
              </div>

              <div className="p-3.5 space-y-2">
                <p className="text-xs font-bold text-[#1A1613] truncate">{item.name}</p>
                {item.presetApplied && (
                  <p className="text-[10px] text-[#7C7265] truncate font-mono">{item.presetApplied}</p>
                )}
                <div className="pt-2 border-t border-[#EBE5DF] flex items-center justify-between">
                  <Link
                    href={`/admin/image-studio?imageUrl=${encodeURIComponent(item.url)}`}
                    className="text-[11px] font-bold text-[#A8875E] hover:underline flex items-center gap-1"
                  >
                    Fine-tune
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <span className="text-[10px] font-semibold text-emerald-700">✓ Ready</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
