import { Zap, Leaf } from "lucide-react";
import { useCart, type DeliveryMode } from "@/context/CartContext";
import { motion } from "framer-motion";

const DeliveryToggle = () => {
  const { deliveryMode, setDeliveryMode } = useCart();

  return (
    <div className="flex rounded-2xl bg-muted p-1 gap-1">
      <ToggleOption
        mode="saver"
        active={deliveryMode === "saver"}
        onClick={() => setDeliveryMode("saver")}
        icon={<Leaf className="w-3.5 h-3.5" />}
        label="Saver"
      />
      <ToggleOption
        mode="express"
        active={deliveryMode === "express"}
        onClick={() => setDeliveryMode("express")}
        icon={<Zap className="w-3.5 h-3.5" />}
        label="Express"
      />
    </div>
  );
};

const ToggleOption = ({
  mode,
  active,
  onClick,
  icon,
  label,
}: {
  mode: DeliveryMode;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
      active
        ? "text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {active && (
      <motion.div
        layoutId="delivery-toggle"
        className={`absolute inset-0 rounded-xl shadow-sm ${mode === "saver" ? "bg-saver" : "bg-express"}`}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-1.5">{icon}{label}</span>
  </button>
);

export default DeliveryToggle;
