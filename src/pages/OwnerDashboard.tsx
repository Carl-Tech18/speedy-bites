import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, ImagePlus, Store,
  DollarSign, FileText, GripVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface OwnerRestaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  image_url: string | null;
  is_active: boolean;
  address: string;
  phone: string;
}

interface OwnerMenuItem {
  id?: string;
  restaurant_id?: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
}

const cuisineOptions = ["rice", "noodles", "burger", "sushi", "healthy", "dessert"];

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const imgInputRef = useRef<HTMLInputElement>(null);
  const menuImgInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [restaurant, setRestaurant] = useState<OwnerRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<OwnerMenuItem[]>([]);
  const [editingMenuIdx, setEditingMenuIdx] = useState<number | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", cuisine: "rice", address: "", phone: "",
    image_url: null as string | null, is_active: true,
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    // Check if user has owner role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const ownerFound = roles?.some((r: any) => r.role === "owner");
    setIsOwner(!!ownerFound);

    if (ownerFound) {
      const { data: restaurants } = await supabase
        .from("owner_restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1);

      if (restaurants && restaurants.length > 0) {
        const r = restaurants[0] as any;
        setRestaurant(r);
        setForm({
          name: r.name || "", description: r.description || "", cuisine: r.cuisine || "rice",
          address: r.address || "", phone: r.phone || "", image_url: r.image_url,
          is_active: r.is_active,
        });
        const { data: items } = await supabase
          .from("owner_menu_items")
          .select("*")
          .eq("restaurant_id", r.id)
          .order("sort_order");
        setMenuItems((items as any[]) || []);
      } else {
        setRestaurant(null);
      }
    }
    setLoading(false);
  };

  const becomeOwner = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "owner" } as any);
      if (error) throw error;
      toast.success("You're now a restaurant owner! 🎉");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to register as owner");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: "restaurant" | "menu") => {
    if (!user) return null;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image"); return null; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return null; }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${type}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("restaurant-images").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); return null; }
    const { data } = supabase.storage.from("restaurant-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveRestaurant = async () => {
    if (!user || !form.name.trim()) { toast.error("Restaurant name is required"); return; }
    setSaving(true);
    try {
      if (restaurant) {
        const { error } = await supabase.from("owner_restaurants")
          .update({
            name: form.name, description: form.description, cuisine: form.cuisine,
            address: form.address, phone: form.phone, image_url: form.image_url,
            is_active: form.is_active,
          } as any)
          .eq("id", restaurant.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("owner_restaurants")
          .insert({
            owner_id: user.id, name: form.name, description: form.description,
            cuisine: form.cuisine, address: form.address, phone: form.phone,
            image_url: form.image_url, is_active: form.is_active,
          } as any)
          .select()
          .single();
        if (error) throw error;
        setRestaurant(data as any);
      }
      toast.success("Restaurant saved! ✨");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = () => {
    setMenuItems((prev) => [...prev, {
      name: "", description: "", price: 0, image_url: null,
      is_available: true, sort_order: prev.length,
    }]);
    setEditingMenuIdx(menuItems.length);
  };

  const saveMenuItem = async (idx: number) => {
    if (!restaurant) return;
    const item = menuItems[idx];
    if (!item.name.trim()) { toast.error("Item name is required"); return; }
    setSaving(true);
    try {
      if (item.id) {
        const { error } = await supabase.from("owner_menu_items")
          .update({
            name: item.name, description: item.description, price: item.price,
            image_url: item.image_url, is_available: item.is_available, sort_order: item.sort_order,
          } as any)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("owner_menu_items")
          .insert({
            restaurant_id: restaurant.id, name: item.name, description: item.description,
            price: item.price, image_url: item.image_url, is_available: item.is_available,
            sort_order: item.sort_order,
          } as any);
        if (error) throw error;
      }
      toast.success("Menu item saved!");
      setEditingMenuIdx(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const deleteMenuItem = async (idx: number) => {
    const item = menuItems[idx];
    if (!item.id) {
      setMenuItems((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    try {
      const { error } = await supabase.from("owner_menu_items").delete().eq("id", item.id);
      if (error) throw error;
      toast.success("Item deleted");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-2xl bg-warm-glow text-foreground placeholder:text-muted-foreground text-sm font-medium border-2 border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative h-36 overflow-hidden" style={{
        background: "linear-gradient(145deg, hsl(155, 55%, 42%) 0%, hsl(155, 50%, 35%) 60%, hsl(180, 40%, 30%) 100%)",
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)",
        }} />
        <div className="absolute top-4 left-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/profile")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md text-white text-sm font-bold hover:bg-white/25 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </div>
        <div className="absolute bottom-4 left-4">
          <h1 className="text-2xl font-display font-bold text-white">🍽️ My Restaurant</h1>
          <p className="text-sm text-white/70 font-medium">Manage your menu & orders</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10 pb-12 space-y-4">
        {!isOwner ? (
          /* Not an owner yet */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl p-8 shadow-lg border-2 border-border/50 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-accent/10 mx-auto flex items-center justify-center mb-4">
              <Store className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Become a Restaurant Owner</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Register as a restaurant owner to list your business on QuickBITE and start receiving orders!
            </p>
            <motion.button
              onClick={becomeOwner}
              disabled={saving}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-extrabold text-sm shadow-lg shadow-accent/20 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register as Owner 🚀"}
            </motion.button>
          </motion.div>
        ) : !restaurant ? (
          /* Owner but no restaurant yet - show creation form */
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-5 shadow-sm border-2 border-border/50 space-y-4"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Store className="w-4 h-4 text-accent" />
                </div>
                Create Your Restaurant
              </h3>
              <p className="text-xs text-muted-foreground">You're registered as an owner! Now set up your restaurant details below.</p>

              {/* Restaurant image */}
              <div
                onClick={() => imgInputRef.current?.click()}
                className="relative w-full h-40 rounded-2xl bg-warm-glow border-2 border-dashed border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-colors group"
              >
                {form.image_url ? (
                  <img src={form.image_url} alt="Restaurant" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ImagePlus className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Upload restaurant photo</span>
                  </div>
                )}
                {uploadingImg && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImg(true);
                  const url = await handleImageUpload(file, "restaurant");
                  if (url) setForm((prev) => ({ ...prev, image_url: url }));
                  setUploadingImg(false);
                }}
              />

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Restaurant Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="e.g. Lola's Kitchen" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={`${inputClass} resize-none min-h-[80px]`} placeholder="Tell customers about your restaurant..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Cuisine</label>
                    <select value={form.cuisine} onChange={(e) => setForm((p) => ({ ...p, cuisine: e.target.value }))} className={inputClass}>
                      {cuisineOptions.map((c) => (<option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="+63..." />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Address</label>
                  <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className={inputClass} placeholder="Street, City..." />
                </div>
              </div>

              <motion.button
                onClick={saveRestaurant}
                disabled={saving}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-accent text-accent-foreground font-extrabold text-sm shadow-lg shadow-accent/20 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Create Restaurant</>}
              </motion.button>
            </motion.div>
          </>
        ) : (
          <>
            {/* Restaurant Details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-5 shadow-sm border-2 border-border/50 space-y-4"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Store className="w-4 h-4 text-accent" />
                </div>
                Restaurant Details
              </h3>

              {/* Image */}
              <div
                onClick={() => imgInputRef.current?.click()}
                className="relative w-full h-40 rounded-2xl bg-warm-glow border-2 border-dashed border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-colors group"
              >
                {form.image_url ? (
                  <img src={form.image_url} alt="Restaurant" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ImagePlus className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Upload restaurant photo</span>
                  </div>
                )}
                {uploadingImg && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImg(true);
                  const url = await handleImageUpload(file, "restaurant");
                  if (url) setForm((prev) => ({ ...prev, image_url: url }));
                  setUploadingImg(false);
                }}
              />

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Restaurant Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Lola's Kitchen"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className={`${inputClass} resize-none min-h-[80px]`}
                    placeholder="Tell customers about your restaurant..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Cuisine</label>
                    <select
                      value={form.cuisine}
                      onChange={(e) => setForm((p) => ({ ...p, cuisine: e.target.value }))}
                      className={inputClass}
                    >
                      {cuisineOptions.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className={inputClass}
                      placeholder="+63..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    className={inputClass}
                    placeholder="Street, City..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-muted-foreground">Active (visible to customers)</label>
                  <button
                    onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${form.is_active ? "bg-accent" : "bg-muted-foreground/30"}`}
                  >
                    <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" style={{ marginLeft: form.is_active ? "auto" : 0 }} />
                  </button>
                </div>
              </div>

              <motion.button
                onClick={saveRestaurant}
                disabled={saving}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-accent text-accent-foreground font-extrabold text-sm shadow-lg shadow-accent/20 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Restaurant</>}
              </motion.button>
            </motion.div>

            {/* Menu Items */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-3xl p-5 shadow-sm border-2 border-border/50 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  Menu Items ({menuItems.length})
                </h3>
                <motion.button
                  onClick={addMenuItem}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </motion.button>
              </div>

              <AnimatePresence>
                {menuItems.map((item, idx) => (
                  <motion.div
                    key={item.id || `new-${idx}`}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-warm-glow rounded-2xl p-4 border border-border/30 space-y-3"
                  >
                    {editingMenuIdx === idx ? (
                      <>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setMenuItems(updated);
                          }}
                          className={inputClass}
                          placeholder="Item name"
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            setMenuItems(updated);
                          }}
                          className={inputClass}
                          placeholder="Description"
                        />
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const updated = [...menuItems];
                              updated[idx] = { ...updated[idx], price: parseFloat(e.target.value) || 0 };
                              setMenuItems(updated);
                            }}
                            className={`${inputClass} pl-11`}
                            placeholder="Price"
                            min={0}
                          />
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => saveMenuItem(idx)}
                            disabled={saving}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs"
                          >
                            {saving ? "Saving..." : "Save"}
                          </motion.button>
                          <motion.button
                            onClick={() => setEditingMenuIdx(null)}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground font-bold text-xs"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{item.name || "Unnamed item"}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                        <span className="text-sm font-extrabold text-foreground">₱{item.price}</span>
                        <button onClick={() => setEditingMenuIdx(idx)} className="text-xs text-primary font-bold hover:underline">Edit</button>
                        <button onClick={() => deleteMenuItem(idx)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {menuItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No menu items yet</p>
                  <p className="text-xs">Add your first dish to get started!</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
