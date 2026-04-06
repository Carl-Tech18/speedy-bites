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
import { Store, Zap, TrendingDown, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

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
  const { deliveryMode } = useCart();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";

  const filtered = useMemo(() => {
    if (activeCategory === "all") return restaurants;
    return restaurants.filter((r) => r.cuisine === activeCategory);
  }, [activeCategory]);

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
      <div className="relative h-48 md:h-60 lg:h-72 overflow-hidden">
        <img src={heroFood} alt="Delicious food" className="w-full h-full object-cover" width={1280} height={640} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-foreground/60" />
        <div className="absolute top-4 right-4 md:top-6 md:right-8 flex items-center gap-2">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-card/80 backdrop-blur-md hover:bg-card transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-semibold text-foreground hidden sm:inline">{displayName}</span>
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/80 backdrop-blur-md text-foreground text-xs font-medium hover:bg-card transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-8 md:right-8"
        >
          <p className="text-xs md:text-sm font-medium text-card/70 mb-0.5">Hey {displayName} 👋</p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-card leading-tight">
            What are you<br />craving today?
          </h1>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-6 -mt-3 relative z-10">
        {/* Search & Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-4 shadow-lg shadow-foreground/5 space-y-3 max-w-2xl"
        >
          <SearchBar />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Delivery mode:</span>
            <DeliveryToggle />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-2 md:gap-3 max-w-lg"
        >
          <QuickStat icon={<TrendingDown className="w-4 h-4" />} label="From ₱69" sub="Cheapest" color="bg-saver/10 text-saver" />
          <QuickStat icon={<Zap className="w-4 h-4" />} label="10 min" sub="Fastest" color="bg-express/10 text-express" />
          <QuickStat icon={<Store className="w-4 h-4" />} label={`${localSpots.length} shops`} sub="Local" color="bg-local/10 text-local" />
        </motion.div>

        {/* Categories */}
        <CategoryScroll active={activeCategory} onChange={setActiveCategory} />

        {/* Support Local Section */}
        {activeCategory === "all" && (
          <Section title="🏠 Support Local" subtitle="Small businesses near you">
            <motion.div variants={stagger} initial="hidden" animate="show" className={`grid ${gridCols} gap-3 md:gap-4`}>
              {localSpots.map((r) => (
                <motion.div key={r.id} variants={fadeUp}>
                  <RestaurantCard restaurant={r} />
                </motion.div>
              ))}
            </motion.div>
          </Section>
        )}

        {/* Cheapest */}
        {activeCategory === "all" && (
          <Section title="💰 Cheapest Eats" subtitle="Most affordable meals nearby">
            <motion.div variants={stagger} initial="hidden" animate="show" className={`grid ${gridCols} gap-3 md:gap-4`}>
              {cheapest.map((r) => (
                <motion.div key={r.id} variants={fadeUp}>
                  <RestaurantCard restaurant={r} />
                </motion.div>
              ))}
            </motion.div>
          </Section>
        )}

        {/* Fastest */}
        {activeCategory === "all" && (
          <Section title="⚡ Fastest Delivery" subtitle={deliveryMode === "express" ? "Express mode" : "Saver mode"}>
            <motion.div variants={stagger} initial="hidden" animate="show" className={`grid ${gridCols} gap-3 md:gap-4`}>
              {fastest.map((r) => (
                <motion.div key={r.id} variants={fadeUp}>
                  <RestaurantCard restaurant={r} />
                </motion.div>
              ))}
            </motion.div>
          </Section>
        )}

        {/* All / Filtered */}
        {activeCategory !== "all" && (
          <motion.div variants={stagger} initial="hidden" animate="show" className={`grid ${gridCols} gap-3 md:gap-4`}>
            {filtered.map((r) => (
              <motion.div key={r.id} variants={fadeUp}>
                <RestaurantCard restaurant={r} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <CartBar />
    </div>
  );
};

const Section = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <div>
      <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
      <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
    </div>
    {children}
  </section>
);

const QuickStat = ({ icon, label, sub, color }: { icon: React.ReactNode; label: string; sub: string; color: string }) => (
  <div className={`rounded-2xl p-3 text-center ${color} border border-transparent hover:border-current/10 transition-colors cursor-default`}>
    <div className="flex justify-center mb-1">{icon}</div>
    <div className="text-sm font-bold">{label}</div>
    <div className="text-[10px] opacity-70">{sub}</div>
  </div>
);

export default Index;
