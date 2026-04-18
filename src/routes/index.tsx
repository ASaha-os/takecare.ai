import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Heart, MessageCircle, Camera, Mic, Sun,
  CheckCircle2, ArrowRight, Star, Quote, Shield, Clock, Users, Sparkles,
} from "lucide-react";
import heroBg from "@/assets/hero-care.png";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "TakeCare.ai — Your gentle companion for everyday life" },
      { name: "description", content: "TakeCare.ai helps elderly loved ones stay connected, find misplaced items, and chat with a caring AI companion." },
    ],
  }),
});

/* ── Scroll-reveal hook ── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-on-scroll, .card-pop-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revealed"); observer.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Animated counter ── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / 50;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(timer); }
        else setVal(Math.floor(start));
      }, 30);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function LandingPage() {
  const navigate = useNavigate();
  useScrollReveal();

  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) navigate({ to: "/app" });
      });
    }).catch(() => {});
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Reviews />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ─── Floating particles ─── */
function Particles() {
  const particles = [
    { size: 6, top: "15%", left: "8%", delay: "0s", dur: "7s" },
    { size: 4, top: "30%", left: "92%", delay: "1s", dur: "9s" },
    { size: 8, top: "60%", left: "5%", delay: "2s", dur: "6s" },
    { size: 5, top: "75%", left: "88%", delay: "0.5s", dur: "8s" },
    { size: 3, top: "45%", left: "95%", delay: "3s", dur: "10s" },
    { size: 6, top: "20%", left: "80%", delay: "1.5s", dur: "7.5s" },
  ];
  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#D4956A]/30 pointer-events-none animate-float-particle"
          style={{ width: p.size, height: p.size, top: p.top, left: p.left, animationDelay: p.delay, animationDuration: p.dur }}
        />
      ))}
    </>
  );
}

/* ─── Hero ─── */
function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const words = ["friend", "partner", "companion", "caregiver", "guide"];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const currentWord = words[wordIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseAfterWord = 2000;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          // Pause then start deleting
          setTimeout(() => setIsDeleting(true), pauseAfterWord);
        }
      } else {
        // Deleting backward
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          // Move to next word
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex, words]);

  return (
    <section className="relative pb-32 pt-0 lg:pb-44 overflow-hidden" style={{ background: "linear-gradient(165deg, #1E1612 0%, #2D2520 35%, #3D3228 65%, #4A3F35 100%)" }}>
      <Particles />

      {/* Animated ambient orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(212,149,106,0.18) 0%, transparent 70%)", transform: `translateY(${scrollY * 0.15}px)` }} />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(91,138,114,0.12) 0%, transparent 70%)", transform: `translateY(${scrollY * -0.1}px)` }} />

      <div className="absolute bottom-0 left-0 w-full h-40 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--background), transparent)" }} />

      {/* Hero image with parallax */}
      <img
        src={heroBg} alt="" aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none select-none"
        style={{ transform: `translateY(${scrollY * 0.25}px) scale(1.1)` }}
      />

      {/* Navbar */}
      <nav className="relative z-20 max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center shadow-lg shadow-[#D4956A]/30 group-hover:scale-110 transition-transform duration-300">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">TakeCare.ai</span>
        </Link>

        <div className="hidden sm:flex items-center gap-8 text-sm font-semibold text-white/70">
          {["Features", "How it works", "Stories"].map((label, i) => (
            <a key={label} href={`#${["features", "how-it-works", "reviews"][i]}`}
              className="nav-link hover:text-white transition-colors duration-200">{label}</a>
          ))}
        </div>

        <Link to="/login"
          className="btn-shimmer inline-flex items-center gap-2 rounded-2xl bg-[#D4956A] text-white px-6 py-3 text-sm font-bold hover:bg-[#C48560] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-[#D4956A]/30">
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 lg:pt-28 pb-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 mb-8 animate-fade-up-blur hover:bg-white/15 transition-colors cursor-default">
            <Sparkles className="w-4 h-4 text-[#E8C9A0]" />
            <span className="text-sm font-medium text-white/80">Built with love for those we cherish</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white animate-fade-up-blur" style={{ lineHeight: "1.08", animationDelay: "80ms" }}>
            Your gentle<br />
            <span className="inline-block min-w-[280px] text-transparent bg-clip-text bg-gradient-to-r from-[#E8C9A0] via-[#D4956A] to-[#C48560]">
              {displayText}
              <span className="inline-block w-0.5 h-[0.9em] bg-[#D4956A] ml-1 animate-pulse align-middle" />
            </span>{" "}
            for everyday living
          </h1>

          <p className="mt-8 text-xl text-white/85 font-medium leading-relaxed max-w-lg animate-fade-up-blur drop-shadow-sm" style={{ animationDelay: "160ms" }}>
            TakeCare.ai helps your loved ones stay connected and independent. Warm AI conversations, simple voice commands, and help finding misplaced things.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-start gap-4 animate-fade-up-blur" style={{ animationDelay: "240ms" }}>
            <Link to="/login"
              className="btn-shimmer group inline-flex items-center gap-3 rounded-2xl bg-[#D4956A] text-white px-8 py-4 text-lg font-bold hover:bg-[#C48560] hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-[#D4956A]/30 touch-target">
              Start for free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-2 mt-3 sm:mt-4">
              <Shield className="w-5 h-5 text-[#E8C9A0]" />
              <span className="text-sm text-white/60 font-medium drop-shadow-sm">Trustworthy app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chat preview card */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 animate-fade-up-blur" style={{ animationDelay: "400ms" }}>
        <div className="ml-auto max-w-xs bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Companion</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/50 text-xs">Online</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl rounded-tl-sm p-3 mb-2">
            <p className="text-white/90 text-sm leading-relaxed">Good morning, dear! 💛 How are you feeling today?</p>
          </div>
          <div className="flex gap-1 pl-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats bar ─── */
function StatsBar() {
  const stats = [
    { value: 100, suffix: "%", label: "Secure & Private" },
    { value: 24, suffix: "/7", label: "Always available" },
    { value: 4, suffix: " languages", label: "Supported" },
    { value: 0, suffix: " cost", label: "Free to start" },
  ];
  return (
    <div className="relative -mt-8 z-20 max-w-4xl mx-auto px-6">
      <div className="card-pop-on-scroll rounded-3xl bg-card border border-border/50 shadow-2xl shadow-black/[0.06] px-8 py-7 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center group cursor-default">
            <p className="text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors duration-300">
              <Counter target={s.value} suffix={s.suffix} />
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Features ─── */
const features = [
  { icon: MessageCircle, title: "Friendly AI Companion", desc: "Warm, patient conversations anytime. Our AI listens and speaks naturally.", color: "#5B8A72", bg: "#5B8A7218" },
  { icon: Mic, title: "Simple Voice Commands", desc: "No typing needed — just speak. Ask questions, set reminders, or just chat.", color: "#D4956A", bg: "#D4956A18" },
  { icon: Camera, title: "Find Lost Items", desc: "Snap a photo and we'll help locate misplaced keys, glasses, or medicine.", color: "#8BBAA1", bg: "#8BBAA118" },
  { icon: Sun, title: "Gentle Daily Routines", desc: "Simple check-ins and reminders that keep your day structured and calm.", color: "#E8A030", bg: "#E8A03018" },
  { icon: Heart, title: "Emotional Support", desc: "Our companion listens, encourages, and provides comfort when you need it.", color: "#C75050", bg: "#C7505018" },
  { icon: Shield, title: "Completely Private", desc: "Your conversations stay between you and TakeCare. We never share your data.", color: "#5B8A72", bg: "#5B8A7218" },
];

function Features() {
  return (
    <section id="features" className="pt-28 pb-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative">
        <div className="text-center mb-16 reveal-on-scroll">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary mb-3">Why families choose us</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground" style={{ lineHeight: "1.15" }}>
            Designed with empathy,<br />built for comfort
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-lg">
            Every feature is thoughtfully crafted with seniors in mind — large text, simple interactions, and a warm presence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title}
              className="feature-card card-pop-on-scroll group rounded-3xl border border-border/50 bg-card p-7 cursor-default"
              style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="feature-icon w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: f.bg }}>
                <f.icon className="w-7 h-7" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-200">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className="mt-4 h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-500" style={{ backgroundColor: f.color + "60" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
const steps = [
  { num: "1", icon: CheckCircle2, title: "Easy Sign In", desc: "One tap with Google — no complicated passwords. Your family can set it up in seconds.", color: "#D4956A" },
  { num: "2", icon: MessageCircle, title: "Chat & Talk", desc: "Open the app and start chatting. Type, speak, or just listen — our companion adapts to you.", color: "#5B8A72" },
  { num: "3", icon: Camera, title: "Find & Remember", desc: "Take a photo when you can't find something. Our AI tells you exactly where it spotted your item.", color: "#8BBAA1" },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, var(--background) 0%, #F5EDE4 50%, var(--background) 100%)" }}>
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #5B8A7215 0%, transparent 50%), radial-gradient(circle at 80% 50%, #D4956A15 0%, transparent 50%)" }} />

      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="text-center mb-16 reveal-on-scroll">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground" style={{ lineHeight: "1.15" }}>
            Three simple steps to peace of mind
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-10">
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+36px)] right-[calc(16.67%+36px)] h-px"
            style={{ background: "linear-gradient(90deg, #D4956A40, #5B8A7240, #8BBAA140)" }} />

          {steps.map((s, i) => (
            <div key={s.num} className="reveal-on-scroll text-center relative group cursor-default" style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-2xl font-extrabold text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, boxShadow: `0 12px 32px ${s.color}40` }}>
                {s.num}
              </div>
              <h3 className="font-bold text-foreground text-xl mb-3 group-hover:text-primary transition-colors">{s.title}</h3>
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
    <section id="reviews" className="py-28">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 reveal-on-scroll">
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary mb-3">Real stories</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground" style={{ lineHeight: "1.15" }}>
            Trusted by families everywhere
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <div key={r.name}
              className="review-card card-pop-on-scroll relative rounded-3xl border border-border/50 bg-card p-8 overflow-hidden cursor-default"
              style={{ transitionDelay: `${i * 80}ms` }}>
              {/* Subtle gradient accent */}
              <div className="absolute top-0 left-0 w-full h-1 rounded-t-3xl bg-gradient-to-r from-[#D4956A] to-[#5B8A72] opacity-60" />
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/[0.06] rotate-180" />

              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-[#D4956A] text-[#D4956A]" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6 text-lg relative">"{r.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={r.avatar} alt={r.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-border" loading="lazy" />
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
    <section className="relative overflow-hidden py-32" style={{ background: "linear-gradient(165deg, #1E1612 0%, #2D2520 40%, #4A3F35 100%)" }}>
      <Particles />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(212,149,106,0.12), transparent 65%)" }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center reveal-on-scroll">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center mx-auto mb-8 animate-gentle-breathe shadow-2xl shadow-[#D4956A]/30">
          <Heart className="w-10 h-10 text-white" fill="white" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white" style={{ lineHeight: "1.15" }}>
          Ready to bring comfort &<br />connection to your family?
        </h2>
        <p className="mt-5 text-white/75 max-w-md mx-auto text-lg leading-relaxed drop-shadow-sm">
          Set up TakeCare.ai for your loved one in minutes. Free forever for the essentials.
        </p>
        <Link to="/login"
          className="btn-shimmer mt-10 inline-flex items-center gap-3 rounded-2xl bg-[#D4956A] text-white px-10 py-5 text-lg font-bold hover:bg-[#C48560] hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-[#D4956A]/30 group">
          Get started free
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="mt-4 text-white/40 text-sm drop-shadow-sm">No credit card needed · Takes 30 seconds</p>
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
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-extrabold text-foreground">TakeCare.ai</span>
          </div>

          <div className="flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            {[["Features", "#features"], ["How it works", "#how-it-works"], ["Stories", "#reviews"]].map(([label, href]) => (
              <a key={label} href={href} className="nav-link hover:text-foreground transition-colors">{label}</a>
            ))}
            <Link to="/login" className="nav-link hover:text-foreground transition-colors">Sign in</Link>
          </div>

          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TakeCare.ai</p>
        </div>
      </div>
    </footer>
  );
}
