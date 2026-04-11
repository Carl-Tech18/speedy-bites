import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || "";
  const type = (location.state as any)?.type || "signup"; // "signup" | "recovery"

  const handleVerify = async () => {
    if (otp.length !== 6) { toast.error("Please enter the 6-digit code"); return; }
    setLoading(true);
    try {
      if (type === "signup") {
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
        if (error) throw error;
        toast.success("Email verified! Welcome! 🎉");
        navigate("/");
      } else {
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "recovery" });
        if (error) throw error;
        toast.success("Code verified!");
        navigate("/reset-password", { state: { fromOtp: true } });
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      if (type === "signup") {
        await supabase.auth.resend({ type: "signup", email });
      } else {
        await supabase.auth.resetPasswordForEmail(email);
      }
      toast.success("New code sent!");
    } catch {
      toast.error("Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 py-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <div className="text-5xl mb-4">{type === "signup" ? "📧" : "🔐"}</div>
        <h1 className="text-xl font-bold text-foreground mb-2">Enter verification code</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
        </p>

        <div className="mb-6">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>Verify <ChevronRight className="w-4 h-4" /></>
          )}
        </button>

        <button onClick={resend} className="mt-4 text-xs text-primary font-bold hover:underline">
          Didn't receive the code? Resend
        </button>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
