import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { MenuItem, Restaurant } from "@/data/restaurants";

export type DeliveryMode = "saver" | "express";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurant: Restaurant;
}

interface CartState {
  items: CartItem[];
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
  /** All unique restaurants in the cart */
  restaurants: Restaurant[];
  /** For backwards compat — first restaurant or null */
  restaurant: Restaurant | null;
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
        return { items: parsed.items, deliveryMode: parsed.deliveryMode || "saver" };
      }
    }
  } catch {}
  return { items: [], deliveryMode: "saver" };
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
      const existing = prev.items.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...prev, items: [...prev.items, { menuItem: item, quantity: 1, restaurant }] };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.menuItem.id !== itemId),
    }));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.menuItem.id !== itemId),
      }));
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
    setState({ items: [], deliveryMode: "saver" });
  }, []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);

  // Unique restaurants in cart
  const restaurantsMap = new Map<string, Restaurant>();
  state.items.forEach((i) => restaurantsMap.set(i.restaurant.id, i.restaurant));
  const restaurants = Array.from(restaurantsMap.values());

  // Sum delivery fees from all unique restaurants
  const deliveryFee = restaurants.reduce(
    (sum, r) => sum + r.deliveryFee[state.deliveryMode],
    0
  );
  const total = subtotal + deliveryFee;
  const restaurant = restaurants[0] || null;

  return (
    <CartContext.Provider
      value={{ ...state, addItem, removeItem, updateQuantity, setDeliveryMode, clearCart, totalItems, subtotal, deliveryFee, total, restaurants, restaurant }}
    >
      {children}
    </CartContext.Provider>
  );
};
