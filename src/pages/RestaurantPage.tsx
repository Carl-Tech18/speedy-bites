import { useParams, useNavigate } from "react-router-dom";
import { restaurants } from "@/data/restaurants";
import { useCart } from "@/context/CartContext";
import CartBar from "@/components/CartBar";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus } from "lucide-react";

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = restaurants.find((r) => r.id === id);
  const { deliveryMode, items, addItem, removeItem, updateQuantity } = useCart();

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Restaurant not found</p>
      </div>
    );
  }

  const time = restaurant.deliveryTime[deliveryMode];
  const fee = restaurant.deliveryFee[deliveryMode];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header Image */}
      <div className="relative h-52 md:h-64 lg:h-80 overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-card/80 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-8 md:right-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-card">{restaurant.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-card/80">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-badge-new text-badge-new" />
              {restaurant.rating} ({restaurant.reviews})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {restaurant.distance} km
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {time} min
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-4 mt-4">
        {/* Tags & Delivery Info */}
        <div className="flex items-center gap-2 flex-wrap">
          {restaurant.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
              {tag}
            </span>
          ))}
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
            deliveryMode === "saver" ? "bg-saver/10 text-saver" : "bg-express/10 text-express"
          }`}>
            ₱{fee} delivery
          </span>
        </div>

        {/* Commission info */}
        {restaurant.isLocal && (
          <div className="bg-local/10 rounded-xl p-3 text-sm text-local">
            <span className="font-bold">🏠 Local Business</span>
            <span className="ml-1.5 opacity-80">— Only 10-15% commission, supporting local entrepreneurs!</span>
          </div>
        )}

        {/* Menu */}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-3">Menu</h2>
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {restaurant.menu.map((item) => {
              const cartItem = items.find((i) => i.menuItem.id === item.id);
              const qty = cartItem?.quantity || 0;

              return (
                <div
                  key={item.id}
                  className="flex gap-3 bg-card rounded-xl border border-border p-3 animate-fade-in"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                        {item.popular && (
                          <span className="text-[10px] font-bold text-express">🔥 Popular</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-foreground">₱{item.price}</span>
                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(item, restaurant)}
                          className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold text-foreground w-4 text-center">{qty}</span>
                          <button
                            onClick={() => addItem(item, restaurant)}
                            className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pickup Option */}
        <div className="bg-muted rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            🚶 <span className="font-semibold text-foreground">Direct Pickup Available</span> — Save on delivery fees!
          </p>
        </div>
      </div>

      <CartBar />
    </div>
  );
};

export default RestaurantPage;
