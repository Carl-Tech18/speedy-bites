import { Search, MapPin } from "lucide-react";

const SearchBar = () => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5 text-sm">
      <MapPin className="w-4 h-4 text-primary" />
      <span className="font-semibold text-foreground">Current Location</span>
      <span className="text-muted-foreground">· Manila, PH</span>
    </div>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search food or restaurants..."
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  </div>
);

export default SearchBar;
