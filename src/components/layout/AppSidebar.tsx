import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Swords,
  Activity,
  Trophy,
  Award,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Archive,
  ClipboardList,
  Heart,
  Dumbbell,
  Handshake,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsAdmin, useUserRole } from "@/hooks/useUserRole";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/profile", icon: User, label: "Sports Profile" },
  { to: "/matches", icon: Swords, label: "Matches" },
  
  { to: "/fitness", icon: Activity, label: "Fitness" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/assessment", icon: Award, label: "Assessment" },
  { to: "/archives", icon: Archive, label: "Archives" },
  { to: "/interests", icon: Heart, label: "My Interests" },
  { to: "/clubs", icon: Dumbbell, label: "Clubs" },
  { to: "/sports-buddy", icon: Handshake, label: "Sports Buddy" },
  { to: "/my-certificates", icon: Award, label: "Certificates" },
  { to: "/hall-of-athletes", icon: Trophy, label: "Hall of Athletes" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAdmin } = useIsAdmin();
  const { data: roles } = useUserRole();
  const isCaptain = roles?.includes("captain") || roles?.includes("co_captain") || roles?.includes("admin");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex-col z-50 transition-all duration-300 hidden md:flex",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-foreground text-lg tracking-tight">
            SportSync
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-primary glow-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Captain Selection Link */}
      {isCaptain && (
        <NavLink
          to="/captain/selection"
          className={cn(
            "mx-3 mb-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            location.pathname.startsWith("/captain")
              ? "bg-warning/20 text-warning"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <ClipboardList className={cn("w-5 h-5 flex-shrink-0", location.pathname.startsWith("/captain") && "text-warning")} />
          {!collapsed && <span>Selection</span>}
        </NavLink>
      )}

      {/* Admin Link */}
      {isAdmin && (
        <NavLink
          to="/admin"
          className={cn(
            "mx-3 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            location.pathname.startsWith("/admin")
              ? "bg-accent/20 text-accent"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Shield className={cn("w-5 h-5 flex-shrink-0", location.pathname.startsWith("/admin") && "text-accent")} />
          {!collapsed && <span>Admin Panel</span>}
        </NavLink>
      )}

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-4 p-2 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
