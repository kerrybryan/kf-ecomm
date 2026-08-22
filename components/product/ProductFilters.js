'use client';

import React from 'react';
import { RotateCcw, Filter, Check } from 'lucide-react';

const CATEGORIES = [
  { label: 'All Furniture', value: 'all' },
  { label: 'Living Room', value: 'living-room' },
  { label: 'Bedroom', value: 'bedroom' },
  { label: 'Dining Room', value: 'dining-room' },
  { label: 'Home Office', value: 'home-office' },
  { label: 'Lighting & Decor', value: 'lighting-decor' },
  { label: 'Outdoor', value: 'outdoor' },
];

const MATERIALS = [
  'All Materials',
  'Solid Oak',
  'American Walnut',
  'Bouclé',
  'Italian Leather',
  'Travertine Stone',
  'Velvet',
  'Teak',
  'Marble',
];

const PRICE_PRESETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under $500', min: '0', max: '500' },
  { label: '$500 - $1,000', min: '500', max: '1000' },
  { label: '$1,000 - $2,000', min: '1000', max: '2000' },
  { label: 'Over $2,000', min: '2000', max: '' },
];

export default function ProductFilters({
  activeCategory,
  onCategoryChange,
  activeMaterial,
  onMaterialChange,
  activePriceRange,
  onPriceRangeChange,
  inStockOnly,
  onInStockChange,
  sortBy,
  onSortChange,
  onResetFilters,
  totalCount,
}) {
  const isFiltered =
    activeCategory !== 'all' ||
    activeMaterial !== 'All Materials' ||
    activePriceRange.min !== '' ||
    activePriceRange.max !== '' ||
    inStockOnly;

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-900" />
          <h3 className="text-xs uppercase font-bold tracking-wider text-stone-900">
            Refine Catalog
          </h3>
        </div>
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
          Category
        </h4>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-stone-900 text-white font-medium'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <span>{cat.label}</span>
                {isActive && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Presets */}
      <div>
        <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="space-y-1">
          {PRICE_PRESETS.map((preset, idx) => {
            const isActive =
              activePriceRange.min === preset.min && activePriceRange.max === preset.max;
            return (
              <button
                key={idx}
                onClick={() => onPriceRangeChange(preset.min, preset.max)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-stone-900 text-white font-medium'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <span>{preset.label}</span>
                {isActive && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Material Filter */}
      <div>
        <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
          Material & Finish
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {MATERIALS.map((mat) => {
            const isActive =
              activeMaterial === mat || (mat === 'All Materials' && !activeMaterial);
            return (
              <button
                key={mat}
                onClick={() => onMaterialChange(mat === 'All Materials' ? '' : mat)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white border-stone-900 font-medium'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {mat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Availability */}
      <div className="pt-2 border-t border-stone-100">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-700 select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
          />
          <span className="font-medium">In-Stock Pieces Only</span>
        </label>
      </div>
    </div>
  );
}
