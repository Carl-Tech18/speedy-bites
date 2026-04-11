import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Package, Clock, ChefHat, Check, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
  id: string;
  restaurant_name: string;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_mode: string;
  status: string;
  created_at: string;
  user_id: string;
}

const STATUS_FLOW = ["pending", "preparing", "ready", "delivered"];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "Pending", icon: <Clock className="w-3.5 h-3.5" />, color: "bg-yellow-500/15 text-yellow-600" },
  preparing: { label: "Preparing", icon: <ChefHat className="w-3.5 h-3.5" />, color: "bg-blue-500/15 text-blue-600" },
  ready: { label: "Ready", icon: <Package className="w-3.5 h-3.5" />, color: "bg-accent/15 text-accent" },
  delivered: { label: "Delivered", icon: <Check className="w-3.5 h-3.5" />, color: "bg-green-500/15 text-green-700" },
};

const OwnerOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("active");

  useEffect(() => {
    fetchOrders();
    // Real-time subscription
    const channel = supabase
      .channel("owner-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data as any);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus } as any).eq("id", orderId);
      if (error) throw error;
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const filtered = orders.filter((o) => {
    if (filter === "active") return o.status !== "delivered";
    return o.status === "delivered";
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "active", label: "Active Orders" },
          { key: "delivered", label: "Completed" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filter === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t.label}
            {t.key === "active" && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-[10px]">
                {orders.filter((o) => o.status !== "delivered").length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-muted-foreground"
          >
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">{filter === "active" ? "No active orders" : "No completed orders yet"}</p>
          </motion.div>
        ) : (
          filtered.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const next = getNextStatus(order.status);
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-warm-glow rounded-2xl p-4 border border-border/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {new Date(order.created_at).toLocaleDateString()} · {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">#{order.id.slice(0, 8)}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.color}`}>
                    {config.icon}
                    {config.label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {(order.items as any[]).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{item.quantity}× {item.name}</span>
                      <span className="text-muted-foreground font-medium">₱{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-sm font-extrabold text-foreground">₱{order.total}</span>
                  {next && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, next)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm disabled:opacity-60"
                    >
                      {updatingId === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>Mark as {STATUS_CONFIG[next]?.label}</>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
};

export default OwnerOrders;
