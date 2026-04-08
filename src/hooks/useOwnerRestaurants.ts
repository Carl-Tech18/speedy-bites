import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Restaurant, MenuItem } from "@/data/restaurants";

const DEFAULT_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

export function useOwnerRestaurants() {
  const [ownerRestaurants, setOwnerRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerRestaurants();
  }, []);

  const fetchOwnerRestaurants = async () => {
    try {
      const { data: restaurants } = await supabase
        .from("owner_restaurants")
        .select("*")
        .eq("is_active", true);

      if (!restaurants || restaurants.length === 0) {
        setOwnerRestaurants([]);
        setLoading(false);
        return;
      }

      const restaurantIds = restaurants.map((r) => r.id);
      const { data: menuItems } = await supabase
        .from("owner_menu_items")
        .select("*")
        .in("restaurant_id", restaurantIds)
        .eq("is_available", true)
        .order("sort_order");

      const mapped: Restaurant[] = restaurants
        .map((r) => {
          const items = (menuItems || []).filter((m) => m.restaurant_id === r.id);
          if (items.length === 0) return null; // Skip restaurants with no menu items

          const menu: MenuItem[] = items.map((m) => ({
            id: `owner-${m.id}`,
            name: m.name,
            description: m.description || "",
            price: Number(m.price),
            image: m.image_url || DEFAULT_IMG,
          }));

          return {
            id: `owner-${r.id}`,
            name: r.name,
            image: r.image_url || DEFAULT_IMG,
            cuisine: r.cuisine,
            rating: 5.0,
            reviews: 0,
            distance: 1.0,
            deliveryTime: { saver: 30, express: 15 },
            deliveryFee: { saver: 20, express: 40 },
            isLocal: true,
            isNew: true,
            tags: ["New", "Support Local"],
            menu,
          } as Restaurant;
        })
        .filter(Boolean) as Restaurant[];

      setOwnerRestaurants(mapped);
    } catch (err) {
      console.error("Failed to fetch owner restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  return { ownerRestaurants, loading };
}
