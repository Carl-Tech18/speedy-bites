import { Zap, Leaf } from "lucide-react";
import { useCart, type DeliveryMode } from "@/context/CartContext";

const DeliveryToggle = () => {
  const { deliveryMode, setDeliveryMode } = useCart();

  return (
    <div className="flex rounded-full bg-muted p-1 gap-1">
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
    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
      active
        ? mode === "saver"
          ? "bg-saver text-accent-foreground shadow-sm"
          : "bg-express text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default DeliveryToggle;
