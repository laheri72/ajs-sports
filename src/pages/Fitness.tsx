import { motion } from "framer-motion";
import { Activity, TrendingUp, Zap, Award } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const tooltipStyle = {
  background: "hsl(222, 41%, 12%)",
  border: "1px solid hsl(222, 30%, 20%)",
  borderRadius: "12px",
  color: "hsl(210, 40%, 95%)",
  fontSize: 12,
};

export default function Fitness() {
  const { data: profile } = useProfile();

  // Fetch all fitness logs
  const { data: fitnessLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["fitness-logs", profile?.tr_number],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fitness_logs")
        .select("*")
        .eq("student_tr", profile!.tr_number)
        .order("logged_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch participations with results for correlation
  const { data: perfData } = useQuery({
    queryKey: ["fitness-performance", profile?.tr_number],
    enabled: !!profile,
    queryFn: async () => {
      // Get participations
      const { data: parts } = await supabase
        .from("participations")
        .select("id, event_id, events(name, sports(name))")
        .eq("student_id", profile!.tr_number);

      // Get results for those participations
      const partIds = (parts || []).map((p) => p.id);
      if (!partIds.length) return { events: 0, placements: [] };

      const { data: results } = await supabase
        .from("results")
        .select("placement, points_awarded, participation_id")
        .in("participation_id", partIds)
        .not("placement", "is", null)
        .order("placement");

      const placements = (results || []).map((r) => {
        const part = parts?.find((p) => p.id === r.participation_id);
        return {
          event: (part?.events as any)?.name || "—",
          sport: (part?.events as any)?.sports?.name || "—",
          placement: r.placement,
          points: r.points_awarded || 0,
        };
      });

      return { events: parts?.length || 0, placements };
    },
  });

  // Chart data from logs
  const chartData = (fitnessLogs || []).map((log, idx) => ({
    entry: `#${idx + 1}`,
    speed: Number(log.speed) || 0,
    strength: Number(log.strength) || 0,
    endurance: Number(log.endurance) || 0,
    agility: Number(log.agility) || 0,
    avg: Math.round(
      ((Number(log.speed) || 0) + (Number(log.strength) || 0) + (Number(log.endurance) || 0) +
       (Number(log.agility) || 0) + (Number(log.flexibility) || 0)) / 5
    ),
  }));

  const latestLog = fitnessLogs?.length ? fitnessLogs[fitnessLogs.length - 1] : null;
  const prevLog = fitnessLogs && fitnessLogs.length > 1 ? fitnessLogs[fitnessLogs.length - 2] : null;

  const metrics = latestLog
    ? [
        { label: "Speed", value: Number(latestLog.speed) || 0, prev: Number(prevLog?.speed) || 0 },
        { label: "Strength", value: Number(latestLog.strength) || 0, prev: Number(prevLog?.strength) || 0 },
        { label: "Endurance", value: Number(latestLog.endurance) || 0, prev: Number(prevLog?.endurance) || 0 },
        { label: "Agility", value: Number(latestLog.agility) || 0, prev: Number(prevLog?.agility) || 0 },
        { label: "Flexibility", value: Number(latestLog.flexibility) || 0, prev: Number(prevLog?.flexibility) || 0 },
      ]
    : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" /> Fitness & Performance
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Track your fitness metrics and competition correlation</p>
      </motion.div>

      {/* Latest Metrics */}
      {logsLoading ? (
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card p-4 text-center">
              <Skeleton className="h-4 w-16 mx-auto mb-2" />
              <Skeleton className="h-8 w-12 mx-auto" />
            </div>
          ))}
        </motion.div>
      ) : metrics.length > 0 ? (
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {metrics.map((m) => {
            const diff = m.value - m.prev;
            const trend = diff > 0 ? "up" : diff < 0 ? "down" : "same";
            return (
              <div key={m.label} className="glass-card p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className="stat-number text-2xl text-foreground">{m.value}</p>
                {prevLog && (
                  <p className={`text-xs mt-1 ${
                    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"} {Math.abs(diff).toFixed(1)}
                  </p>
                )}
              </div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={item} className="glass-card p-8 text-center text-muted-foreground text-sm">
          No fitness data logged yet. Your metrics will appear here once logged.
        </motion.div>
      )}

      {/* Fitness Trend Chart */}
      {chartData.length > 1 && (
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Fitness Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="hsl(222, 30%, 16%)" strokeDasharray="3 3" />
              <XAxis dataKey="entry" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="avg" stroke="hsl(174, 72%, 50%)" fill="hsl(174, 72%, 50%)" fillOpacity={0.15} strokeWidth={2} name="Avg Score" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Performance Correlation */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" /> Performance Insights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Events Participated</p>
            <p className="stat-number text-3xl text-foreground">{perfData?.events || 0}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Podium Finishes</p>
            <p className="stat-number text-3xl text-foreground">
              {perfData?.placements?.filter((p) => p.placement && p.placement <= 3).length || 0}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Placements Table */}
      {perfData?.placements && perfData.placements.length > 0 && (
        <motion.div variants={item}>
          <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-warning" /> Placements Earned
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Event</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Sport</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Place</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {perfData.placements.map((p, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{p.event}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.sport}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className={`text-xs ${
                          p.placement === 1 ? "bg-warning/10 text-warning" :
                          p.placement === 2 ? "bg-muted text-muted-foreground" :
                          p.placement === 3 ? "bg-chart-4/10 text-chart-4" : ""
                        }`}>
                          {p.placement === 1 ? "🥇 1st" : p.placement === 2 ? "🥈 2nd" : p.placement === 3 ? "🥉 3rd" : `#${p.placement}`}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 font-display font-semibold text-primary">{p.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
