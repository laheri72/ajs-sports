import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Users } from "lucide-react";
import { useHouseLeaderboard } from "@/hooks/useHouseLeaderboard";
import { useStudentLeaderboard } from "@/hooks/useStudentLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-warning fill-warning" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-chart-4" />;
  return <span className="w-5 h-5 flex items-center justify-center text-sm font-display font-bold text-muted-foreground">{rank}</span>;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Leaderboard() {
  const { user } = useAuth();
  const [seasonId, setSeasonId] = useState<string | undefined>(undefined);

  const { data: seasons } = useQuery({
    queryKey: ["seasons-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seasons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activeSeason = seasons?.find((s) => s.is_active);
  const effectiveSeasonId = seasonId ?? activeSeason?.id;

  const { data: houseRankings, isLoading: housesLoading } = useHouseLeaderboard(effectiveSeasonId);
  const { data: studentRankings, isLoading: studentsLoading } = useStudentLeaderboard(effectiveSeasonId);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" /> Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">House and individual rankings</p>
        </div>
        <Select value={effectiveSeasonId ?? ""} onValueChange={setSeasonId}>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            {seasons?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} {s.is_active ? "(Active)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* House Leaderboard */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-foreground mb-3">House Rankings</h2>
        {housesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-5 text-center">
                <Skeleton className="w-12 h-12 rounded-2xl mx-auto mb-3" />
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-6 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : !houseRankings?.length ? (
          <div className="glass-card p-8 text-center text-muted-foreground text-sm">
            No house data available for this season.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {houseRankings.map((h, idx) => (
              <div
                key={h.house_id}
                className={`glass-card p-5 text-center transition-all hover:scale-[1.02] ${idx === 0 ? "glow-primary border-primary/20" : ""}`}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  {rankIcon(idx + 1)}
                </div>
                <div
                  className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: h.house_color }}
                >
                  <span className="font-display font-bold text-lg" style={{ color: "hsl(222, 47%, 8%)" }}>
                    {h.house_name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground">{h.house_name}</h3>
                <p className="stat-number text-2xl text-foreground mt-1">{h.total_points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" /> {h.member_count} members
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Student Leaderboard */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-foreground mb-3">Top Athletes</h2>
        <div className="glass-card overflow-hidden">
          {studentsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (studentRankings || []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No point transactions yet. Rankings will appear once the season begins.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Rank</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Athlete</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">House</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRankings!.map((s, idx) => {
                    const isUser = s.user_id === user?.id;
                    return (
                      <tr
                        key={s.student_id}
                        className={`border-b border-border/50 transition-colors ${isUser ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-secondary/30"}`}
                      >
                        <td className="px-5 py-3">{rankIcon(idx + 1)}</td>
                        <td className="px-5 py-3 font-medium text-foreground">
                          {s.full_name}
                          {isUser && <span className="ml-2 text-xs text-primary font-medium">(You)</span>}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{s.house_name}</td>
                        <td className="px-5 py-3 font-display font-semibold text-primary">{s.total_points.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
