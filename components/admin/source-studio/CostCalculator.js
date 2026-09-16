'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Clock, Percent, Sparkles, TrendingUp, Info } from 'lucide-react';

export default function CostCalculator({
  initialValues = {},
  aiSuggestedMin = 0,
  aiSuggestedMax = 0,
  onChange,
}) {
  const [materialCost, setMaterialCost] = useState(initialValues.materialCost ?? 250);
  const [laborHours, setLaborHours] = useState(initialValues.laborHours ?? 8);
  const [laborRate, setLaborRate] = useState(initialValues.laborRate ?? 45);
  const [overheadPercent, setOverheadPercent] = useState(initialValues.overheadPercent ?? 15);
  const [markupMultiplier, setMarkupMultiplier] = useState(initialValues.markupMultiplier ?? 2.2);
  const [finalPrice, setFinalPrice] = useState(initialValues.finalPrice ?? 0);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Derived cost formulas
  const laborSubtotal = Number(laborHours) * Number(laborRate);
  const directSubtotal = Number(materialCost) + laborSubtotal;
  const overheadAmount = directSubtotal * (Number(overheadPercent) / 100);
  const totalCost = Math.round(directSubtotal + overheadAmount);
  const suggestedFormulaPrice = Math.round(totalCost * Number(markupMultiplier));

  useEffect(() => {
    if (!isManualOverride && suggestedFormulaPrice > 0) {
      setFinalPrice(suggestedFormulaPrice);
    }
  }, [suggestedFormulaPrice, isManualOverride]);

  useEffect(() => {
    if (initialValues.finalPrice && initialValues.finalPrice !== suggestedFormulaPrice) {
      setFinalPrice(initialValues.finalPrice);
      setIsManualOverride(true);
    }
  }, [initialValues.finalPrice]);

  // Notify parent on change
  useEffect(() => {
    if (onChange) {
      onChange({
        materialCost: Number(materialCost),
        laborHours: Number(laborHours),
        laborRate: Number(laborRate),
        overheadPercent: Number(overheadPercent),
        markupMultiplier: Number(markupMultiplier),
        calculatedCost: totalCost,
        finalPrice: Number(finalPrice || suggestedFormulaPrice),
      });
    }
  }, [materialCost, laborHours, laborRate, overheadPercent, markupMultiplier, finalPrice, totalCost, suggestedFormulaPrice]);

  const handleFinalPriceChange = (val) => {
    setIsManualOverride(true);
    setFinalPrice(val);
  };

  const resetToFormula = () => {
    setIsManualOverride(false);
    setFinalPrice(suggestedFormulaPrice);
  };

  const isWithinAiRange =
    aiSuggestedMin > 0 &&
    aiSuggestedMax > 0 &&
    finalPrice >= aiSuggestedMin &&
    finalPrice <= aiSuggestedMax;

  return (
    <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#A8875E]/15 text-[#A8875E] flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1613]">Manufacturing Cost & Pricing Calculator</h3>
            <p className="text-xs text-[#7C7265]">KB Furniture workshop cost algorithm with configurable margin</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[#A8875E] bg-[#A8875E]/10 px-2.5 py-1 rounded-full border border-[#A8875E]/20">
          Formula Active
        </span>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Material Cost */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4A4036] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#A8875E]" />
            Material Cost ($)
          </label>
          <input
            type="number"
            min="0"
            step="10"
            value={materialCost}
            onChange={(e) => setMaterialCost(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CCC2] text-sm font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E]"
          />
          <p className="text-[10px] text-[#7C7265]">Timber, upholstery, hardware</p>
        </div>

        {/* Labor Hours */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4A4036] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#A8875E]" />
            Labor Hours
          </label>
          <input
            type="number"
            min="1"
            step="0.5"
            value={laborHours}
            onChange={(e) => setLaborHours(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CCC2] text-sm font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E]"
          />
          <p className="text-[10px] text-[#7C7265]">Joinery, finishing & assembly</p>
        </div>

        {/* Labor Hourly Rate */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4A4036] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#A8875E]" />
            Hourly Rate ($/hr)
          </label>
          <input
            type="number"
            min="1"
            step="5"
            value={laborRate}
            onChange={(e) => setLaborRate(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CCC2] text-sm font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E]"
          />
          <p className="text-[10px] text-[#7C7265]">Craftsman workshop base</p>
        </div>

        {/* Overhead % */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4A4036] flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-[#A8875E]" />
            Overhead Margin (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={overheadPercent}
            onChange={(e) => setOverheadPercent(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CCC2] text-sm font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E]"
          />
          <p className="text-[10px] text-[#7C7265]">Tooling, studio & freight</p>
        </div>
      </div>

      {/* Breakdown Summary Bar */}
      <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#EBE5DF] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div>
          <p className="text-[10px] uppercase font-bold text-[#7C7265] tracking-wider">Labor Subtotal</p>
          <p className="text-sm font-bold text-[#1A1613] mt-0.5">ETB {laborSubtotal.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[#7C7265] tracking-wider">Overhead Cost</p>
          <p className="text-sm font-bold text-[#1A1613] mt-0.5">ETB {Math.round(overheadAmount).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[#7C7265] tracking-wider">Total Mfg Cost</p>
          <p className="text-sm font-extrabold text-[#943F24] mt-0.5">ETB {totalCost.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-[#7C7265] tracking-wider">Markup Multiplier</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <select
              value={markupMultiplier}
              onChange={(e) => setMarkupMultiplier(Number(e.target.value))}
              className="bg-white border border-[#D5CCC2] rounded px-1.5 py-0.5 text-xs font-bold text-[#1A1613] focus:outline-none"
            >
              <option value="1.8">1.8x (Wholesale)</option>
              <option value="2.0">2.0x (Standard)</option>
              <option value="2.2">2.2x (Luxury Premium)</option>
              <option value="2.5">2.5x (Bespoke)</option>
              <option value="3.0">3.0x (Custom Architecture)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparison & Final Price Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
        {/* AI Market Sanity Check */}
        <div className="rounded-xl border border-[#E8DFC8] bg-[#FDFBF7] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A5826] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A8875E]" />
              AI Market Benchmark
            </span>
            {isWithinAiRange ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                ✓ Within Market Range
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Custom Market Deviation
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-serif font-bold text-[#1A1613]">
              ETB {aiSuggestedMin.toLocaleString()} – ETB {aiSuggestedMax.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#7C7265]">Estimated Market Retail</span>
          </div>
          <p className="text-[11px] text-[#7C7265] flex items-center gap-1">
            <Info className="w-3 h-3 text-[#A8875E]" />
            Compare workshop manufacturing cost against market sentiment.
          </p>
        </div>

        {/* Final Price Box */}
        <div className="rounded-xl border-2 border-[#A8875E] bg-[#FAF8F5] p-4 space-y-2 relative">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1A1613] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#A8875E]" />
              Final Retail Price (ETB)
            </label>
            {isManualOverride && (
              <button
                type="button"
                onClick={resetToFormula}
                className="text-[10px] font-bold text-[#A8875E] hover:underline"
              >
                Reset to formula (ETB {suggestedFormulaPrice})
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7C7265]">ETB</span>
              <input
                type="number"
                min="0"
                step="500"
                value={finalPrice}
                onChange={(e) => handleFinalPriceChange(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-[#A8875E] text-xl font-bold text-[#1A1613] focus:outline-none focus:ring-2 focus:ring-[#A8875E]"
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#7C7265] block">Gross Margin</span>
              <span className="text-xs font-extrabold text-emerald-700">
                {finalPrice > 0 ? Math.round(((finalPrice - totalCost) / finalPrice) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
