import { forwardRef } from "react";
import { Star, Clock, MapPin, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Restaurant } from "@/data/restaurants";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RestaurantCard = forwardRef<HTMLButtonElement, { restaurant: Restaurant }>(
  ({ restaurant }, ref) => {
    const { deliveryMode } = useCart();
    const navigate = useNavigate();
    const time = restaurant.deliveryTime[deliveryMode];
    const fee = restaurant.deliveryFee[deliveryMode];

    return (
      <motion.button
        ref={ref}
        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        className="group w-full text-left rounded-3xl bg-card overflow-hidden shadow-sm border-2 border-border/60 hover:shadow-xl hover:border-primary/25 hover:-translate-y-1 transition-all duration-300"
        whileTap={{ scale: 0.97 }}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
            {restaurant.isLocal && (
              <span className="px-2.5 py-1 bg-local text-primary-foreground text-[10px] font-extrabold rounded-full shadow-sm">
                🏠 Local
              </span>
            )}
            {restaurant.isNew && (
              <span className="px-2.5 py-1 bg-badge-new text-foreground text-[10px] font-extrabold rounded-full shadow-sm">
                ✨ New
              </span>
            )}
            {time <= 15 && (
              <span className="px-2.5 py-1 bg-express text-primary-foreground text-[10px] font-extrabold rounded-full shadow-sm">
                ⚡ {time} min
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-card/80 backdrop-blur-md flex items-center justify-center hover:bg-card hover:scale-110 transition-all shadow-sm"
          >
            <Heart className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-3.5 space-y-2">
          <h3 className="font-extrabold text-foreground text-sm truncate">{restaurant.name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-badge-new text-badge-new" />
              <span className="font-bold text-foreground">{restaurant.rating}</span>
              <span>({restaurant.reviews})</span>
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {restaurant.distance} km
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-bold text-foreground">{time} min</span>
            </span>
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
              deliveryMode === "saver" ? "bg-saver/10 text-saver" : "bg-express/10 text-express"
            }`}>
              ₱{fee}
            </span>
          </div>
        </div>
      </motion.button>
    );
  }
);

RestaurantCard.displayName = "RestaurantCard";

export default RestaurantCard;
