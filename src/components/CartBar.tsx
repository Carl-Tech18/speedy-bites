import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";

const CartBar = () => {
  const { totalItems, total, restaurant } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up md:bottom-4 md:right-6 md:left-auto md:w-auto md:p-0">
      <button
        onClick={() => navigate("/cart")}
        className="w-full max-w-md mx-auto md:max-w-none md:mx-0 flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-4 shadow-xl hover:opacity-95 transition-opacity md:gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-badge-new text-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="text-sm font-medium">
            {restaurant?.name}
          </span>
        </div>
        <span className="font-bold text-lg">₱{total.toFixed(0)}</span>
      </button>
    </div>
  );
};

export default CartBar;
