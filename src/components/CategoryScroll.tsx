import { categories } from "@/data/restaurants";
import { motion } from "framer-motion";

interface Props {
  active: string;
  onChange: (id: string) => void;
}

const CategoryScroll = ({ active, onChange }: Props) => (
  <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1">
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onChange(cat.id)}
        className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          active === cat.id
            ? "text-primary-foreground"
            : "bg-card text-foreground border border-border hover:border-primary/30"
        }`}
      >
        {active === cat.id && (
          <motion.div
            layoutId="category-pill"
            className="absolute inset-0 bg-primary rounded-full shadow-md"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          />
        )}
        <span className="relative z-10">{cat.emoji}</span>
        <span className="relative z-10">{cat.label}</span>
      </button>
    ))}
  </div>
);

export default CategoryScroll;
