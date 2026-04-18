import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const { supabase } = await import("@/integrations/supabase/client");

      // Supabase automatically picks up the hash tokens on getSession()
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        toast.error("Sign-in failed: " + error.message);
        navigate({ to: "/login" });
        return;
      }

      if (session?.user) {
        navigate({ to: "/app" });
      } else {
        // Tokens may still be in the URL hash — wait for onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          subscription.unsubscribe();
          if (session?.user) {
            navigate({ to: "/app" });
          } else {
            toast.error("Sign-in failed. Please try again.");
            navigate({ to: "/login" });
          }
        });

        // Timeout fallback
        setTimeout(() => {
          subscription.unsubscribe();
          navigate({ to: "/login" });
        }, 10000);
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(170deg, #FDF8F3 0%, #F0E8DF 50%, #E8DDD2 100%)" }}>
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center shadow-lg animate-pulse">
          <Heart className="w-8 h-8 text-white" fill="white" />
        </div>
        <p className="text-lg font-semibold text-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
