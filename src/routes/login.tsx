import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

async function getSupabase() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

async function getLovable() {
  const { lovable } = await import("@/integrations/lovable/index");
  return lovable;
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "TakeCare.ai — Sign In" },
      { name: "description", content: "Sign in to TakeCare.ai and connect with your companion." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Check if running inside Lovable editor iframe
      let isInIframe = false;
      try { isInIframe = window.self !== window.top; } catch { isInIframe = true; }

      if (isInIframe) {
        // Inside Lovable editor — use Lovable's popup-based OAuth
        const lovable = await getLovable();
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: `${window.location.origin}/app`,
        });
        if (result.error) {
          toast.error((result.error as Error).message || "Google sign-in failed");
          return;
        }
        if (!result.redirected) {
          navigate({ to: "/app" });
        }
      } else {
        // Standalone app — use Supabase OAuth with redirect callback
        const supabase = await getSupabase();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          toast.error(error.message || "Google sign-in failed");
        }
        // Browser will redirect to Google, then back to /auth/callback
      }
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      const supabase = await getSupabase();
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative" style={{ background: "linear-gradient(170deg, #FDF8F3 0%, #F0E8DF 50%, #E8DDD2 100%)" }}>
      {/* Warm ambient decorations */}
      <div className="absolute top-[10%] right-[15%] w-64 h-64 rounded-full bg-[#D4956A]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full animate-fade-up-blur relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="text-3xl font-extrabold text-foreground tracking-tight">TakeCare.ai</span>
        </Link>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-xl shadow-black/[0.06] border border-border/50 p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {isSignUp ? "Join our caring community" : "We're glad to see you again"}
            </p>
          </div>

          {/* Google OAuth — primary method */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-border bg-background py-4 text-base font-bold text-foreground hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none touch-target"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground font-medium">or use email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full rounded-2xl border-2 border-border bg-background pl-12 pr-4 py-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 touch-target"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-2xl border-2 border-border bg-background pl-12 pr-12 py-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 touch-target"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary text-primary-foreground py-4 text-base font-bold hover:bg-primary/90 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-primary/20 touch-target"
            >
              {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-base text-muted-foreground mt-8 font-medium">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-bold hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
