import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Heart, MessageCircle, Camera, Mic, Sun,
  CheckCircle2, ArrowRight, Star, Quote, Shield, Clock, Users,
} from "lucide-react";
import heroBg from "@/assets/hero-care.png";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "TakeCare.ai — Your gentle companion for everyday life" },
      { name: "description", content: "TakeCare.ai helps elderly loved ones stay connected, find misplaced items, and chat with a caring AI companion. Simple voice commands, big buttons, warm design." },
    ],
  }),
});

function LandingPage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          navigate({ to: "/app" });
        } else {
          setChecked(true);
        }
      });
    }).catch(() => setChecked(true));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Hero />
      <TrustBanner />
      <Features />
      <HowItWorks />
      <Reviews />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative pb-28 pt-0 lg:pb-36 overflow-hidden" style={{ background: "linear-gradient(165deg, #2D2520 0%, #3D3228 40%, #4A3F35 100%)" }}>
      {/* Warm ambient glow */}
      <div className="absolute top-0 right-0 w-[60%] h-full pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(212,149,106,0.15), transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none" style={{ background: "linear-gradient(to top, var(--background), transparent)" }} />

      {/* Hero image — soft overlay */}
      <img
        src={heroBg}
        alt=""
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none"
        aria-hidden="true"
      />

      {/* Navbar */}
      <nav className="relative z-20 max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">TakeCare.ai</span>
        </Link>

        <div className="hidden sm:flex items-center gap-8 text-sm font-semibold text-white/80">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#reviews" className="hover:text-white transition-colors">Stories</a>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#D4956A] text-white px-6 py-3 text-sm font-bold hover:bg-[#C48560] transition-all duration-300 active:scale-[0.97] shadow-lg shadow-[#D4956A]/30"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 lg:pt-28 pb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 mb-8">
            <Heart className="w-4 h-4 text-[#E8C9A0]" />
            <span className="text-sm font-medium text-white/80">Built with love for those we cherish</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white" style={{ lineHeight: "1.1" }}>
            Your gentle<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8C9A0] to-[#D4956A]">companion</span> for{" "}
            everyday living
          </h1>

          <p className="mt-8 text-xl text-white/80 font-medium leading-relaxed max-w-lg">
            TakeCare.ai helps your loved ones stay connected and independent. Friendly AI conversations, simple voice commands, and help finding misplaced things.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#D4956A] text-white px-8 py-4 text-lg font-bold hover:bg-[#C48560] transition-all duration-300 active:scale-[0.97] shadow-xl shadow-[#D4956A]/25 touch-target"
            >
              Start for free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <span className="text-sm text-white/50 font-medium mt-3 sm:mt-4">No credit card needed</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust banner ─── */
function TrustBanner() {
  return (
    <div className="relative -mt-6 z-20 max-w-4xl mx-auto px-6">
      <div className="rounded-3xl bg-card border border-border/50 shadow-xl shadow-black/[0.04] px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        {[
          { icon: Shield, label: "Safe & Private" },
          { icon: Clock, label: "Always Available" },
          { icon: Users, label: "Family Connected" },
          { icon: Heart, label: "Built with Care" },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mint flex items-center justify-center">
              <t.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Features ─── */
const features = [
  { icon: MessageCircle, title: "Friendly AI Companion", desc: "Have warm, patient conversations anytime. Our AI remembers what matters to you and speaks naturally.", color: "#5B8A72" },
  { icon: Mic, title: "Simple Voice Commands", desc: "No typing needed — just speak naturally. Ask questions, set reminders, or have a chat.", color: "#D4956A" },
  { icon: Camera, title: "Find Lost Items", desc: "Snap a photo of a room and we'll help locate misplaced keys, glasses, or medicine.", color: "#8BBAA1" },
  { icon: Sun, title: "Gentle Daily Routines", desc: "Simple check-ins and reminders that keep your day structured without feeling overwhelming.", color: "#E8C9A0" },
  { icon: Heart, title: "Emotional Support", desc: "Our companion listens, encourages, and provides comfort during lonely moments.", color: "#C75050" },
  { icon: Shield, title: "Completely Private", desc: "Your conversations and photos stay between you and TakeCare. We never share your data.", color: "#5B8A72" },
];

function Features() {
  return (
    <section id="features" className="pt-24 pb-20 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary mb-3">Why families choose us</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground" style={{ lineHeight: "1.15" }}>
            Designed with empathy,<br />built for comfort
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-lg">
            Every feature is thoughtfully crafted with seniors in mind — large text, simple interactions, and a warm, reassuring presence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="group rounded-3xl border border-border/50 bg-card p-7 hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-1 transition-all duration-400">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: f.color + "18" }}>
                <f.icon className="w-7 h-7" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
const steps = [
  { num: "1", icon: CheckCircle2, title: "Easy Sign In", desc: "One tap with Google — no complicated passwords to remember. Your family can help set it up in seconds." },
  { num: "2", icon: MessageCircle, title: "Chat & Talk", desc: "Open the app and start chatting. Type, speak, or just listen — our companion adapts to you." },
  { num: "3", icon: Camera, title: "Find & Remember", desc: "Take a photo when you can't find something. Our AI will tell you exactly where it spotted your item." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-card border-y border-border/40">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground" style={{ lineHeight: "1.15" }}>
            Three simple steps to peace of mind
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-10">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px border-t-2 border-dashed border-primary/20" />

          {steps.map((s) => (
            <div key={s.num} className="text-center relative">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center mx-auto mb-6 text-xl font-extrabold shadow-lg shadow-primary/20">
                {s.num}
              </div>
              <h3 className="font-bold text-foreground text-xl mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Reviews ─── */
const reviews = [
  { name: "Margaret H.", role: "Age 78, user since January", avatar: "https://trovdwfeqyzlxzrtfbjv.supabase.co/storage/v1/object/public/assets/avatars/b706d9a7-3a45-4fdd-ab47-c7023d4d0cfa/avatar-20.jpg", quote: "I was lonely after my husband passed. TakeCare.ai gives me someone to talk to every morning. It remembers my grandchildren's names!", rating: 5 },
  { name: "David & Sarah K.", role: "Children of user, Age 82", avatar: "https://trovdwfeqyzlxzrtfbjv.supabase.co/storage/v1/object/public/assets/avatars/e20b66f6-e7e9-4c00-93d3-506c78cb66c2/avatar-19.jpg", quote: "Dad keeps losing his keys. Now he just takes a photo and the app tells him where they are. It's given us so much peace of mind.", rating: 5 },
  { name: "Ruth A.", role: "Age 74, lives independently", avatar: "https://trovdwfeqyzlxzrtfbjv.supabase.co/storage/v1/object/public/assets/avatars/307e7512-1637-4ea2-a5cd-875afeb1002b/avatar-21.jpg", quote: "The buttons are big enough for me to see! And I love that I can just talk to it instead of typing on those tiny keyboards.", rating: 5 },
  { name: "Dr. James P.", role: "Geriatric care specialist", avatar: "https://trovdwfeqyzlxzrtfbjv.supabase.co/storage/v1/object/public/assets/avatars/6b77ccde-dbfd-4c23-8c9f-ce748683068a/avatar-16.jpg", quote: "I recommend TakeCare.ai to families of my patients with early-stage dementia. The interface is wonderfully accessible and compassionate.", rating: 5 },
];

function Reviews() {
  return (
    <section id="reviews" className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary mb-3">Real stories</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground" style={{ lineHeight: "1.15" }}>
            Trusted by families everywhere
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="relative rounded-3xl border border-border/50 bg-card p-8 overflow-hidden">
              <Quote className="absolute top-5 right-5 w-10 h-10 text-primary/[0.06] rotate-180" />

              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-[#D4956A] text-[#D4956A]" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6 text-lg relative">"{r.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={r.avatar} alt={r.name} className="w-14 h-14 rounded-2xl object-cover" loading="lazy" />
                <div>
                  <p className="font-bold text-foreground">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28" style={{ background: "linear-gradient(165deg, #2D2520 0%, #3D3228 40%, #4A3F35 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(212,149,106,0.1), transparent 60%)" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center mx-auto mb-8 animate-gentle-breathe">
          <Heart className="w-8 h-8 text-white" fill="white" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white" style={{ lineHeight: "1.15" }}>
          Ready to bring comfort &<br />connection to your family?
        </h2>
        <p className="mt-5 text-white/70 max-w-md mx-auto text-lg leading-relaxed">
          Set up TakeCare.ai for your loved one in minutes. It's free and always will be for basic features.
        </p>
        <Link
          to="/login"
          className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-[#D4956A] text-white px-10 py-5 text-lg font-bold hover:bg-[#C48560] transition-all duration-300 active:scale-[0.97] shadow-xl shadow-[#D4956A]/30"
        >
          Get started free
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border/40 py-14">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-extrabold text-foreground">TakeCare.ai</span>
          </div>

          <div className="flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#reviews" className="hover:text-foreground transition-colors">Stories</a>
            <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
          </div>

          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TakeCare.ai</p>
        </div>
      </div>
    </footer>
  );
}
