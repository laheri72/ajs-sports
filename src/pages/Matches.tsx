import { motion } from "framer-motion";
import { Swords, Calendar, Clock, Trophy } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { format } from "date-fns";

const stageBg: Record<string, string> = {
  group: "bg-primary/10 text-primary",
  quarterfinal: "bg-accent/10 text-accent",
  semifinal: "bg-warning/10 text-warning",
  final: "bg-destructive/10 text-destructive",
  third_place: "bg-success/10 text-success",
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Matches() {
  const { data: matches, isLoading } = useMatches();

  const now = new Date();
  const upcoming = (matches || []).filter((m: any) => m.match_date && new Date(m.match_date) > now);
  const past = (matches || []).filter((m: any) => !m.match_date || new Date(m.match_date) <= now);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Swords className="w-6 h-6 text-primary" /> Matches & Events
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Upcoming schedule and match history</p>
      </motion.div>

      {/* Upcoming */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-foreground mb-3">Upcoming</h2>
        {isLoading ? (
          <div className="glass-card p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : upcoming.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground text-sm">
            No upcoming matches scheduled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((m: any) => (
              <div key={m.id} className="glass-card p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-foreground">
                    {m.event?.sports?.name || m.event?.name || "Match"}
                  </h3>
                  {m.stage && (
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium capitalize ${stageBg[m.stage] || "bg-secondary text-muted-foreground"}`}>
                      {m.stage.replace("_", " ")}
                    </span>
                  )}
                </div>
                <p className="text-lg font-display font-bold text-foreground mb-3">
                  {m.home_team?.houses?.name || m.home_team?.name || "TBD"}{" "}
                  <span className="text-muted-foreground text-sm font-normal">vs</span>{" "}
                  {m.away_team?.houses?.name || m.away_team?.name || "TBD"}
                </p>
                {m.match_date && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {format(new Date(m.match_date), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {format(new Date(m.match_date), "h:mm a")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Past */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-foreground mb-3">Match History</h2>
        <div className="glass-card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : past.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No completed matches yet. Results will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Event</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Home</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Score</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Away</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Stage</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((m: any) => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{m.event?.sports?.name || m.event?.name}</td>
                      <td className="px-5 py-3 text-foreground">
                        {m.home_team?.houses?.name || m.home_team?.name || "TBD"}
                        {m.winner_team_id === m.home_team_id && <Trophy className="inline w-3.5 h-3.5 text-warning ml-1" />}
                      </td>
                      <td className="px-5 py-3 font-display font-semibold text-foreground">
                        {m.home_score ?? "-"} – {m.away_score ?? "-"}
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {m.away_team?.houses?.name || m.away_team?.name || "TBD"}
                        {m.winner_team_id === m.away_team_id && <Trophy className="inline w-3.5 h-3.5 text-warning ml-1" />}
                      </td>
                      <td className="px-5 py-3">
                        {m.stage && (
                          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium capitalize ${stageBg[m.stage] || ""}`}>
                            {m.stage.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {m.match_date ? format(new Date(m.match_date), "MMM d") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
