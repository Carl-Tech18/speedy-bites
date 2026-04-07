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
        className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-colors ${
          active === cat.id
            ? "text-primary-foreground"
            : "bg-card text-foreground border-2 border-border/60 hover:border-primary/30"
        }`}
      >
        {active === cat.id && (
          <motion.div
            layoutId="category-pill"
            className="absolute inset-0 bg-primary rounded-2xl shadow-md shadow-primary/20"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          />
        )}
        <span className="relative z-10 text-base">{cat.emoji}</span>
        <span className="relative z-10">{cat.label}</span>
      </button>
    ))}
  </div>
);

export default CategoryScroll;
