import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { restaurants as staticRestaurants } from "@/data/restaurants";
import { useOwnerRestaurants } from "@/hooks/useOwnerRestaurants";
import { useCart } from "@/context/CartContext";
import CartBar from "@/components/CartBar";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ownerRestaurants } = useOwnerRestaurants();
  const allRestaurants = useMemo(() => [...staticRestaurants, ...ownerRestaurants], [ownerRestaurants]);
  const restaurant = allRestaurants.find((r) => r.id === id);
  const { deliveryMode, items, addItem, removeItem, updateQuantity } = useCart();

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-medium">Restaurant not found 😕</p>
      </div>
    );
  }

  const time = restaurant.deliveryTime[deliveryMode];
  const fee = restaurant.deliveryFee[deliveryMode];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header Image */}
      <div className="relative h-56 md:h-72 lg:h-80 overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-md flex items-center justify-center hover:bg-card transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-md flex items-center justify-center hover:bg-card transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4 text-foreground" />
          </motion.button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-8 md:right-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-card">{restaurant.name}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-card/80">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-badge-new text-badge-new" />
              <span className="font-bold text-card">{restaurant.rating}</span> ({restaurant.reviews})
            </span>
            <span className="text-card/40">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {restaurant.distance} km
            </span>
            <span className="text-card/40">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {time} min
            </span>
          </div>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-4 mt-4">
        {/* Tags & Delivery Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 flex-wrap"
        >
          {restaurant.tags.map((tag) => (
            <span key={tag} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-2xl">
              {tag}
            </span>
          ))}
          <span className={`px-3 py-1.5 text-xs font-extrabold rounded-2xl ${
            deliveryMode === "saver" ? "bg-saver/10 text-saver" : "bg-express/10 text-express"
          }`}>
            ₱{fee} delivery
          </span>
        </motion.div>

        {/* Commission info */}
        {restaurant.isLocal && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-local/10 border-2 border-local/20 rounded-3xl p-4 text-sm text-local flex items-start gap-3"
          >
            <span className="text-xl">🏠</span>
            <div>
              <span className="font-extrabold">Local Business</span>
              <span className="ml-1 opacity-80 font-medium">— Only 10-15% commission, supporting local entrepreneurs!</span>
            </div>
          </motion.div>
        )}

        {/* Menu */}
        <div>
          <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">Menu 🍽️</h2>
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {restaurant.menu.map((item, index) => {
              const cartItem = items.find((i) => i.menuItem.id === item.id);
              const qty = cartItem?.quantity || 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex gap-3.5 bg-card rounded-3xl border-2 border-border/60 p-3.5 hover:border-primary/20 hover:shadow-md transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-foreground text-sm">{item.name}</h3>
                        {item.popular && (
                          <span className="text-[10px] font-extrabold text-express">🔥 Popular</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-medium">{item.description}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="font-extrabold text-foreground">₱{item.price}</span>
                      {qty === 0 ? (
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => addItem(item, restaurant)}
                          className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-shadow"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="w-8 h-8 rounded-xl bg-muted text-foreground flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.span
                            key={qty}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="text-sm font-extrabold text-foreground w-4 text-center"
                          >
                            {qty}
                          </motion.span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => addItem(item, restaurant)}
                            className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pickup Option */}
        <div className="bg-secondary rounded-3xl p-4 text-center">
          <p className="text-sm text-secondary-foreground font-medium">
            🚶 <span className="font-extrabold text-foreground">Direct Pickup Available</span> — Save on delivery fees!
          </p>
        </div>
      </div>

      <CartBar />
    </div>
  );
};

export default RestaurantPage;
