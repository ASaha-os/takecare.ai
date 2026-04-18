import { Link, useLocation } from "@tanstack/react-router";
import { Heart, LayoutList, Plus, Settings } from "lucide-react";

interface BottomNavProps {
  onAddClick: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { to: "/app" as const, icon: LayoutList, label: "My Day" },
    { to: "/insights" as const, icon: Heart, label: "Companion" },
    { to: "/settings" as const, icon: Settings, label: "Settings" },
  ];

  const activeIndex = navItems.findIndex((item) => item.to === path);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto px-4 pb-4">
        <nav className="relative flex items-center rounded-3xl border border-border/60 bg-card/90 backdrop-blur-2xl px-2 py-2 shadow-xl shadow-black/[0.06]">
          {/* Sliding indicator */}
          {activeIndex >= 0 && (
            <div
              className="absolute h-[calc(100%-16px)] rounded-2xl bg-primary/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: `calc((100% - ${16 + 56}px) / 3)`,
                left: `calc(8px + ${activeIndex} * ((100% - ${16 + 56}px) / 3))`,
              }}
            />
          )}

          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-4 rounded-2xl font-bold transition-colors duration-200 active:scale-95 touch-target ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-sm ${isActive ? "" : "hidden sm:inline"}`}>
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={onAddClick}
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all duration-200 active:scale-90 shadow-lg shadow-primary/20"
            aria-label="Add routine"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </nav>
      </div>
    </div>
  );
}
