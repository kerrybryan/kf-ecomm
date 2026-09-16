'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);
const WISHLIST_STORAGE_KEY = 'kb_furniture_guest_wishlist';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Load initial wishlist
  useEffect(() => {
    setIsMounted(true);
    if (isAuthenticated && user?.wishlist) {
      setWishlist(user.wishlist);
    } else {
      try {
        const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (stored) {
          setWishlist(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load guest wishlist:', err);
      }
    }
  }, [isAuthenticated, user]);

  // Save guest wishlist to localStorage
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      } catch (err) {
        console.error('Failed to save guest wishlist:', err);
      }
    }
  }, [wishlist, isAuthenticated, isMounted]);

  const isInWishlist = useCallback(
    (productId) => {
      const id = typeof productId === 'object' ? productId?._id : productId;
      return wishlist.some((item) => {
        const itemId = typeof item === 'object' ? item?._id : item;
        return itemId === id;
      });
    },
    [wishlist]
  );

  const toggleWishlist = async (product) => {
    const id = product._id || product.productId || product;
    const exists = isInWishlist(id);

    if (exists) {
      setWishlist((prev) =>
        prev.filter((item) => {
          const itemId = typeof item === 'object' ? item?._id : item;
          return itemId !== id;
        })
      );
      addToast('Removed from wishlist', 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      addToast('Saved to your wishlist', 'success');
    }

    // If authenticated, persist to MongoDB
    if (isAuthenticated) {
      try {
        await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id }),
        });
      } catch (err) {
        console.error('Failed to sync wishlist with DB:', err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
