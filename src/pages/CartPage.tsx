import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DeliveryToggle from "@/components/DeliveryToggle";
import { ArrowLeft, Plus, Minus, Trash2, CheckCircle, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, restaurants, deliveryMode, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [ordered, setOrdered] = useState(false);
  const [placing, setPlacing] = useState(false);

  // Group items by restaurant
  const grouped = restaurants.map((r) => ({
    restaurant: r,
    items: items.filter((i) => i.restaurant.id === r.id),
  }));

  const placeOrder = async () => {
    if (!user || restaurants.length === 0) return;
    setPlacing(true);
    try {
      // Create one order per restaurant
      for (const group of grouped) {
        const orderItems = group.items.map(({ menuItem, quantity }) => ({
          name: menuItem.name,
          price: menuItem.price,
          quantity,
        }));
        const groupSubtotal = group.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
        const groupFee = group.restaurant.deliveryFee[deliveryMode];
        const { error } = await supabase.from("orders").insert({
          user_id: user.id,
          restaurant_name: group.restaurant.name,
          items: orderItems,
          subtotal: groupSubtotal,
          delivery_fee: groupFee,
          total: groupSubtotal + groupFee,
          delivery_mode: deliveryMode,
          status: "delivered",
        } as any);
        if (error) throw error;
      }
      setOrdered(true);
      toast.success("Order placed successfully! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }} className="w-24 h-24 rounded-3xl bg-accent/15 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-accent" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Order Placed! 🎉</h1>
          <p className="text-muted-foreground text-sm max-w-xs md:max-w-md mt-2 font-medium">
            Your order from <span className="font-extrabold text-foreground">{restaurants.map((r) => r.name).join(", ")}</span> is being prepared.
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { clearCart(); setOrdered(false); navigate("/"); }}
          className="mt-4 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-extrabold shadow-lg shadow-primary/25"
        >
          Back to Home 🏠
        </motion.button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
        </motion.div>
        <h1 className="text-xl font-display font-bold text-foreground">Your cart is empty 🛒</h1>
        <p className="text-sm text-muted-foreground font-medium">Browse restaurants and add some food!</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/")} className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-extrabold shadow-lg shadow-primary/25">
          Browse Food 🍕
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b-2 border-border/50 px-4 md:px-6 py-3 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div>
          <h1 className="font-display font-bold text-foreground">Your Cart 🛒</h1>
          <p className="text-xs text-muted-foreground font-medium">
            {restaurants.length === 1 ? restaurants[0].name : `${restaurants.length} restaurants`}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-4">
        <div className="md:grid md:grid-cols-5 md:gap-6">
          {/* Left: Items grouped by restaurant */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between bg-card rounded-3xl p-4 border-2 border-border/50">
              <span className="text-sm font-bold text-foreground">Delivery mode</span>
              <DeliveryToggle />
            </div>

            {grouped.map(({ restaurant: r, items: rItems }) => (
              <div key={r.id} className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <img src={r.image} alt={r.name} className="w-8 h-8 rounded-xl object-cover" />
                  <span className="text-sm font-extrabold text-foreground">{r.name}</span>
                  <span className="text-xs text-muted-foreground font-medium ml-auto">₱{r.deliveryFee[deliveryMode]} delivery</span>
                </div>
                <AnimatePresence>
                  {rItems.map(({ menuItem, quantity }) => (
                    <motion.div
                      key={menuItem.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className="flex items-center gap-3.5 bg-card rounded-3xl p-3.5 border-2 border-border/50"
                    >
                      <img src={menuItem.image} alt={menuItem.name} className="w-16 h-16 rounded-2xl object-cover" loading="lazy" width={64} height={64} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground truncate">{menuItem.name}</h3>
                        <p className="text-sm font-bold text-foreground">₱{menuItem.price * quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(menuItem.id, quantity - 1)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                          <Minus className="w-3.5 h-3.5 text-foreground" />
                        </motion.button>
                        <motion.span key={quantity} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-sm font-extrabold w-5 text-center text-foreground">{quantity}</motion.span>
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(menuItem.id, quantity + 1)} className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeItem(menuItem.id)} className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center ml-1">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right: Summary */}
          <div className="md:col-span-2 mt-4 md:mt-0 space-y-4 md:sticky md:top-20">
            <div className="bg-card rounded-3xl border-2 border-border/50 p-5 space-y-3 shadow-sm">
              <h3 className="font-display font-bold text-foreground hidden md:block mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="text-foreground font-bold">₱{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  Delivery ({deliveryMode === "express" ? "Express ⚡" : "Saver 🌿"})
                </span>
                <span className={`font-bold ${deliveryMode === "saver" ? "text-saver" : "text-express"}`}>
                  ₱{deliveryFee}
                </span>
              </div>
              <div className="border-t-2 border-border/50 pt-3 flex justify-between">
                <span className="font-extrabold text-foreground">Total</span>
                <span className="font-display font-bold text-xl text-foreground">₱{total.toFixed(0)}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={placing}
              onClick={placeOrder}
              className="hidden md:flex w-full bg-primary text-primary-foreground font-extrabold py-4 rounded-2xl items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-shadow disabled:opacity-60"
            >
              {placing ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : `Place Order · ₱${total.toFixed(0)}`}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Place Order */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t-2 border-border/50 md:hidden">
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={placing}
          onClick={placeOrder}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground font-extrabold py-4 rounded-2xl shadow-lg shadow-primary/25 disabled:opacity-60"
        >
          {placing ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : `Place Order · ₱${total.toFixed(0)}`}
        </motion.button>
      </div>
    </div>
  );
};

export default CartPage;
