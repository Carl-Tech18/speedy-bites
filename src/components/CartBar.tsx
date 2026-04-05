import { forwardRef } from "react";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CartBar = forwardRef<HTMLDivElement>((_, ref) => {
  const { totalItems, total, restaurant } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          ref={ref}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:bottom-4 md:right-6 md:left-auto md:w-auto md:p-0"
        >
          <button
            onClick={() => navigate("/cart")}
            className="w-full max-w-md mx-auto md:max-w-none md:mx-0 flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-4 shadow-2xl hover:shadow-primary/30 hover:opacity-95 transition-all md:gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-badge-new text-foreground text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              </div>
              <span className="text-sm font-medium">
                {restaurant?.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">₱{total.toFixed(0)}</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CartBar.displayName = "CartBar";

export default CartBar;
