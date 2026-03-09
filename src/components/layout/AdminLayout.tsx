import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Medal,
  Calendar,
  Dumbbell,
  Users,
  ArrowLeft,
  Shield,
  Zap,
  Menu,
  X,
  Heart,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/students", icon: Users, label: "Students" },
  { to: "/admin/seasons", icon: Calendar, label: "Seasons" },
  { to: "/admin/sports", icon: Dumbbell, label: "Sports" },
  { to: "/admin/events", icon: Medal, label: "Events" },
  { to: "/admin/hizb", icon: Users, label: "Hizb Teams" },
  { to: "/admin/proficiency", icon: Award, label: "Proficiency Engine" },
  { to: "/admin/competition", icon: Zap, label: "Competition" },
  { to: "/admin/results-entry", icon: Shield, label: "Results" },
  { to: "/admin/talent", icon: Heart, label: "Talent ID" },
  { to: "/admin/clubs", icon: Dumbbell, label: "Clubs" },
  { to: "/admin/certifications", icon: Award, label: "Certifications" },
];

export default function AdminLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="w-[240px] bg-sidebar border-r border-sidebar-border flex-col hidden md:flex fixed left-0 top-0 h-screen z-50">
        <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display font-bold text-foreground text-lg tracking-tight">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {adminNav.map((item) => {
            const isActive = item.to === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-accent glow-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-accent")} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <NavLink
          to="/"
          className="mx-3 mb-4 p-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center gap-3 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </NavLink>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="p-2 rounded-xl hover:bg-sidebar-accent">
            <ArrowLeft className="w-4 h-4 text-sidebar-foreground" />
          </NavLink>
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-display font-bold text-foreground">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bottom-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="relative bg-sidebar border-b border-sidebar-border py-2 px-3 space-y-1 shadow-lg">
            {adminNav.map((item) => {
              const isActive = item.to === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-accent")} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 md:ml-[240px] p-4 md:p-6 mt-14 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
}
