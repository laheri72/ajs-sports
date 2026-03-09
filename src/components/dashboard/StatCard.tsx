import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "primary" | "accent" | "success";
}

const variantStyles = {
  default: "glass-card",
  primary: "glass-card glow-primary border-primary/20",
  accent: "glass-card border-accent/20",
  success: "glass-card border-success/20",
};

const iconBgStyles = {
  default: "bg-secondary",
  primary: "gradient-primary",
  accent: "gradient-accent",
  success: "gradient-success",
};

export default function StatCard({ title, value, subtitle, icon, trend, variant = "default" }: StatCardProps) {
  return (
    <div className={cn("p-5 transition-all duration-300 hover:scale-[1.02]", variantStyles[variant])}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBgStyles[variant])}>
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-lg",
              trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}
          >
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">{title}</p>
      <p className="stat-number text-2xl text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
