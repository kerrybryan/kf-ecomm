'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calculator,
  Save,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Hammer,
  DollarSign,
  Package,
  Wand2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function CalculatorContent() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') || '';
  const initialProductId = searchParams.get('productId') || '';
  const initialSourceItemId = searchParams.get('sourceItemId') || '';

  const [templates, setTemplates] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [sourcedItems, setSourcedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [itemRows, setItemRows] = useState([]);
  const [laborHours, setLaborHours] = useState(12);
  const [laborRatePerHour, setLaborRatePerHour] = useState(250);
  const [overheadPercent, setOverheadPercent] = useState(15);
  const [markupMultiplier, setMarkupMultiplier] = useState(2.0);
  const [customPriceOverride, setCustomPriceOverride] = useState('');

  // Target to link price to
  const [saveTargetType, setSaveTargetType] = useState(initialSourceItemId ? 'SourcedItem' : 'Product');
  const [selectedTargetId, setSelectedTargetId] = useState(initialProductId || initialSourceItemId || '');
  const [savingPrice, setSavingPrice] = useState(false);
  const [savedResult, setSavedResult] = useState(null);

  // Material map for fast lookup
  const materialRateMap = useMemo(() => {
    const map = new Map();
    materials.forEach((m) => {
      map.set(m.materialName.toLowerCase().trim(), m);
    });
    return map;
  }, [materials]);

  // Fetch initial data
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [tRes, mRes, pRes, sRes] = await Promise.all([
          fetch('/api/admin/pricing/categories'),
          fetch('/api/admin/pricing/materials'),
          fetch('/api/products?limit=100'),
          fetch('/api/admin/source-studio'),
        ]);

        const [tJson, mJson, pJson, sJson] = await Promise.all([
          tRes.json(),
          mRes.json(),
          pRes.json(),
          sRes.json(),
        ]);

        if (tJson.success) setTemplates(tJson.data || []);
        if (mJson.success) setMaterials(mJson.data || []);
        if (pJson.success) setProducts(pJson.data || []);
        if (sJson.success) setSourcedItems(sJson.data || []);

        // Pick initial category
        const initialCat = initialCategoryParam || (tJson.data && tJson.data[0]?.category) || '';
        if (initialCat) {
          loadCategoryTemplate(initialCat, tJson.data, mJson.data);
        }
      } catch (err) {
        console.error('Failed to load calculator setup:', err);
        addToast('Failed to load pricing engine', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [initialCategoryParam]);

  const loadCategoryTemplate = (catName, availableTemplates = templates, availableMats = materials) => {
    setSelectedCategory(catName);
    const template = availableTemplates.find((t) => t.category.toLowerCase() === catName.toLowerCase()) || availableTemplates[0];

    if (template) {
      setLaborHours(template.laborHoursDefault || 10);
      setLaborRatePerHour(template.laborRatePerHour || 250);
      setOverheadPercent(template.overheadPercentDefault || 15);
      setMarkupMultiplier(template.markupMultiplierDefault || 2.0);
      setCustomPriceOverride('');

      const rows = (template.materialInputs || []).map((input) => {
        const dbMat = availableMats.find((m) => m.materialName.toLowerCase().trim() === input.materialName.toLowerCase().trim());
        return {
          materialName: input.materialName,
          quantity: input.defaultQuantity || 1,
          unit: input.unitLabel || dbMat?.unit || 'unit',
          costPerUnit: dbMat ? dbMat.costPerUnit : 0,
          helpText: input.helpText || '',
        };
      });
      setItemRows(rows);
    }
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    loadCategoryTemplate(cat);
  };

  // Add custom material row
  const handleAddRow = () => {
    const firstMat = materials[0] || { materialName: 'Solid Hardwood (Oak / Walnut / Wanza)', costPerUnit: 1800, unit: 'meter' };
    setItemRows([
      ...itemRows,
      {
        materialName: firstMat.materialName,
        quantity: 1,
        unit: firstMat.unit,
        costPerUnit: firstMat.costPerUnit,
        helpText: '',
      },
    ]);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...itemRows];
    if (field === 'materialName') {
      const selectedDb = materials.find((m) => m.materialName === value);
      updated[index] = {
        ...updated[index],
        materialName: value,
        costPerUnit: selectedDb ? selectedDb.costPerUnit : updated[index].costPerUnit,
        unit: selectedDb ? selectedDb.unit : updated[index].unit,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setItemRows(updated);
  };

  const handleRemoveRow = (index) => {
    setItemRows(itemRows.filter((_, i) => i !== index));
  };

  // Live Calculations
  const calculations = useMemo(() => {
    let materialCost = 0;
    const items = itemRows.map((row) => {
      const qty = Math.max(0, Number(row.quantity || 0));
      const unitCost = Math.max(0, Number(row.costPerUnit || 0));
      const total = Math.round(qty * unitCost);
      materialCost += total;
      return {
        ...row,
        total,
      };
    });

    const hours = Math.max(0, Number(laborHours || 0));
    const rate = Math.max(0, Number(laborRatePerHour || 0));
    const laborCost = Math.round(hours * rate);

    const subtotal = materialCost + laborCost;
    const overheadPct = Math.max(0, Number(overheadPercent || 0));
    const overhead = Math.round(subtotal * (overheadPct / 100));

    const totalCost = subtotal + overhead;
    const markup = Math.max(1.0, Number(markupMultiplier || 1.0));
    const suggestedPrice = Math.round(totalCost * markup);
    const finalPrice = customPriceOverride && Number(customPriceOverride) > 0
      ? Math.round(Number(customPriceOverride))
      : suggestedPrice;

    const profitMargin = finalPrice - totalCost;
    const marginPct = finalPrice > 0 ? Math.round((profitMargin / finalPrice) * 100) : 0;

    return {
      items,
      materialCost,
      laborCost,
      subtotal,
      overhead,
      totalCost,
      suggestedPrice,
      finalPrice,
      profitMargin,
      marginPct,
    };
  }, [itemRows, laborHours, laborRatePerHour, overheadPercent, markupMultiplier, customPriceOverride]);

  // Save to Product or Sourced Item
  const handleSaveToProduct = async () => {
    if (!selectedTargetId) {
      addToast('Please select a Product or Sourced Item to attach this price to', 'error');
      return;
    }

    setSavingPrice(true);
    try {
      const res = await fetch('/api/admin/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialInputs: itemRows,
          laborHours,
          laborRatePerHour,
          overheadPercent,
          markupMultiplier,
          customPriceOverride: customPriceOverride ? Number(customPriceOverride) : null,
          saveTarget: {
            type: saveTargetType,
            id: selectedTargetId,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSavedResult(json.data);
        addToast(
          `Price saved (${calculations.finalPrice.toLocaleString()} Birr). Content Studio export is now UNLOCKED!`,
          'success'
        );
      } else {
        addToast(json.error || 'Failed to save price', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSavingPrice(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B8551F]" />
            <span className="text-[11px] font-bold text-[#B8551F] uppercase tracking-wider">
              PRICING ENGINE · LIVE CALCULATOR
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#201C18] tracking-tight">
            Category Pricing Calculator
          </h1>
          <p className="text-xs text-[#6B6459] mt-1">
            Select a category, enter material quantities and workshop labor. Calculates exact cost, overhead, and margins transparently.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/pricing/materials"
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border-2 border-[#E5DDD3] rounded-xl text-xs font-bold text-[#201C18] transition-all shadow-xs"
          >
            Material Rates
          </Link>
          <Link
            href="/admin/pricing/categories"
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border-2 border-[#E5DDD3] rounded-xl text-xs font-bold text-[#201C18] transition-all shadow-xs"
          >
            Category Formulas
          </Link>
        </div>
      </div>

      {/* Main Grid: Form Left, Breakdown Summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Category Selector Card */}
          <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#201C18] mb-2">
              Select Furniture Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full bg-[#FAF8F5] border-2 border-[#E5DDD3] rounded-xl px-4 py-3 text-xs font-bold text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
              >
                {templates.map((tpl) => (
                  <option key={tpl._id} value={tpl.category}>
                    {tpl.category}
                  </option>
                ))}
              </select>

              <div className="flex items-center px-4 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] text-xs text-[#6B6459]">
                <span>Loaded template: <strong className="text-[#201C18]">{selectedCategory || 'Default'}</strong></span>
              </div>
            </div>
          </div>

          {/* Raw Materials Input List */}
          <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#201C18] tracking-tight">
                  1. Raw Material Quantities
                </h3>
                <p className="text-[11px] text-[#6B6459]">
                  Input quantities for this specific piece
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EAE1D2] border border-[#E5DDD3] rounded-lg text-xs font-bold text-[#B8551F] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Material</span>
              </button>
            </div>

            <div className="space-y-3">
              {itemRows.map((row, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DDD3] grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <label className="block text-[10px] font-bold text-[#6B6459] mb-1">
                      Material Name
                    </label>
                    <select
                      value={row.materialName}
                      onChange={(e) => handleRowChange(idx, 'materialName', e.target.value)}
                      className="w-full bg-white border border-[#E5DDD3] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#201C18] focus:outline-none cursor-pointer"
                    >
                      {materials.map((m) => (
                        <option key={m._id} value={m.materialName}>
                          {m.materialName}
                        </option>
                      ))}
                    </select>
                    {row.helpText && (
                      <span className="text-[10px] text-[#6B6459] block mt-0.5">{row.helpText}</span>
                    )}
                  </div>

                  <div className="col-span-5 sm:col-span-3">
                    <label className="block text-[10px] font-bold text-[#6B6459] mb-1">
                      Quantity ({row.unit || 'units'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                      className="w-full bg-white border border-[#E5DDD3] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#201C18]"
                    />
                  </div>

                  <div className="col-span-5 sm:col-span-3">
                    <label className="block text-[10px] font-bold text-[#6B6459] mb-1">
                      Unit Rate & Subtotal
                    </label>
                    <div className="text-xs font-extrabold text-[#201C18] pt-1">
                      {Math.round(row.quantity * row.costPerUnit).toLocaleString()} Birr
                      <span className="block text-[10px] text-[#6B6459] font-normal">
                        ({row.costPerUnit} B/{row.unit})
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1.5 text-[#6B6459] hover:text-rose-600 rounded-lg"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 text-xs font-bold text-[#201C18]">
              <span>Total Material Cost:</span>
              <span className="text-sm font-extrabold text-[#B8551F]">
                {calculations.materialCost.toLocaleString()} Birr
              </span>
            </div>
          </div>

          {/* Workshop Labor & Overhead */}
          <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs space-y-4">
            <div className="border-b border-[#E5DDD3] pb-3">
              <h3 className="text-sm font-extrabold text-[#201C18] tracking-tight">
                2. Workshop Labor & Overhead
              </h3>
              <p className="text-[11px] text-[#6B6459]">
                Estimated joinery/upholstery craft hours and facility overhead
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Labor Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#201C18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Labor Rate (Birr / hr)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={laborRatePerHour}
                  onChange={(e) => setLaborRatePerHour(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#201C18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Overhead (% of Subtotal)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overheadPercent}
                  onChange={(e) => setOverheadPercent(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#201C18]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-[#E5DDD3]">
              <div className="flex justify-between">
                <span className="text-[#6B6459]">Labor Cost:</span>
                <span className="font-bold text-[#201C18]">{calculations.laborCost.toLocaleString()} Birr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6459]">Overhead Cost ({overheadPercent}%):</span>
                <span className="font-bold text-[#201C18]">{calculations.overhead.toLocaleString()} Birr</span>
              </div>
            </div>
          </div>

          {/* Markup & Final Pricing */}
          <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs space-y-4">
            <div className="border-b border-[#E5DDD3] pb-3">
              <h3 className="text-sm font-extrabold text-[#201C18] tracking-tight">
                3. Markup & Selling Price
              </h3>
              <p className="text-[11px] text-[#6B6459]">
                Set multiplier or directly override the final retail price
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Markup Multiplier
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={markupMultiplier}
                    onChange={(e) => setMarkupMultiplier(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#D99A2B]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#6B6459]">x Cost</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Final Price Override (Birr)
                </label>
                <input
                  type="number"
                  placeholder={`Suggested: ${calculations.suggestedPrice.toLocaleString()}`}
                  value={customPriceOverride}
                  onChange={(e) => setCustomPriceOverride(e.target.value)}
                  className="w-full bg-[#FAF8F5] border-2 border-[#B8551F]/40 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#B8551F] placeholder:text-[#6B6459]/50"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Transparent Breakdown Card & Save Target */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time Transparent Cost Breakdown Table */}
          <div className="bg-[#201C18] text-white rounded-3xl p-6 shadow-xl space-y-6 border border-[#383129]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#D99A2B] uppercase tracking-wider">
                  TRANSPARENT COST SHEET
                </span>
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  {selectedCategory || 'Furniture Piece'}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#B8551F] flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Line-by-Line Breakdown Table */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-[#E5DDD3]">
                <span>1. Raw Materials Cost</span>
                <span className="font-bold text-white text-sm">
                  {calculations.materialCost.toLocaleString()} Birr
                </span>
              </div>

              <div className="flex justify-between items-center text-[#E5DDD3]">
                <span>2. Workshop Labor ({laborHours}h @ {laborRatePerHour} B/h)</span>
                <span className="font-bold text-white text-sm">
                  {calculations.laborCost.toLocaleString()} Birr
                </span>
              </div>

              <div className="flex justify-between items-center text-[#A39B8E] border-t border-white/10 pt-2 font-medium">
                <span>Subtotal (Direct Cost)</span>
                <span>{calculations.subtotal.toLocaleString()} Birr</span>
              </div>

              <div className="flex justify-between items-center text-[#E5DDD3]">
                <span>3. Factory Overhead ({overheadPercent}%)</span>
                <span className="font-bold text-white text-sm">
                  {calculations.overhead.toLocaleString()} Birr
                </span>
              </div>

              <div className="flex justify-between items-center border-t-2 border-white/20 pt-3 text-sm font-extrabold">
                <span className="text-[#D99A2B]">TOTAL COST (All In)</span>
                <span className="text-[#D99A2B] text-base">
                  {calculations.totalCost.toLocaleString()} Birr
                </span>
              </div>
            </div>

            {/* Big Highlight: Final Selling Price & Gross Margin */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-[#A39B8E] font-bold uppercase tracking-wider">
                    FINAL RETAIL PRICE
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#FAF8F5] tracking-tight">
                    {calculations.finalPrice.toLocaleString()}{' '}
                    <span className="text-sm font-bold text-[#D99A2B]">ETB</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#2D5A27] text-white">
                    {calculations.marginPct}% Margin
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#A39B8E] border-t border-white/10 pt-2">
                <span>Projected Gross Profit:</span>
                <span className="font-bold text-white">
                  +{calculations.profitMargin.toLocaleString()} Birr
                </span>
              </div>
            </div>

            {/* Save Target Selector */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#D99A2B]">
                Link & Save Price To
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSaveTargetType('Product');
                    setSelectedTargetId(products[0]?._id || '');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    saveTargetType === 'Product'
                      ? 'bg-[#B8551F] text-white'
                      : 'bg-white/10 text-[#A39B8E] hover:text-white'
                  }`}
                >
                  Storefront Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSaveTargetType('SourcedItem');
                    setSelectedTargetId(sourcedItems[0]?._id || '');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    saveTargetType === 'SourcedItem'
                      ? 'bg-[#B8551F] text-white'
                      : 'bg-white/10 text-[#A39B8E] hover:text-white'
                  }`}
                >
                  Sourced Piece
                </button>
              </div>

              {saveTargetType === 'Product' ? (
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full bg-[#1A1613] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8551F] cursor-pointer"
                >
                  <option value="">-- Choose Product to update --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Current: {p.price?.toLocaleString()} Birr)
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full bg-[#1A1613] border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#B8551F] cursor-pointer"
                >
                  <option value="">-- Choose Sourced Piece to price --</option>
                  {sourcedItems.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name || s.category} ({s.status} · {s.price ? `${s.price} Birr` : 'Unpriced'})
                    </option>
                  ))}
                </select>
              )}

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveToProduct}
                disabled={savingPrice || !selectedTargetId}
                id="save-price-btn"
                className="w-full bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-40 text-white py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
              >
                {savingPrice ? (
                  <span>Saving to Database...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Price to {saveTargetType}</span>
                  </>
                )}
              </button>
            </div>

            {/* Unlocked Gate Banner (Post-Save) */}
            {savedResult && (
              <div className="bg-[#2D5A27]/20 border border-[#2D5A27] rounded-2xl p-4 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Price Finalized & Locked</span>
                </div>
                <p className="text-[11px] text-white/80">
                  This product is now priced at <strong>{savedResult.costBreakdown.finalPrice.toLocaleString()} Birr</strong>.
                  Marketing asset downloads are now fully unlocked!
                </p>
                <div className="pt-2">
                  <Link
                    href={`/admin/content-studio?targetId=${selectedTargetId}&targetType=${saveTargetType}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Open in Content Studio</span>
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function PricingCalculatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-[#6B6459]">Loading Pricing Engine...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
