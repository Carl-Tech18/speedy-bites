import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Camera, User, Mail, Phone, Save, Loader2,
  MapPin, Sun, Moon, Package, Clock, LogOut, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type TabId = "profile" | "orders" | "settings";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name || "");
        setPhone(data.phone || "");
        setAddress((data as any).address || "");
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (activeTab === "orders" && user && orders.length === 0) {
      setOrdersLoading(true);
      supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setOrders(data || []);
          setOrdersLoading(false);
        });
    }
  }, [activeTab, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, phone, address } as any)
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <Package className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Sun className="w-4 h-4" /> },
  ];

  const inputClass = "w-full pl-10 pr-4 py-3.5 rounded-2xl bg-muted/60 text-foreground placeholder:text-muted-foreground text-sm border border-border/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Header */}
      <div className="relative h-44 overflow-hidden" style={{
        background: "linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(16, 90%, 42%) 60%, hsl(340, 70%, 45%) 100%)",
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
        }} />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-medium hover:bg-white/25 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { signOut(); navigate("/auth"); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-medium hover:bg-white/25 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </motion.button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-20 relative z-10 pb-12">
        {/* Avatar Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-3xl p-6 shadow-xl shadow-foreground/5 border border-border/50 flex flex-col items-center mb-4"
        >
          <div className="relative -mt-14 mb-3">
            <div className="w-24 h-24 rounded-2xl border-4 border-card shadow-lg overflow-hidden bg-muted flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <h2 className="text-lg font-extrabold text-foreground">{displayName || "Your Name"}</h2>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex bg-muted/60 rounded-2xl p-1 mb-4 border border-border/30"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="profile-tab"
                  className="absolute inset-0 bg-primary rounded-xl shadow-sm"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">{tab.icon}{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-4"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                Personal Information
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} placeholder="Your name" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={user?.email || ""} disabled className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-muted/30 text-muted-foreground text-sm border border-border/30 cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+63 912 345 6789" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-muted/60 text-foreground placeholder:text-muted-foreground text-sm border border-border/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[80px]"
                      placeholder="Enter your full delivery address"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </motion.button>
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Order History</h3>
              </div>

              {ordersLoading ? (
                <div className="bg-card rounded-3xl border border-border/50 p-10 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-card rounded-3xl border border-border/50 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-3">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No orders yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Your order history will appear here</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-md"
                  >
                    Browse Restaurants
                  </button>
                </div>
              ) : (
                orders.map((order, i) => {
                  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-3xl border border-border/50 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{order.restaurant_name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                          order.status === "delivered" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-1 mt-2">
                        {(items as any[]).slice(0, 3).map((item: any, j: number) => (
                          <div key={j} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                            <span className="text-foreground font-medium">₱{item.price * item.quantity}</span>
                          </div>
                        ))}
                        {(items as any[]).length > 3 && (
                          <p className="text-[11px] text-muted-foreground">+{(items as any[]).length - 3} more items</p>
                        )}
                      </div>
                      <div className="border-t border-border/50 mt-2.5 pt-2 flex justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {order.delivery_mode === "express" ? "⚡ Express" : "🌿 Saver"}
                        </span>
                        <span className="text-sm font-extrabold text-foreground">₱{Number(order.total).toFixed(0)}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 space-y-3"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5 text-primary" />
                </div>
                Preferences
              </h3>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    theme === "dark" ? "bg-indigo-500/15 text-indigo-400" : "bg-amber-500/15 text-amber-500"
                  }`}>
                    {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                  theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"
                }`}>
                  <motion.div
                    layout
                    className="w-6 h-6 bg-white rounded-full shadow-sm"
                    style={{ marginLeft: theme === "dark" ? "auto" : 0 }}
                  />
                </div>
              </button>

              {/* Logout */}
              <button
                onClick={() => { signOut(); navigate("/auth"); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-destructive/5 border border-destructive/10 hover:bg-destructive/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-destructive">Log Out</p>
                    <p className="text-[11px] text-muted-foreground">Sign out of your account</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-destructive/50" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
