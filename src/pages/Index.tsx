import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import DeliveryToggle from "@/components/DeliveryToggle";
import CategoryScroll from "@/components/CategoryScroll";
import RestaurantCard from "@/components/RestaurantCard";
import CartBar from "@/components/CartBar";
import { restaurants } from "@/data/restaurants";
import { useCart } from "@/context/CartContext";
import heroFood from "@/assets/hero-food.jpg";
import { Store, Zap, TrendingDown } from "lucide-react";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const { deliveryMode } = useCart();

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-44 overflow-hidden">
        <img src={heroFood} alt="Delicious food" className="w-full h-full object-cover" width={1280} height={640} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 to-foreground/20" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-extrabold text-card">
            Good food,<br />delivered fast 🔥
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6 -mt-2 relative z-10">
        {/* Search & Toggle */}
        <div className="bg-card rounded-2xl p-4 shadow-md space-y-3">
          <SearchBar />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Delivery mode:</span>
            <DeliveryToggle />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <QuickStat icon={<TrendingDown className="w-4 h-4" />} label="From ₱69" sub="Cheapest" color="bg-saver/10 text-saver" />
          <QuickStat icon={<Zap className="w-4 h-4" />} label="10 min" sub="Fastest" color="bg-express/10 text-express" />
          <QuickStat icon={<Store className="w-4 h-4" />} label={`${localSpots.length} shops`} sub="Local" color="bg-local/10 text-local" />
        </div>

        {/* Categories */}
        <CategoryScroll active={activeCategory} onChange={setActiveCategory} />

        {/* Support Local Section */}
        {activeCategory === "all" && (
          <Section title="🏠 Support Local" subtitle="Small businesses near you">
            <div className="grid grid-cols-2 gap-3">
              {localSpots.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          </Section>
        )}

        {/* Cheapest */}
        {activeCategory === "all" && (
          <Section title="💰 Cheapest Eats" subtitle="Most affordable meals nearby">
            <div className="grid grid-cols-2 gap-3">
              {cheapest.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          </Section>
        )}

        {/* Fastest */}
        {activeCategory === "all" && (
          <Section title="⚡ Fastest Delivery" subtitle={deliveryMode === "express" ? "Express mode" : "Saver mode"}>
            <div className="grid grid-cols-2 gap-3">
              {fastest.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          </Section>
        )}

        {/* All / Filtered */}
        {activeCategory !== "all" && (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>

      <CartBar />
    </div>
  );
};

const Section = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
    {children}
  </section>
);

const QuickStat = ({ icon, label, sub, color }: { icon: React.ReactNode; label: string; sub: string; color: string }) => (
  <div className={`rounded-xl p-3 text-center ${color}`}>
    <div className="flex justify-center mb-1">{icon}</div>
    <div className="text-sm font-bold">{label}</div>
    <div className="text-[10px] opacity-70">{sub}</div>
  </div>
);

export default Index;
