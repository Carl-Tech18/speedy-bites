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
  const { items, restaurant, deliveryMode, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [ordered, setOrdered] = useState(false);
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    if (!user || !restaurant) return;
    setPlacing(true);
    try {
      const orderItems = items.map(({ menuItem, quantity }) => ({
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      }));
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        restaurant_name: restaurant.name,
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        delivery_mode: deliveryMode,
        status: "delivered",
      } as any);
      if (error) throw error;
      setOrdered(true);
      toast.success("Order placed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (ordered) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-20 h-20 rounded-full bg-saver/20 flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-saver" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Order Placed! 🎉</h1>
          <p className="text-muted-foreground text-sm max-w-xs md:max-w-md mt-2">
            Your order from <span className="font-semibold text-foreground">{restaurant?.name}</span> is being prepared.
            {deliveryMode === "express" ? " Express delivery on the way! ⚡" : " Saver delivery — save more! 🌿"}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-4 md:p-6 w-full max-w-xs md:max-w-sm shadow-lg shadow-foreground/5"
        >
          <div className="text-sm text-muted-foreground">Estimated delivery</div>
          <div className="text-3xl font-extrabold text-foreground mt-1">
            {restaurant?.deliveryTime[deliveryMode]} min
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "20%" }}
              transition={{ delay: 0.6, duration: 1 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Preparing</span>
            <span>On the way</span>
            <span>Delivered</span>
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { clearCart(); setOrdered(false); navigate("/"); }}
          className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20"
        >
          Back to Home
        </motion.button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
        </motion.div>
        <h1 className="text-xl font-bold text-foreground">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">Browse restaurants and add some food!</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20"
        >
          Browse Food
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        <div>
          <h1 className="font-bold text-foreground">Your Cart</h1>
          <p className="text-xs text-muted-foreground">{restaurant?.name}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-4">
        <div className="md:grid md:grid-cols-5 md:gap-6">
          {/* Left: Items */}
          <div className="md:col-span-3 space-y-4">
            {/* Delivery Toggle */}
            <div className="flex items-center justify-between bg-card rounded-2xl p-3 border border-border">
              <span className="text-sm font-medium text-foreground">Delivery mode</span>
              <DeliveryToggle />
            </div>

            {/* Items */}
            <div className="space-y-2">
              <AnimatePresence>
                {items.map(({ menuItem, quantity }) => (
                  <motion.div
                    key={menuItem.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border"
                  >
                    <img src={menuItem.image} alt={menuItem.name} className="w-14 h-14 rounded-xl object-cover" loading="lazy" width={56} height={56} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{menuItem.name}</h3>
                      <p className="text-sm font-bold text-foreground">₱{menuItem.price * quantity}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(menuItem.id, quantity - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                        <Minus className="w-3.5 h-3.5 text-foreground" />
                      </motion.button>
                      <motion.span key={quantity} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-sm font-bold w-4 text-center text-foreground">{quantity}</motion.span>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(menuItem.id, quantity + 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeItem(menuItem.id)} className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center ml-1">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="md:col-span-2 mt-4 md:mt-0 space-y-4 md:sticky md:top-20">
            <div className="bg-card rounded-2xl border border-border p-4 space-y-2.5 shadow-sm">
              <h3 className="font-bold text-foreground hidden md:block mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">₱{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Delivery ({deliveryMode === "express" ? "Express ⚡" : "Saver 🌿"})
                </span>
                <span className={`font-medium ${deliveryMode === "saver" ? "text-saver" : "text-express"}`}>
                  ₱{deliveryFee}
                </span>
              </div>
              <div className="border-t border-border pt-2.5 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-extrabold text-lg text-foreground">₱{total.toFixed(0)}</span>
              </div>
            </div>

            <div className="bg-secondary rounded-2xl p-3 text-center">
              <p className="text-sm text-secondary-foreground">
                Estimated delivery: <span className="font-bold">{restaurant?.deliveryTime[deliveryMode]} minutes</span>
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={placing}
              onClick={placeOrder}
              className="hidden md:flex w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow disabled:opacity-60"
            >
              {placing ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : `Place Order · ₱${total.toFixed(0)}`}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Place Order */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border md:hidden">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setOrdered(true); toast.success("Order placed successfully!"); }}
          className="w-full max-w-md mx-auto block bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-center shadow-lg shadow-primary/20"
        >
          Place Order · ₱{total.toFixed(0)}
        </motion.button>
      </div>
    </div>
  );
};

export default CartPage;
