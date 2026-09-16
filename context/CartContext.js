'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'kb_furniture_cart_items';
const FREE_SHIPPING_MIN = 50000;
const STANDARD_SHIPPING = 1500;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { addToast } = useToast();

  const [shippingRules, setShippingRules] = useState({
    freeShippingThreshold: FREE_SHIPPING_MIN,
    flatRate: STANDARD_SHIPPING,
  });

  // Load from localStorage on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load cart from storage:', err);
    }

    // Fetch dynamic store settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.shippingRules) {
          setShippingRules({
            freeShippingThreshold: json.data.shippingRules.freeShippingThreshold || FREE_SHIPPING_MIN,
            flatRate: json.data.shippingRules.flatRate || STANDARD_SHIPPING,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.error('Failed to save cart to storage:', err);
      }
    }
  }, [items, isMounted]);

  const getVariantKey = (variant) => {
    if (!variant) return 'default';
    return `${variant.color || ''}_${variant.material || ''}`;
  };

  const addItem = (product, quantity = 1, variant = {}) => {
    const variantKey = getVariantKey(variant);
    
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === (product._id || product.productId) && item.variantKey === variantKey
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem = {
          productId: product._id || product.productId,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0] || product.image,
          variant,
          variantKey,
          quantity,
        };
        return [...prevItems, newItem];
      }
    });

    addToast(`Added "${product.name}" to your cart`, 'success');
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, variantKey, quantity) => {
    if (quantity <= 0) {
      removeItem(productId, variantKey);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && (item.variantKey === variantKey || !variantKey)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeItem = (productId, variantKey) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && (item.variantKey === variantKey || !variantKey))
      )
    );
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {}
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Computations
  const threshold = shippingRules.freeShippingThreshold || FREE_SHIPPING_MIN;
  const flatFee = shippingRules.flatRate || STANDARD_SHIPPING;

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeShipping = subtotal >= threshold;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : flatFee;
  const amountToFreeShipping = Math.max(0, threshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / threshold) * 100);
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shippingFee + (items.length > 0 ? estimatedTax : 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        subtotal,
        total,
        shippingFee,
        estimatedTax,
        isFreeShipping,
        amountToFreeShipping,
        freeShippingProgress,
        freeShippingThreshold: threshold,
        isCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
