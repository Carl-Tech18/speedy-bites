import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Upload, ShieldCheck, Clock, XCircle, Loader2, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const IdVerificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadVerification();
  }, [user]);

  const loadVerification = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("id_verifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data && data.length > 0) setVerification(data[0]);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/id-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("id-documents")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      // Get signed URL (private bucket)
      const { data: urlData } = await supabase.storage
        .from("id-documents")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);
      const signedUrl = urlData?.signedUrl || filePath;

      const { error: insertError } = await supabase.from("id_verifications").insert({
        user_id: user.id,
        id_image_url: signedUrl,
        status: "pending",
      } as any);
      if (insertError) throw insertError;

      toast.success("ID uploaded successfully! Under review 🔍");
      setPreviewUrl(URL.createObjectURL(file));
      await loadVerification();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const statusConfig = {
    pending: { icon: Clock, color: "text-badge-new", bg: "bg-badge-new/10", label: "Under Review", emoji: "⏳" },
    verified: { icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10", label: "Verified", emoji: "✅" },
    rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Rejected", emoji: "❌" },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const status = verification?.status as keyof typeof statusConfig;
  const config = status ? statusConfig[status] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative h-36 overflow-hidden" style={{
        background: "linear-gradient(145deg, hsl(220, 70%, 50%) 0%, hsl(250, 60%, 45%) 100%)",
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)",
        }} />
        <div className="absolute top-4 left-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/profile")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md text-white text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </div>
        <div className="absolute bottom-4 left-4">
          <h1 className="text-2xl font-display font-bold text-white">🪪 ID Verification</h1>
          <p className="text-sm text-white/70 font-medium">Verify your identity</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-10 pb-12 space-y-4">
        {/* Current Status */}
        {verification && config && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${config.bg} rounded-3xl p-5 border-2 border-border/30 flex items-center gap-4`}
          >
            <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center text-2xl`}>
              {config.emoji}
            </div>
            <div>
              <p className={`text-sm font-extrabold ${config.color}`}>{config.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {status === "pending" && "Your ID is being reviewed. This usually takes 1-2 business days."}
                {status === "verified" && "Your identity has been verified! ✨"}
                {status === "rejected" && `${verification.reviewer_notes || "Please upload a clearer photo of your ID."}`}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Submitted {new Date(verification.created_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Upload Section */}
        {(!verification || status === "rejected") && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl p-6 shadow-sm border-2 border-border/50 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-primary/10 mx-auto flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-foreground">Upload Your Government ID</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Take a clear photo of your valid government-issued ID (driver's license, passport, or national ID). This helps keep our community safe.
              </p>
            </div>

            {previewUrl && (
              <div className="w-full h-48 rounded-2xl overflow-hidden border-2 border-border">
                <img src={previewUrl} alt="ID Preview" className="w-full h-full object-contain bg-muted" />
              </div>
            )}

            <motion.button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm shadow-lg shadow-primary/25 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Upload className="w-4 h-4" /> {status === "rejected" ? "Upload New ID" : "Upload ID Photo"}</>
              )}
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleUpload}
            />

            <div className="flex flex-col gap-2 text-left">
              <p className="text-[11px] text-muted-foreground font-bold">Requirements:</p>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>📷 Clear, well-lit photo — no blur or glare</li>
                <li>🪪 Full ID visible — all corners shown</li>
                <li>🔒 Your data is encrypted and stored securely</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Already verified */}
        {status === "verified" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl p-6 shadow-sm border-2 border-accent/20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-accent/10 mx-auto flex items-center justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground">You're Verified!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your identity has been confirmed. You can now access all features of QuickBITE.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IdVerificationPage;
