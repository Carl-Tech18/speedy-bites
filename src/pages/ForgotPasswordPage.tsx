import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Mail, ChevronRight } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset code sent! Check your email.");
      navigate("/verify-otp", { state: { email, type: "recovery" } });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 py-4">
        <button onClick={() => navigate("/auth")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        {sent ? (
          <div className="text-center space-y-3 animate-fade-in">
            <div className="text-5xl">📧</div>
            <h1 className="text-xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">We sent a reset link to <span className="font-semibold text-foreground">{email}</span></p>
            <button onClick={() => navigate("/auth")} className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-sm text-muted-foreground mb-6 text-center">Enter your email and we'll send you a reset link</p>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg disabled:opacity-60"
              >
                {loading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <>Send Reset Link <ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
