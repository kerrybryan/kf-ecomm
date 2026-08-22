'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-stone-200/80 last:border-0">
      {/* Product Image */}
      <div className="relative w-20 h-20 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200/60">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
            No Image
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={item.slug ? `/products/${item.slug}` : '/shop'}
              className="text-xs font-semibold text-stone-900 hover:text-amber-700 transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            <button
              onClick={() => removeItem(item.productId, item.variantKey)}
              className="text-stone-400 hover:text-rose-600 transition-colors p-1 -mr-1"
              title="Remove item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Variants info */}
          {(item.variant?.color || item.variant?.material) && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {item.variant.color && (
                <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                  {item.variant.color}
                </span>
              )}
              {item.variant.material && (
                <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                  {item.variant.material}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quantity Controls & Price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
            <button
              onClick={() => updateQuantity(item.productId, item.variantKey, item.quantity - 1)}
              className="p-1 hover:bg-stone-200 text-stone-600 rounded-l-lg transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2.5 text-xs font-semibold text-stone-800">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.variantKey, item.quantity + 1)}
              className="p-1 hover:bg-stone-200 text-stone-600 rounded-r-lg transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-stone-900">
              {formatPrice(item.price * item.quantity)}
            </span>
            {item.quantity > 1 && (
              <span className="block text-[10px] text-stone-500">
                {formatPrice(item.price)} each
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
