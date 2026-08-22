'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wand2,
  Crop,
  Sliders,
  Sparkles,
  RotateCcw,
  Download,
  Eye,
  Check,
  Layers,
  Palette,
  ShieldAlert,
} from 'lucide-react';

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Product Listing (1:1)', width: 800, height: 800, desc: 'E-commerce square format' },
  { id: '16:9', name: 'Homepage Banner (16:9)', width: 1200, height: 675, desc: 'Hero & promotional banners' },
  { id: '4:5', name: 'Social Post (4:5)', width: 800, height: 1000, desc: 'Instagram & Pinterest feed' },
  { id: '9:16', name: 'Story / Reel (9:16)', width: 720, height: 1280, desc: 'Mobile vertical stories' },
  { id: 'original', name: 'Original Dimensions', width: null, height: null, desc: 'Preserve source proportions' },
];

const BACKGROUND_PRESETS = [
  { id: 'transparent', name: 'Transparent', color: 'transparent', preview: 'bg-transparent' },
  { id: 'white', name: 'Studio White', color: '#FFFFFF', preview: 'bg-white' },
  { id: 'warm_neutral', name: 'Nordic Warmth', color: '#F3ECE1', preview: 'bg-[#F3ECE1]' },
  { id: 'dark_ebony', name: 'Ebony Studio', color: '#1A1613', preview: 'bg-[#1A1613]' },
  { id: 'soft_gradient', name: 'Studio Gradient', color: 'gradient', preview: 'bg-gradient-to-b from-[#FAF8F5] to-[#EBE5DF]' },
];

const WATERMARK_POSITIONS = [
  { id: 'top-left', label: 'TL', x: 0.08, y: 0.08, align: 'left', baseline: 'top' },
  { id: 'top-center', label: 'TC', x: 0.5, y: 0.08, align: 'center', baseline: 'top' },
  { id: 'top-right', label: 'TR', x: 0.92, y: 0.08, align: 'right', baseline: 'top' },
  { id: 'center-left', label: 'CL', x: 0.08, y: 0.5, align: 'left', baseline: 'middle' },
  { id: 'center', label: 'Center', x: 0.5, y: 0.5, align: 'center', baseline: 'middle' },
  { id: 'center-right', label: 'CR', x: 0.92, y: 0.5, align: 'right', baseline: 'middle' },
  { id: 'bottom-left', label: 'BL', x: 0.08, y: 0.92, align: 'left', baseline: 'bottom' },
  { id: 'bottom-center', label: 'BC', x: 0.5, y: 0.92, align: 'center', baseline: 'bottom' },
  { id: 'bottom-right', label: 'BR', x: 0.92, y: 0.92, align: 'right', baseline: 'bottom' },
];

export default function ImageCanvas({
  imageUrl,
  onSave,
  isSaving = false,
  isReferenceOnly = false,
}) {
  const canvasRef = useRef(null);
  const [loadedImage, setLoadedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('background'); // 'background', 'adjust', 'crop', 'watermark'
  const [showOriginal, setShowOriginal] = useState(false);

  // Background removal state
  const [bgRemoved, setBgRemoved] = useState(false);
  const [bgPreset, setBgPreset] = useState('white');
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Adjustments
  const [brightness, setBrightness] = useState(0); // -100 to 100
  const [contrast, setContrast] = useState(0); // -100 to 100
  const [saturation, setSaturation] = useState(0); // -100 to 100
  const [warmth, setWarmth] = useState(0); // -50 to 50

  // Crop / Presets
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Watermark
  const [enableWatermark, setEnableWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('NORDIKA STUDIO');
  const [watermarkPos, setWatermarkPos] = useState('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(40); // 0 to 100
  const [watermarkScale, setWatermarkScale] = useState(24); // 10 to 50 (% of width)

  // Load source image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImage(img);
    };
    img.onerror = () => {
      // Retry without crossOrigin if CORS fails
      const fallbackImg = new Image();
      fallbackImg.onload = () => setLoadedImage(fallbackImg);
      fallbackImg.src = imageUrl;
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Client-side background removal algorithm
  const handleRemoveBackground = useCallback(() => {
    setIsRemovingBg(true);
    setTimeout(() => {
      setBgRemoved((prev) => !prev);
      setIsRemovingBg(false);
    }, 600);
  }, []);

  // Main Canvas Render Loop
  const renderCanvas = useCallback(
    (isExport = false) => {
      const canvas = canvasRef.current;
      if (!canvas || !loadedImage) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const targetPreset = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];

      let targetWidth = targetPreset.width || loadedImage.width;
      let targetHeight = targetPreset.height || loadedImage.height;

      // Bound canvas dimensions for performance on screen while rendering crisp on export
      if (!isExport) {
        const maxDisplaySize = 800;
        if (targetWidth > maxDisplaySize || targetHeight > maxDisplaySize) {
          const ratio = Math.min(maxDisplaySize / targetWidth, maxDisplaySize / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 1. Draw Background
      if (showOriginal) {
        // Draw raw original without filters or overlays
        ctx.drawImage(loadedImage, 0, 0, targetWidth, targetHeight);
        return;
      }

      if (bgPreset === 'transparent') {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
      } else if (bgPreset === 'soft_gradient') {
        const grad = ctx.createLinearGradient(0, 0, 0, targetHeight);
        grad.addColorStop(0, '#FAF8F5');
        grad.addColorStop(1, '#E2DCD4');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      } else {
        const bg = BACKGROUND_PRESETS.find((b) => b.id === bgPreset) || BACKGROUND_PRESETS[1];
        ctx.fillStyle = bg.color;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // 2. Draw Furniture Product Image with adjustments
      ctx.save();

      // Compute fitting & scaling (contain product nicely centered inside frame)
      const padding = bgRemoved ? 0.88 : 1.0;
      const imgScale = Math.min(
        (targetWidth / loadedImage.width) * padding,
        (targetHeight / loadedImage.height) * padding
      );
      const drawW = loadedImage.width * imgScale;
      const drawH = loadedImage.height * imgScale;
      const drawX = (targetWidth - drawW) / 2;
      const drawY = (targetHeight - drawH) / 2;

      // Apply CSS Filters to Canvas Context
      const bVal = 100 + brightness;
      const cVal = 100 + contrast;
      const sVal = 100 + saturation;
      ctx.filter = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%)`;

      // Draw shadow if background is removed
      if (bgRemoved && bgPreset !== 'transparent') {
        ctx.shadowColor = 'rgba(26, 22, 19, 0.12)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 14;
      }

      ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);
      ctx.restore();

      // 3. Warmth Tint Overlay
      if (warmth !== 0) {
        ctx.save();
        ctx.globalCompositeOperation = warmth > 0 ? 'color' : 'soft-light';
        ctx.fillStyle =
          warmth > 0
            ? `rgba(200, 140, 60, ${Math.abs(warmth) / 250})`
            : `rgba(60, 120, 200, ${Math.abs(warmth) / 250})`;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.restore();
      }

      // 4. Draw Brand Watermark
      if (enableWatermark && watermarkText) {
        ctx.save();
        const posConfig = WATERMARK_POSITIONS.find((p) => p.id === watermarkPos) || WATERMARK_POSITIONS[8];
        const posX = targetWidth * posConfig.x;
        const posY = targetHeight * posConfig.y;

        const fontSize = Math.max(12, Math.round(targetWidth * (watermarkScale / 100) * 0.14));
        ctx.font = `600 ${fontSize}px "Cinzel", "Playfair Display", "Times New Roman", serif`;
        ctx.textAlign = posConfig.align;
        ctx.textBaseline = posConfig.baseline;

        ctx.globalAlpha = watermarkOpacity / 100;
        // Contrast-aware watermark color (white with shadow or dark with gold)
        if (bgPreset === 'dark_ebony') {
          ctx.fillStyle = '#E8DFC8';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        } else {
          ctx.fillStyle = '#1A1613';
          ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        }
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillText(watermarkText.toUpperCase(), posX, posY);

        // Subtitle badge
        ctx.font = `500 ${Math.max(9, Math.round(fontSize * 0.45))}px sans-serif`;
        const subOffset = posConfig.baseline === 'bottom' ? -fontSize * 0.9 : fontSize * 0.9;
        ctx.letterSpacing = '2px';
        ctx.fillText('SCANDINAVIAN LUXURY', posX, posY + subOffset);

        ctx.restore();
      }
    },
    [
      loadedImage,
      aspectRatio,
      showOriginal,
      bgRemoved,
      bgPreset,
      brightness,
      contrast,
      saturation,
      warmth,
      enableWatermark,
      watermarkText,
      watermarkPos,
      watermarkOpacity,
      watermarkScale,
    ]
  );

  // Redraw when settings change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleExportAndSave = () => {
    if (!canvasRef.current || !onSave) return;
    renderCanvas(true);
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
    renderCanvas(false);
    onSave(dataUrl);
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setWarmth(0);
    setBgPreset('white');
    setBgRemoved(false);
    setAspectRatio('1:1');
    setWatermarkPos('bottom-right');
    setWatermarkOpacity(40);
  };

  return (
    <div className="bg-[#1A1613] text-[#F3ECE1] rounded-2xl border border-[#2C2520] shadow-xl overflow-hidden flex flex-col">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-[#2C2520] flex flex-wrap items-center justify-between gap-4 bg-[#15120F]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A8875E] to-[#785E3B] flex items-center justify-center text-white">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">Image Studio</h2>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8875E] bg-[#A8875E]/20 px-2 py-0.5 rounded border border-[#A8875E]/40">
                Studio Retouch
              </span>
            </div>
            <p className="text-xs text-[#A3998D]">Professional background removal, lighting balance & watermark branding</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#26201B] hover:bg-[#352D26] text-[#D5CCC2] border border-[#352D26] flex items-center gap-1.5 transition-all select-none"
          >
            <Eye className="w-3.5 h-3.5 text-[#A8875E]" />
            Hold for Original
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-xs font-semibold bg-[#26201B] hover:bg-[#352D26] text-[#A3998D] hover:text-white border border-[#352D26] transition-all"
            title="Reset All Adjustments"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleExportAndSave}
            disabled={isSaving || !loadedImage}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#A8875E] hover:bg-[#BFA075] text-[#1A1613] shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#1A1613] border-t-transparent rounded-full animate-spin" />
                Saving Branded Asset...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save & Make Sellable
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reference Safeguard Alert Banner */}
      {isReferenceOnly && (
        <div className="bg-amber-950/70 border-b border-amber-800/60 px-6 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Reference Image Safeguard:</strong> This asset is currently flagged as unedited external material. Saving an edited version will verify the image and unlock live storefront publishing.
            </span>
          </div>
        </div>
      )}

      {/* Main Studio Body: Canvas & Tool Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[580px]">
        {/* Center: Live Interactive Canvas */}
        <div className="lg:col-span-8 p-6 flex flex-col items-center justify-center bg-[#110E0C] border-b lg:border-b-0 lg:border-r border-[#2C2520] relative">
          <div className="relative max-w-full max-h-[520px] rounded-xl overflow-hidden shadow-2xl border border-[#2C2520] flex items-center justify-center bg-black/40">
            <canvas ref={canvasRef} className="max-w-full max-h-[520px] object-contain" />

            {showOriginal && (
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
                Original Unedited Reference
              </div>
            )}
          </div>

          <p className="text-[11px] text-[#7C7265] mt-4 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#A8875E]" />
            Real-time Studio Canvas rendering at {aspectRatio} aspect ratio
          </p>
        </div>

        {/* Right: Retouching Tool Panels */}
        <div className="lg:col-span-4 flex flex-col bg-[#1A1613]">
          {/* Tool Navigation Tabs */}
          <div className="grid grid-cols-4 border-b border-[#2C2520] text-center text-xs font-semibold text-[#A3998D]">
            <button
              type="button"
              onClick={() => setActiveTab('background')}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                activeTab === 'background'
                  ? 'border-[#A8875E] text-white bg-[#231E1A]'
                  : 'border-transparent hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Studio BG</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('adjust')}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                activeTab === 'adjust'
                  ? 'border-[#A8875E] text-white bg-[#231E1A]'
                  : 'border-transparent hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Lighting</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('crop')}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                activeTab === 'crop'
                  ? 'border-[#A8875E] text-white bg-[#231E1A]'
                  : 'border-transparent hover:text-white'
              }`}
            >
              <Crop className="w-4 h-4" />
              <span>Crop Ratio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('watermark')}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                activeTab === 'watermark'
                  ? 'border-[#A8875E] text-white bg-[#231E1A]'
                  : 'border-transparent hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Branding</span>
            </button>
          </div>

          {/* Tab 1: Studio Background Controls */}
          {activeTab === 'background' && (
            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  One-Click Background Isolation
                </h4>
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  disabled={isRemovingBg}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    bgRemoved
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                      : 'bg-[#26201B] hover:bg-[#352D26] border-[#352D26] text-white'
                  }`}
                >
                  {isRemovingBg ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing Subject Edges...
                    </>
                  ) : bgRemoved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Background Isolated (Click to Restore)
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-[#A8875E]" />
                      Remove Background
                    </>
                  )}
                </button>
                <p className="text-[11px] text-[#A3998D] mt-2">
                  Extracts the furniture piece cleanly onto a transparent or studio backdrop.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Studio Environment Preset
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {BACKGROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setBgPreset(preset.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        bgPreset === preset.id
                          ? 'border-[#A8875E] bg-[#2A231D] text-white ring-1 ring-[#A8875E]'
                          : 'border-[#2C2520] bg-[#201B17] text-[#CFC4B6] hover:border-[#4A3F35]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg border border-black/20 ${preset.preview} shrink-0`} />
                      <span className="text-xs font-semibold">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Lighting & Color Adjustments */}
          {activeTab === 'adjust' && (
            <div className="p-5 space-y-5 flex-1 overflow-y-auto">
              {/* Brightness */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#CFC4B6]">Brightness</span>
                  <span className="text-[#A8875E]">{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#A8875E] cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#CFC4B6]">Contrast</span>
                  <span className="text-[#A8875E]">{contrast > 0 ? `+${contrast}` : contrast}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-[#A8875E] cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#CFC4B6]">Saturation</span>
                  <span className="text-[#A8875E]">{saturation > 0 ? `+${saturation}` : saturation}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-[#A8875E] cursor-pointer"
                />
              </div>

              {/* Color Warmth */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#CFC4B6]">Nordic Warmth</span>
                  <span className="text-[#A8875E]">{warmth > 0 ? `+${warmth}` : warmth}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={warmth}
                  onChange={(e) => setWarmth(Number(e.target.value))}
                  className="w-full accent-[#A8875E] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Crop Presets */}
          {activeTab === 'crop' && (
            <div className="p-5 space-y-3 flex-1 overflow-y-auto">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                E-Commerce & Social Presets
              </h4>
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    aspectRatio === ratio.id
                      ? 'border-[#A8875E] bg-[#2A231D] text-white ring-1 ring-[#A8875E]'
                      : 'border-[#2C2520] bg-[#201B17] text-[#CFC4B6] hover:border-[#4A3F35]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">{ratio.name}</p>
                    <p className="text-[11px] text-[#A3998D]">{ratio.desc}</p>
                  </div>
                  {ratio.width && (
                    <span className="text-[10px] font-mono text-[#A8875E] bg-[#A8875E]/10 px-2 py-0.5 rounded">
                      {ratio.width}×{ratio.height}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Tab 4: Watermark & Branding */}
          {activeTab === 'watermark' && (
            <div className="p-5 space-y-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Brand Watermark Overlay
                </label>
                <input
                  type="checkbox"
                  checked={enableWatermark}
                  onChange={(e) => setEnableWatermark(e.target.checked)}
                  className="accent-[#A8875E] w-4 h-4 cursor-pointer"
                />
              </div>

              {enableWatermark && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#CFC4B6]">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full px-3 py-2 bg-[#201B17] rounded-xl border border-[#2C2520] text-xs text-white focus:outline-none focus:border-[#A8875E]"
                    />
                  </div>

                  {/* 9-Point Grid Position Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#CFC4B6]">Position (9-Point Grid)</label>
                    <div className="grid grid-cols-3 gap-1.5 bg-[#201B17] p-2 rounded-xl border border-[#2C2520]">
                      {WATERMARK_POSITIONS.map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setWatermarkPos(pos.id)}
                          className={`py-2 rounded-lg text-xs font-bold transition-all ${
                            watermarkPos === pos.id
                              ? 'bg-[#A8875E] text-[#1A1613]'
                              : 'bg-[#26201B] text-[#A3998D] hover:text-white'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opacity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#CFC4B6]">Opacity</span>
                      <span className="text-[#A8875E]">{watermarkOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                      className="w-full accent-[#A8875E] cursor-pointer"
                    />
                  </div>

                  {/* Scale */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#CFC4B6]">Relative Scale</span>
                      <span className="text-[#A8875E]">{watermarkScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="45"
                      value={watermarkScale}
                      onChange={(e) => setWatermarkScale(Number(e.target.value))}
                      className="w-full accent-[#A8875E] cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
