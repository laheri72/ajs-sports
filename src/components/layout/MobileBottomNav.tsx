import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Swords,
  Activity,
  Trophy,
  Shield,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsAdmin, useUserRole } from "@/hooks/useUserRole";

const baseItems = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/matches", icon: Swords, label: "Matches" },
  { to: "/leaderboard", icon: Trophy, label: "Board" },
  { to: "/fitness", icon: Activity, label: "Fitness" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAdmin } = useIsAdmin();
  const { data: roles } = useUserRole();
  const isCaptain = roles?.includes("captain") || roles?.includes("co_captain") || isAdmin;

  const navItems = [
    ...baseItems,
    ...(isCaptain ? [{ to: "/captain/selection", icon: ClipboardList, label: "Selection" }] : []),
    ...(isAdmin ? [{ to: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-lg border-t border-sidebar-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = item.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.to);
          return (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl text-[10px] font-medium transition-all min-w-[40px]",
                isActive
                  ? "text-primary"
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
}
