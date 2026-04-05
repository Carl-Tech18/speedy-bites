import { Search, MapPin } from "lucide-react";

const SearchBar = () => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5 text-sm">
      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
        <MapPin className="w-3 h-3 text-primary" />
      </div>
      <span className="font-semibold text-foreground">Current Location</span>
      <span className="text-muted-foreground">· Manila, PH</span>
    </div>
    <div className="relative group">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        placeholder="Search food or restaurants..."
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm border border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  </div>
);

export default SearchBar;
