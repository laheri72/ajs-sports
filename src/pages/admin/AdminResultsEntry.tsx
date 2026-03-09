import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminMatches, useAdminStandings, useRecordResult } from "@/hooks/useCompetitionEngine";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const stageBg: Record<string, string> = {
  group: "bg-primary/10 text-primary",
  quarterfinal: "bg-accent/10 text-accent",
  semifinal: "bg-warning/10 text-warning",
  final: "bg-destructive/10 text-destructive",
  third_place: "bg-success/10 text-success",
};

export default function AdminResultsEntry() {
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");

  const { data: seasons } = useQuery({
    queryKey: ["admin-seasons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seasons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activeSeason = seasons?.find((s) => s.is_active);
  const effectiveSeasonId = seasonId ?? activeSeason?.id ?? null;

  const { data: events } = useQuery({
    queryKey: ["admin-events-for-season", effectiveSeasonId],
    enabled: !!effectiveSeasonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, name, is_team_event, sports(name)")
        .eq("season_id", effectiveSeasonId!)
        .eq("is_team_event", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: matches, isLoading: matchesLoading } = useAdminMatches(effectiveSeasonId, eventId);
  const { data: standings } = useAdminStandings(effectiveSeasonId, eventId);
  const recordResult = useRecordResult();

  const handleSaveResult = (matchId: string, homeTeamId: string | null, awayTeamId: string | null) => {
    const hs = parseFloat(homeScore);
    const as_ = parseFloat(awayScore);
    if (isNaN(hs) || isNaN(as_)) return;

    let winnerId: string | null = null;
    if (hs > as_ && homeTeamId) winnerId = homeTeamId;
    else if (as_ > hs && awayTeamId) winnerId = awayTeamId;

    recordResult.mutate(
      { matchId, homeScore: hs, awayScore: as_, winnerId },
      {
        onSuccess: () => {
          setEditingMatch(null);
          setHomeScore("");
          setAwayScore("");
        },
      }
    );
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning" /> Results Entry
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Record match scores and update standings</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card className="glass-card">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Season</label>
                <Select value={effectiveSeasonId ?? ""} onValueChange={(v) => { setSeasonId(v); setEventId(null); }}>
                  <SelectTrigger>
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
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Event</label>
                <Select value={eventId ?? ""} onValueChange={setEventId} disabled={!effectiveSeasonId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events?.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} ({e.sports?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Matches */}
      {effectiveSeasonId && eventId && (
        <motion.div variants={item}>
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Matches</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead>Home</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Away</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell>
                  </TableRow>
                ) : !matches?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No fixtures yet. Generate fixtures first.
                    </TableCell>
                  </TableRow>
                ) : (
                  matches.map((m: any) => {
                    const hasResult = m.home_score !== null && m.away_score !== null;
                    const isEditing = editingMatch === m.id;

                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs capitalize ${stageBg[m.stage] || ""}`}>
                            {m.stage?.replace("_", " ") || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {m.home_team?.houses?.name || m.home_team?.name || "TBD"}
                          {m.winner_team_id === m.home_team_id && (
                            <Trophy className="inline w-3.5 h-3.5 text-warning ml-1" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-center">
                              <Input
                                type="number"
                                className="w-16 text-center"
                                value={homeScore}
                                onChange={(e) => setHomeScore(e.target.value)}
                                placeholder="H"
                              />
                              <span className="text-muted-foreground">-</span>
                              <Input
                                type="number"
                                className="w-16 text-center"
                                value={awayScore}
                                onChange={(e) => setAwayScore(e.target.value)}
                                placeholder="A"
                              />
                            </div>
                          ) : (
                            <span className="font-display font-semibold">
                              {hasResult ? `${m.home_score} – ${m.away_score}` : "— – —"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {m.away_team?.houses?.name || m.away_team?.name || "TBD"}
                          {m.winner_team_id === m.away_team_id && (
                            <Trophy className="inline w-3.5 h-3.5 text-warning ml-1" />
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleSaveResult(m.id, m.home_team_id, m.away_team_id)}
                                disabled={recordResult.isPending}
                              >
                                <Save className="w-3.5 h-3.5 mr-1" />
                                {recordResult.isPending ? "…" : "Save"}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingMatch(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingMatch(m.id);
                                setHomeScore(m.home_score?.toString() ?? "");
                                setAwayScore(m.away_score?.toString() ?? "");
                              }}
                            >
                              {hasResult ? "Edit" : "Enter Score"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      )}

      {/* Standings Table */}
      {standings && standings.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Standings</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">P</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">GD</TableHead>
                  <TableHead className="text-center">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((s: any, idx: number) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {s.team?.houses?.color && (
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.team.houses.color }}
                          />
                        )}
                        {s.team?.houses?.name || s.team?.name || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{s.played ?? 0}</TableCell>
                    <TableCell className="text-center">{s.won ?? 0}</TableCell>
                    <TableCell className="text-center">{s.drawn ?? 0}</TableCell>
                    <TableCell className="text-center">{s.lost ?? 0}</TableCell>
                    <TableCell className="text-center">{s.goal_diff ?? 0}</TableCell>
                    <TableCell className="text-center font-display font-bold">{s.points ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
