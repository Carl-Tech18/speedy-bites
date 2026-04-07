import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
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
  const [googleLoading, setGoogleLoading] = useState(false);
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
        if (error) {
          if (error.message?.includes("already registered")) {
            const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
            if (loginError) throw loginError;
            toast.success("Welcome back! 🎉");
            navigate("/");
            return;
          }
          throw error;
        }
        toast.success("Account created! Welcome! 🎉");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      toast.success("Welcome! 🎉");
      navigate("/");
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Hero Side */}
      <div
        className="auth-hero relative flex-shrink-0 flex flex-col items-center justify-end pb-10 pt-16 px-6 md:w-1/2 lg:w-3/5 md:justify-center overflow-hidden"
        style={{
          background: "linear-gradient(145deg, hsl(30, 100%, 65%) 0%, hsl(18, 95%, 52%) 40%, hsl(5, 85%, 45%) 100%)",
          minHeight: "38vh",
          borderRadius: "0 0 2.5rem 2.5rem",
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
        {/* Fun decorative shapes */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-15" style={{ background: "hsl(45, 100%, 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10" style={{ background: "hsl(45, 100%, 70%)" }} />
        <div className="absolute top-1/3 right-10 w-20 h-20 rounded-3xl rotate-12 opacity-10" style={{ background: "white" }} />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 text-center md:text-left md:max-w-md lg:max-w-lg md:px-8 lg:px-16"
        >
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "rgba(255,255,255,0.25)" }}>
              <Utensils className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight" style={{ color: "white" }}>
            Quick<span style={{ color: "hsl(45, 100%, 75%)" }}>BITE</span>
          </h1>
          <p className="mt-2 text-sm md:text-base lg:text-lg font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
            Yummy food, delivered fast 🍕
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
            <span className="text-lg">❤️</span>
            <span className="text-xs md:text-sm font-bold" style={{ color: "white" }}>Support Local Businesses</span>
          </div>
          <p className="hidden md:block mt-6 text-sm lg:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
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
          <h2 className="hidden md:block text-2xl font-display font-bold text-foreground mb-1">
            {isLogin ? "Welcome back! 👋" : "Join the feast! 🎉"}
          </h2>
          <p className="hidden md:block text-sm text-muted-foreground mb-6">
            {isLogin ? "Log in to start ordering" : "Sign up to explore local food near you"}
          </p>

          {/* Google Sign In */}
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-card border-2 border-border text-foreground font-bold text-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all mb-4 disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-muted p-1.5 mb-5">
            <button
              onClick={() => setIsLogin(true)}
              className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                isLogin ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {isLogin && (
                <motion.div
                  layoutId="auth-tab"
                  className="absolute inset-0 bg-primary rounded-xl shadow-md"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                />
              )}
              <span className="relative z-10">Log In</span>
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                !isLogin ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {!isLogin && (
                <motion.div
                  layoutId="auth-tab"
                  className="absolute inset-0 bg-primary rounded-xl shadow-md"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                />
              )}
              <span className="relative z-10">Sign Up</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-warm-glow text-foreground placeholder:text-muted-foreground text-sm font-medium border-2 border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all" required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-warm-glow text-foreground placeholder:text-muted-foreground text-sm font-medium border-2 border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-warm-glow text-foreground placeholder:text-muted-foreground text-sm font-medium border-2 border-transparent focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs text-primary font-bold hover:underline">Forgot password?</button>
              </div>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all disabled:opacity-60"
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
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
