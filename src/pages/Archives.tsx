import { useState } from "react";
import { motion } from "framer-motion";
import { Archive, Trophy, Calendar, Download, Medal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAdmin } from "@/hooks/useUserRole";
import { toast } from "sonner";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Archives() {
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const { isAdmin } = useIsAdmin();

  const { data: seasons } = useQuery({
    queryKey: ["all-seasons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seasons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const selectedSeason = seasons?.find((s) => s.id === seasonId);

  // House standings for selected season
  const { data: houseStandings, isLoading: standingsLoading } = useQuery({
    queryKey: ["archive-house-standings", seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data: houses } = await supabase.from("houses").select("id, name, color");
      const { data: pts } = await supabase
        .from("point_transactions")
        .select("house_id, points")
        .eq("season_id", seasonId!);

      const byHouse: Record<string, number> = {};
      for (const p of pts || []) {
        byHouse[p.house_id] = (byHouse[p.house_id] || 0) + p.points;
      }

      return (houses || [])
        .map((h) => ({ ...h, total_points: byHouse[h.id] || 0 }))
        .sort((a, b) => b.total_points - a.total_points);
    },
  });

  // Event winners for selected season
  const { data: eventResults, isLoading: eventsLoading } = useQuery({
    queryKey: ["archive-event-results", seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data: events } = await supabase
        .from("events")
        .select("id, name, is_team_event, sports(name)")
        .eq("season_id", seasonId!);

      const { data: standings } = await supabase
        .from("team_standings")
        .select("event_id, team_id, points, goal_diff, teams(name, houses(name, color))")
        .eq("season_id", seasonId!)
        .order("points", { ascending: false })
        .order("goal_diff", { ascending: false });

      return (events || []).map((event: any) => {
        const eventStandings = (standings || [])
          .filter((s: any) => s.event_id === event.id)
          .slice(0, 4);
        return { ...event, standings: eventStandings };
      });
    },
  });

  const handleExportStandings = () => {
    if (!houseStandings?.length || !selectedSeason) return;
    const headers = ["Rank", "House", "Points"];
    const rows = houseStandings.map((h, i) => [String(i + 1), h.name, String(h.total_points)]);
    downloadCSV(`${selectedSeason.name}-standings.csv`, headers, rows);
    toast.success("Standings exported");
  };

  const handleExportMedals = async () => {
    if (!seasonId || !selectedSeason) return;
    const { data: pts } = await supabase
      .from("point_transactions")
      .select("student_id, points, source, description, houses:house_id(name)")
      .eq("season_id", seasonId)
      .not("student_id", "is", null);

    if (!pts?.length) {
      toast.error("No medal data to export");
      return;
    }

    const studentIds = [...new Set(pts.map((p) => p.student_id).filter(Boolean))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, class_name")
      .in("id", studentIds as string[]);

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

    const headers = ["Student", "Class", "House", "Source", "Description", "Points"];
    const rows = pts.map((p: any) => {
      const prof = profileMap[p.student_id!] || {};
      return [
        (prof as any).full_name || "Unknown",
        (prof as any).class_name || "—",
        p.houses?.name || "—",
        p.source,
        p.description || "—",
        String(p.points),
      ];
    });

    downloadCSV(`${selectedSeason.name}-medals.csv`, headers, rows);
    toast.success("Medal list exported");
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Archive className="w-6 h-6 text-primary" /> Season Archives
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Browse historical season results and standings</p>
        </div>
        <Select value={seasonId ?? ""} onValueChange={setSeasonId}>
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

      {!seasonId && (
        <motion.div variants={item} className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Select a season to view its archive.</p>
        </motion.div>
      )}

      {/* Admin Exports */}
      {seasonId && isAdmin && (
        <motion.div variants={item} className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleExportStandings}>
            <Download className="w-4 h-4 mr-2" /> Export Standings CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMedals}>
            <Download className="w-4 h-4 mr-2" /> Export Medal List CSV
          </Button>
        </motion.div>
      )}

      {/* House Standings */}
      {seasonId && (
        <motion.div variants={item}>
          <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-warning" /> House Standings — {selectedSeason?.name}
          </h2>
          {standingsLoading ? (
            <div className="glass-card p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !houseStandings?.length ? (
            <div className="glass-card p-8 text-center text-muted-foreground text-sm">
              No standings data for this season.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {houseStandings.map((h, idx) => (
                <div key={h.id} className={`glass-card p-5 text-center ${idx === 0 ? "glow-primary border-primary/20" : ""}`}>
                  <div className="text-2xl mb-1">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}</div>
                  <div
                    className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ background: h.color }}
                  >
                    <span className="font-display font-bold" style={{ color: "hsl(222, 47%, 8%)" }}>
                      {h.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{h.name}</h3>
                  <p className="stat-number text-2xl text-foreground mt-1">{h.total_points.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Event Results */}
      {seasonId && (
        <motion.div variants={item}>
          <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Medal className="w-4 h-4 text-accent" /> Event Results
          </h2>
          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !eventResults?.length ? (
            <div className="glass-card p-8 text-center text-muted-foreground text-sm">
              No events found for this season.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventResults.map((event: any) => (
                <div key={event.id} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-display font-semibold text-foreground text-sm">{event.name}</h3>
                    <Badge variant="outline" className="text-xs">{event.sports?.name}</Badge>
                    {event.is_team_event && <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Team</Badge>}
                  </div>
                  {event.standings.length > 0 ? (
                    <div className="space-y-1.5">
                      {event.standings.map((s: any, idx: number) => (
                        <div key={s.team_id} className="flex items-center gap-2 text-sm">
                          <span className="text-xs font-display font-bold text-muted-foreground w-5">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`}
                          </span>
                          {s.teams?.houses?.color && (
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.teams.houses.color }} />
                          )}
                          <span className="text-foreground">{s.teams?.houses?.name || s.teams?.name || "—"}</span>
                          <span className="ml-auto font-display font-semibold text-muted-foreground">{s.points} pts</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No standings recorded</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
