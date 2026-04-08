import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import DeliveryToggle from "@/components/DeliveryToggle";
import CategoryScroll from "@/components/CategoryScroll";
import RestaurantCard from "@/components/RestaurantCard";
import CartBar from "@/components/CartBar";
import { restaurants } from "@/data/restaurants";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import heroFood from "@/assets/hero-food.jpg";
import { Store, Zap, TrendingDown, User, Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { MenuItem, Restaurant } from "@/data/restaurants";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { deliveryMode, addItem } = useCart();
  const { user } = useAuth();

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";

  // For category filtering (no search)
  const filtered = useMemo(() => {
    let list = restaurants;
    if (activeCategory !== "all") {
      list = list.filter((r) => r.cuisine === activeCategory);
    }
    return list;
  }, [activeCategory]);

  // For search: find matching menu items across all restaurants
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { restaurant: Restaurant; menuItem: MenuItem }[] = [];
    restaurants.forEach((r) => {
      // If restaurant name matches, include all its items
      const nameMatch = r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q);
      r.menu.forEach((item) => {
        if (nameMatch || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
          results.push({ restaurant: r, menuItem: item });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const cheapest = useMemo(
    () => [...restaurants].sort((a, b) => a.menu[0].price - b.menu[0].price).slice(0, 3),
    []
  );

  const fastest = useMemo(
    () =>
      [...restaurants]
        .sort((a, b) => a.deliveryTime[deliveryMode] - b.deliveryTime[deliveryMode])
        .slice(0, 3),
    [deliveryMode]
  );

  const localSpots = useMemo(() => restaurants.filter((r) => r.isLocal), []);

  const gridCols = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-52 md:h-64 lg:h-72 overflow-hidden">
        <img src={heroFood} alt="Delicious food" className="w-full h-full object-cover" width={1280} height={640} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, hsla(18, 90%, 30%, 0.5) 0%, hsla(18, 90%, 25%, 0.4) 40%, hsla(18, 90%, 20%, 0.7) 100%)",
        }} />
        <div className="absolute top-4 right-4 md:top-6 md:right-8">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-card/85 backdrop-blur-md hover:bg-card transition-colors shadow-sm"
          >
            <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-bold text-foreground hidden sm:inline">{displayName}</span>
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute bottom-5 left-4 right-4 md:bottom-7 md:left-8 md:right-8"
        >
          <p className="text-xs md:text-sm font-bold text-card/80 mb-0.5">Hey {displayName} 👋</p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-card leading-tight">
            What are you<br />craving today?
          </h1>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-5 -mt-4 relative z-10">
        {/* Search & Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-4 shadow-lg shadow-foreground/5 border-2 border-border/50 space-y-3 max-w-2xl"
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-bold">Delivery mode:</span>
            <DeliveryToggle />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-2.5 md:gap-3 max-w-lg"
        >
          <QuickStat icon={<TrendingDown className="w-4 h-4" />} label="From ₱69" sub="Cheapest" color="bg-saver/10 text-saver" />
          <QuickStat icon={<Zap className="w-4 h-4" />} label="10 min" sub="Fastest" color="bg-express/10 text-express" />
          <QuickStat icon={<Store className="w-4 h-4" />} label={`${localSpots.length} shops`} sub="Local" color="bg-local/10 text-local" />
        </motion.div>

        {/* Categories */}
        <CategoryScroll active={activeCategory} onChange={setActiveCategory} />

        {/* Search results: show individual menu items */}
        {searchQuery.trim() ? (
          <Section title="🔍 Search Results" subtitle={`${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${searchQuery}"`}>
            {searchResults.length > 0 ? (
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2.5 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                {searchResults.map(({ restaurant: r, menuItem }) => (
                  <motion.div key={menuItem.id} variants={fadeUp}>
                    <SearchResultItem menuItem={menuItem} restaurant={r} onAdd={() => addItem(menuItem, r)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-lg font-display font-bold">No results found 😕</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}
          </Section>
        ) : activeCategory !== "all" ? (
          <motion.div variants={stagger} initial="hidden" animate="show" className={`grid ${gridCols} gap-3 md:gap-4`}>
            {filtered.map((r) => (
              <motion.div key={r.id} variants={fadeUp}>
                <RestaurantCard restaurant={r} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <>
            <Section title="🏠 Support Local" subtitle="Small businesses near you">
              <motion.div variants={stagger} initial="hidden" animate="show" className={`grid ${gridCols} gap-3 md:gap-4`}>
                {localSpots.map((r) => (
                  <motion.div key={r.id} variants={fadeUp}>
                    <RestaurantCard restaurant={r} />
                  </motion.div>
                ))}
              </motion.div>
            </Section>

            <Section title="💰 Cheapest Eats" subtitle="Most affordable meals nearby">
              <motion.div variants={stagger} initial="hidden" animate="show" className={`grid ${gridCols} gap-3 md:gap-4`}>
                {cheapest.map((r) => (
                  <motion.div key={r.id} variants={fadeUp}>
                    <RestaurantCard restaurant={r} />
                  </motion.div>
                ))}
              </motion.div>
            </Section>

            <Section title="⚡ Fastest Delivery" subtitle={deliveryMode === "express" ? "Express mode" : "Saver mode"}>
              <motion.div variants={stagger} initial="hidden" animate="show" className={`grid ${gridCols} gap-3 md:gap-4`}>
                {fastest.map((r) => (
                  <motion.div key={r.id} variants={fadeUp}>
                    <RestaurantCard restaurant={r} />
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          </>
        )}
      </div>

      <CartBar />
    </div>
  );
};

const Section = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <div>
      <h2 className="text-lg md:text-xl font-display font-bold text-foreground">{title}</h2>
      <p className="text-xs md:text-sm text-muted-foreground font-medium">{subtitle}</p>
    </div>
    {children}
  </section>
);

const QuickStat = ({ icon, label, sub, color }: { icon: React.ReactNode; label: string; sub: string; color: string }) => (
  <div className={`rounded-2xl p-3.5 text-center ${color} border-2 border-transparent hover:border-current/10 transition-colors cursor-default`}>
    <div className="flex justify-center mb-1.5">{icon}</div>
    <div className="text-sm font-extrabold">{label}</div>
    <div className="text-[10px] font-bold opacity-60">{sub}</div>
  </div>
);

const SearchResultItem = ({ menuItem, restaurant, onAdd }: { menuItem: MenuItem; restaurant: Restaurant; onAdd: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="flex gap-3.5 bg-card rounded-3xl border-2 border-border/60 p-3.5 hover:border-primary/20 hover:shadow-md transition-all">
      <img
        src={menuItem.image}
        alt={menuItem.name}
        loading="lazy"
        width={80}
        height={80}
        className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-extrabold text-foreground text-sm">{menuItem.name}</h3>
        <button
          onClick={() => navigate(`/restaurant/${restaurant.id}`)}
          className="text-[10px] font-bold text-primary hover:underline"
        >
          {restaurant.name}
        </button>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-medium">{menuItem.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-extrabold text-foreground">₱{menuItem.price}</span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onAdd}
            className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Index;
