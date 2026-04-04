import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ChevronRight } from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";

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
      {/* Orange Gradient Hero - full height on desktop, top section on mobile */}
      <div
        className="relative flex-shrink-0 flex flex-col items-center justify-end pb-8 pt-16 px-6 md:w-1/2 lg:w-3/5 md:justify-center md:rounded-none"
        style={{
          background: "linear-gradient(160deg, hsl(25, 100%, 52%) 0%, hsl(16, 95%, 50%) 40%, hsl(5, 100%, 45%) 100%)",
          minHeight: "44vh",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        <style>{`@media (min-width: 768px) { .auth-hero { min-height: 100vh !important; border-radius: 0 !important; } }`}</style>
        <div
          className="absolute inset-0 opacity-10 md:opacity-15"
          style={{
            backgroundImage: `url(${heroFood})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "inherit",
          }}
        />
        <div className="relative z-10 text-center md:text-left md:max-w-md lg:max-w-lg md:px-8 lg:px-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight" style={{ color: "white" }}>
            Quick<span style={{ color: "hsl(45, 100%, 70%)" }}>BITE</span>
          </h1>
          <p className="mt-2 text-sm md:text-base lg:text-lg font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
            Fast delivery • Low fees • Local love
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
            <span className="text-xs md:text-sm font-semibold" style={{ color: "white" }}>❤️ Support Local Businesses</span>
          </div>
          {/* Desktop-only tagline */}
          <p className="hidden md:block mt-6 text-sm lg:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            Order from nearby local restaurants with the lowest fees. Support small businesses in your community.
          </p>
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 flex items-start md:items-center justify-center px-6 py-8 md:py-12 md:w-1/2 lg:w-2/5">
        <div className="w-full max-w-sm md:max-w-md">
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
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                !isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative animate-fade-in">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary/40" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary/40" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary/40" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs text-primary font-medium hover:underline">Forgot password?</button>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:opacity-95 transition-opacity disabled:opacity-60">
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>{isLogin ? "Log In" : "Create Account"}<ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
