import { categories } from "@/data/restaurants";

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
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          active === cat.id
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-card text-foreground border border-border hover:border-primary/30"
        }`}
      >
        <span>{cat.emoji}</span>
        {cat.label}
      </button>
    ))}
  </div>
);

export default CategoryScroll;
