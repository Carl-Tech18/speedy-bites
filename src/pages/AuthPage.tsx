import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ChevronRight, Utensils } from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back! 🎉");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to verify.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Hero Side */}
      <div
        className="auth-hero relative flex-shrink-0 flex flex-col items-center justify-end pb-10 pt-16 px-6 md:w-1/2 lg:w-3/5 md:justify-center overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsl(25, 100%, 52%) 0%, hsl(16, 95%, 50%) 40%, hsl(5, 100%, 42%) 100%)",
          minHeight: "40vh",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        <style>{`@media (min-width: 768px) { .auth-hero { min-height: 100vh !important; border-radius: 0 !important; } }`}</style>
        <div
          className="absolute inset-0 opacity-[0.08] md:opacity-[0.12]"
          style={{
            backgroundImage: `url(${heroFood})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 text-center md:text-left md:max-w-md lg:max-w-lg md:px-8 lg:px-16"
        >
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Utensils className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight" style={{ color: "white" }}>
            Quick<span style={{ color: "hsl(45, 100%, 72%)" }}>BITE</span>
          </h1>
          <p className="mt-2 text-sm md:text-base lg:text-lg font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
            Fast delivery • Low fees • Local love
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <span className="text-xs md:text-sm font-semibold" style={{ color: "white" }}>❤️ Support Local Businesses</span>
          </div>
          <p className="hidden md:block mt-6 text-sm lg:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            Order from nearby local restaurants with the lowest fees. Support small businesses in your community.
          </p>
        </motion.div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-start md:items-center justify-center px-6 py-8 md:py-12 md:w-1/2 lg:w-2/5">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm md:max-w-md"
        >
          <h2 className="hidden md:block text-2xl font-bold text-foreground mb-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="hidden md:block text-sm text-muted-foreground mb-6">
            {isLogin ? "Log in to start ordering" : "Sign up to explore local food near you"}
          </p>

          {/* Tab Switcher */}
          <div className="flex rounded-full bg-muted p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`relative flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                isLogin ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {isLogin && (
                <motion.div
                  layoutId="auth-tab"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                />
              )}
              <span className="relative z-10">Log In</span>
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`relative flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                !isLogin ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {!isLogin && (
                <motion.div
                  layoutId="auth-tab"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                />
              )}
              <span className="relative z-10">Sign Up</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden"
                >
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm border border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm border border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm border border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs text-primary font-medium hover:underline">Forgot password?</button>
              </div>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>{isLogin ? "Log In" : "Create Account"}<ChevronRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
