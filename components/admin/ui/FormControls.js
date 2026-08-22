'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export function FormField({ label, error, required, children, helperText, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-zinc-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {helperText && !error && <p className="text-[11px] text-zinc-400">{helperText}</p>}
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

export function TextInput({ className = '', error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E] transition-all disabled:bg-zinc-50 disabled:text-zinc-400 ${
        error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-zinc-200'
      } ${className}`}
    />
  );
}

export function TextArea({ className = '', rows = 3, error, ...props }) {
  return (
    <textarea
      rows={rows}
      {...props}
      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E] transition-all disabled:bg-zinc-50 disabled:text-zinc-400 ${
        error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-zinc-200'
      } ${className}`}
    />
  );
}

export function Select({ options = [], className = '', error, ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E] transition-all cursor-pointer ${
        error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-zinc-200'
      } ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer select-none">
      <div>
        <p className="text-xs font-semibold text-zinc-800">{label}</p>
        {description && <p className="text-[11px] text-zinc-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-[#A8875E]' : 'bg-zinc-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

export function TagInput({ tags = [], onChange, placeholder = 'Type and press Enter...' }) {
  const [inputVal, setInputVal] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputVal.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
        setInputVal('');
      }
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="p-2 bg-white border border-zinc-200 rounded-xl flex flex-wrap items-center gap-1.5 min-h-[42px] focus-within:border-[#A8875E] focus-within:ring-1 focus-within:ring-[#A8875E] transition-all">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-800 rounded-lg text-xs font-medium border border-zinc-200/60"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(idx)}
            className="text-zinc-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : 'Add more...'}
        className="flex-1 min-w-[120px] px-2 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none bg-transparent"
      />
    </div>
  );
}
