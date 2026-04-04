import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import DeliveryToggle from "@/components/DeliveryToggle";
import { ArrowLeft, Plus, Minus, Trash2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, restaurant, deliveryMode, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart } = useCart();
  const [ordered, setOrdered] = useState(false);

  if (ordered) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-saver/20 flex items-center justify-center animate-fade-in">
          <CheckCircle className="w-10 h-10 text-saver" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Order Placed! 🎉</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          Your order from <span className="font-semibold text-foreground">{restaurant?.name}</span> is being prepared.
          {deliveryMode === "express" ? " Express delivery on the way! ⚡" : " Saver delivery — save more! 🌿"}
        </p>
        <div className="bg-card rounded-xl border border-border p-4 w-full max-w-xs">
          <div className="text-sm text-muted-foreground">Estimated delivery</div>
          <div className="text-3xl font-extrabold text-foreground mt-1">
            {restaurant?.deliveryTime[deliveryMode]} min
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "20%" }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Preparing</span>
            <span>On the way</span>
            <span>Delivered</span>
          </div>
        </div>
        <button
          onClick={() => { clearCart(); setOrdered(false); navigate("/"); }}
          className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">🛒</div>
        <h1 className="text-xl font-bold text-foreground">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">Browse restaurants and add some food!</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
        >
          Browse Food
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-bold text-foreground">Your Cart</h1>
          <p className="text-xs text-muted-foreground">{restaurant?.name}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4 mt-4">
        {/* Delivery Toggle */}
        <div className="flex items-center justify-between bg-card rounded-xl p-3 border border-border">
          <span className="text-sm font-medium text-foreground">Delivery mode</span>
          <DeliveryToggle />
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map(({ menuItem, quantity }) => (
            <div key={menuItem.id} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
              <img src={menuItem.image} alt={menuItem.name} className="w-14 h-14 rounded-lg object-cover" loading="lazy" width={56} height={56} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{menuItem.name}</h3>
                <p className="text-sm font-bold text-foreground">₱{menuItem.price * quantity}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQuantity(menuItem.id, quantity - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                  <Minus className="w-3.5 h-3.5 text-foreground" />
                </button>
                <span className="text-sm font-bold w-4 text-center text-foreground">{quantity}</span>
                <button onClick={() => updateQuantity(menuItem.id, quantity + 1)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => removeItem(menuItem.id)} className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center ml-1">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
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
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-extrabold text-lg text-foreground">₱{total.toFixed(0)}</span>
          </div>
        </div>

        {/* Delivery ETA */}
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-sm text-secondary-foreground">
            Estimated delivery: <span className="font-bold">{restaurant?.deliveryTime[deliveryMode]} minutes</span>
          </p>
        </div>
      </div>

      {/* Place Order */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
        <button
          onClick={() => {
            setOrdered(true);
            toast.success("Order placed successfully!");
          }}
          className="w-full max-w-md mx-auto block bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-center shadow-lg hover:opacity-95 transition-opacity"
        >
          Place Order · ₱{total.toFixed(0)}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
