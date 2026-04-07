import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { MenuItem, Restaurant } from "@/data/restaurants";

export type DeliveryMode = "saver" | "express";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  restaurant: Restaurant | null;
  deliveryMode: DeliveryMode;
}

interface CartContextType extends CartState {
  addItem: (item: MenuItem, restaurant: Restaurant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setDeliveryMode: (mode: DeliveryMode) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const CART_STORAGE_KEY = "quickbite-cart";

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

const loadCartFromStorage = (): CartState => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.items && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch {}
  return { items: [], restaurant: null, deliveryMode: "saver" };
};

const saveCartToStorage = (state: CartState) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CartState>(loadCartFromStorage);

  useEffect(() => {
    saveCartToStorage(state);
  }, [state]);

  const addItem = useCallback((item: MenuItem, restaurant: Restaurant) => {
    setState((prev) => {
      if (prev.restaurant && prev.restaurant.id !== restaurant.id) {
        return { ...prev, restaurant, items: [{ menuItem: item, quantity: 1 }] };
      }
      const existing = prev.items.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return {
          ...prev,
          restaurant,
          items: prev.items.map((i) =>
            i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...prev, restaurant, items: [...prev.items, { menuItem: item, quantity: 1 }] };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setState((prev) => {
      const items = prev.items.filter((i) => i.menuItem.id !== itemId);
      return { ...prev, items, restaurant: items.length ? prev.restaurant : null };
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setState((prev) => {
        const items = prev.items.filter((i) => i.menuItem.id !== itemId);
        return { ...prev, items, restaurant: items.length ? prev.restaurant : null };
      });
      return;
    }
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.menuItem.id === itemId ? { ...i, quantity } : i)),
    }));
  }, []);

  const setDeliveryMode = useCallback((mode: DeliveryMode) => {
    setState((prev) => ({ ...prev, deliveryMode: mode }));
  }, []);

  const clearCart = useCallback(() => {
    setState({ items: [], restaurant: null, deliveryMode: "saver" });
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
  const deliveryFee = state.restaurant
    ? state.restaurant.deliveryFee[state.deliveryMode]
    : 0;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{ ...state, addItem, removeItem, updateQuantity, setDeliveryMode, clearCart, totalItems, subtotal, deliveryFee, total }}
    >
      {children}
    </CartContext.Provider>
  );
};
