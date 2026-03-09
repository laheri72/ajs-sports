import { Bell, Search, Zap, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AppHeader() {
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 md:px-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-foreground text-base tracking-tight">SportSync</span>
      </div>

      {/* Search - hidden on mobile */}
      <div className="relative w-80 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search athletes, events, sports..."
          className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl gradient-accent flex items-center justify-center">
            <span className="text-xs md:text-sm font-display font-bold text-accent-foreground">{initials}</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-foreground leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
