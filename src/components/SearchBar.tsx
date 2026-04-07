import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <div className="space-y-2.5">
    <div className="flex items-center gap-2 text-sm">
      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
        <MapPin className="w-3.5 h-3.5 text-primary" />
      </div>
      <span className="font-bold text-foreground">Current Location</span>
      <span className="text-muted-foreground font-medium">· Manila, PH</span>
    </div>
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search food or restaurants... 🔍"
        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-warm-glow text-foreground placeholder:text-muted-foreground text-sm font-medium border-2 border-transparent focus:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
      />
    </div>
  </div>
);

export default SearchBar;
