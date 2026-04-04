import { Star, Clock, MapPin, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Restaurant } from "@/data/restaurants";
import { useNavigate } from "react-router-dom";

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const { deliveryMode } = useCart();
  const navigate = useNavigate();
  const time = restaurant.deliveryTime[deliveryMode];
  const fee = restaurant.deliveryFee[deliveryMode];

  return (
    <button
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      className="group w-full text-left rounded-xl bg-card overflow-hidden shadow-sm border border-border hover:shadow-lg transition-all duration-300 animate-fade-in"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {restaurant.isLocal && (
            <span className="px-2 py-0.5 bg-local text-primary-foreground text-xs font-bold rounded-full">
              🏠 Local
            </span>
          )}
          {restaurant.isNew && (
            <span className="px-2 py-0.5 bg-badge-new text-foreground text-xs font-bold rounded-full">
              ✨ New
            </span>
          )}
          {time <= 15 && (
            <span className="px-2 py-0.5 bg-express text-primary-foreground text-xs font-bold rounded-full">
              ⚡ {time} min
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors"
        >
          <Heart className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-foreground truncate">{restaurant.name}</h3>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-badge-new text-badge-new" />
            <span className="font-semibold text-foreground">{restaurant.rating}</span>
            <span>({restaurant.reviews})</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {restaurant.distance} km
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1 text-sm">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{time} min</span>
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            deliveryMode === "saver" ? "bg-saver/10 text-saver" : "bg-express/10 text-express"
          }`}>
            ₱{fee} delivery
          </span>
        </div>
      </div>
    </button>
  );
};

export default RestaurantCard;
