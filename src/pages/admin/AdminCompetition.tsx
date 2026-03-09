import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Play, Users, Swords, Trophy, BarChart3, Lock, Unlock, CheckCircle2, AlertCircle, ShieldCheck, Eye, Info, ChevronDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  useGenerateParticipations,
  useGenerateTeams,
  useGenerateFixtures,
  useGeneratePlayoffs,
  useComputeStandings,
} from "@/hooks/useCompetitionEngine";
import { useSelectionSummary } from "@/hooks/useSelectionSummary";
import { useToggleAdminLock } from "@/hooks/useStudentSelections";
import SelectionPreviewDialog from "@/components/admin/SelectionPreviewDialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AdminCompetition() {
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [previewGroup, setPreviewGroup] = useState<any>(null);
  const qc = useQueryClient();

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

  const genParticipations = useGenerateParticipations();
  const genTeams = useGenerateTeams();
  const genFixtures = useGenerateFixtures();
  const genPlayoffs = useGeneratePlayoffs();
  const computeStandings = useComputeStandings();
  const toggleLock = useToggleAdminLock();

  const anyPending =
    genParticipations.isPending || genTeams.isPending || genFixtures.isPending || genPlayoffs.isPending || computeStandings.isPending;

  const { data: selectionSummary } = useSelectionSummary(effectiveSeasonId);

  // Compute stats from summary
  const totalGroups = selectionSummary?.length ?? 0;
  const finalGroups = selectionSummary?.filter(s => s.final_count === s.total && s.total > 0).length ?? 0;
  const lockedGroups = selectionSummary?.filter(s => s.locked_count === s.total && s.total > 0).length ?? 0;
  const allLocked = totalGroups > 0 && lockedGroups === totalGroups;

  // Counts for display
  const { data: counts } = useQuery({
    queryKey: ["competition-counts", effectiveSeasonId],
    enabled: !!effectiveSeasonId,
    queryFn: async () => {
      const [parts, teams, matches, pts] = await Promise.all([
        supabase.from("participations").select("id", { count: "exact", head: true }).eq("season_id", effectiveSeasonId!),
        supabase.from("teams").select("id, event_id", { count: "exact", head: true }),
        supabase.from("matches").select("id", { count: "exact", head: true }).eq("season_id", effectiveSeasonId!),
        supabase.from("point_transactions").select("id", { count: "exact", head: true }).eq("season_id", effectiveSeasonId!),
      ]);
      return {
        participations: parts.count || 0,
        teams: teams.count || 0,
        matches: matches.count || 0,
        points: pts.count || 0,
      };
    },
  });

  const handleBulkLock = async (lock: boolean) => {
    if (!selectionSummary || !effectiveSeasonId) return;
    const targets = selectionSummary.filter(s => 
      lock ? (s.final_count === s.total && s.locked_count < s.total) : (s.locked_count > 0)
    );
    
    for (const t of targets) {
      await supabase
        .from("student_selections")
        .update({ is_locked: lock })
        .eq("season_id", effectiveSeasonId)
        .eq("house_id", t.house_id)
        .eq("sport_id", t.sport_id)
        .eq("category", t.category);
    }
    qc.invalidateQueries({ queryKey: ["selection-summary"] });
    qc.invalidateQueries({ queryKey: ["student-selections"] });
    toast.success(lock ? `Locked ${targets.length} selection groups` : `Unlocked ${targets.length} selection groups`);
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
          <Zap className="w-6 h-6 text-primary" /> Competition Engine
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Review selections, then generate participations, teams, fixtures and compute standings</p>
      </motion.div>

      {/* Pipeline Tutorial */}
      <motion.div variants={item}>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between gap-2 text-left h-auto py-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Info className="w-4 h-4 text-primary" />
                How does the competition pipeline work?
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="glass-card mt-3">
              <CardContent className="py-5 space-y-5 text-sm">
                <p className="text-muted-foreground">
                  The competition engine runs as a sequential pipeline. Each step builds on the output of the previous one. All steps are <strong>idempotent</strong> — safe to re-run without creating duplicates.
                </p>

                <div className="space-y-4">
                  {/* Step 0 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Step 0: Review & Lock Selections</p>
                      <p className="text-muted-foreground mt-1">
                        Captains submit their final rosters for each sport/category. As an admin, you can <strong>Preview</strong> each group to inspect the player list (name, class, rank, eligibility). Once satisfied, <strong>Lock</strong> the group to freeze it — captains can no longer edit locked selections. Only locked selections proceed to Step 1.
                      </p>
                    </div>
                  </div>

                  {/* Step 1 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Step 1: Generate Participations</p>
                      <p className="text-muted-foreground mt-1">
                        Takes each locked selection and matches it to the correct <strong>event</strong> (based on sport + category/age group). Creates a <em>participation</em> record linking each student to their event, season, and house. Skips any student already registered for that event.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Step 2: Generate Teams</p>
                      <p className="text-muted-foreground mt-1">
                        For each <strong>team event</strong>, groups participations by house. Creates a team per house per event, then assigns students as <strong>players</strong> (up to the playing lineup limit) or <strong>substitutes</strong>. Skips houses/events that already have teams.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Swords className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Step 3: Generate Fixtures</p>
                      <p className="text-muted-foreground mt-1">
                        Creates <strong>round-robin</strong> group stage matches — every team plays every other team once. Also initializes the <em>standings table</em> (P / W / L / D / GD / Pts all set to 0). Skips events that already have matches. After this, go to <strong>Results Entry</strong> to record match scores.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Trophy className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Step 4: Compute Standings & Points</p>
                      <p className="text-muted-foreground mt-1">
                        Once all matches are played and scored, this step ranks teams by <strong>points → goal difference</strong>. It then awards <strong>house points</strong> based on placement (1st–4th place points from event config) plus participation points. These are stored as point transactions in the house ledger. Run this only after all results are entered.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  <strong>Tip:</strong> The typical flow is: Lock → Generate Participations → Generate Teams → Generate Fixtures → Enter Results (in Results Entry page) → Compute Standings.
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </motion.div>

      {/* Season Selector */}
      <motion.div variants={item}>
        <Card className="glass-card">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Season</label>
              <Select value={effectiveSeasonId ?? ""} onValueChange={setSeasonId}>
                <SelectTrigger className="max-w-xs">
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Step 0: Review & Lock Selections */}
      {effectiveSeasonId && (
        <motion.div variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            Step 0: Review & Lock Selections
          </h2>
          <p className="text-sm text-muted-foreground">
            Captains submit final selections → Admin reviews and locks them → Then generate participations.
          </p>
          
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="glass-card">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-display font-bold text-foreground">{totalGroups}</p>
                <p className="text-xs text-muted-foreground">Total Groups</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-display font-bold text-foreground">{finalGroups}</p>
                <p className="text-xs text-muted-foreground">Finalized</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-display font-bold text-foreground">{lockedGroups}</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </CardContent>
            </Card>
          </div>

          {/* Bulk actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkLock(true)}
              disabled={finalGroups === 0 || allLocked}
            >
              <Lock className="w-4 h-4 mr-1" />
              Lock All Finalized
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkLock(false)}
              disabled={lockedGroups === 0}
            >
              <Unlock className="w-4 h-4 mr-1" />
              Unlock All
            </Button>
          </div>

          {/* Selection summary table */}
          {selectionSummary && selectionSummary.length > 0 ? (
            <Card className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>House</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Players</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectionSummary.map((s, i) => {
                    const isFinal = s.final_count === s.total && s.total > 0;
                    const isLockedGroup = s.locked_count === s.total && s.total > 0;
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.house_color }} />
                            {s.house_name}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{s.sport_name}</TableCell>
                        <TableCell className="text-sm">{s.category}</TableCell>
                        <TableCell className="text-center font-mono">{s.total}</TableCell>
                        <TableCell className="text-center">
                          {isLockedGroup ? (
                            <Badge variant="destructive" className="text-xs gap-1">
                              <Lock className="w-3 h-3" /> Locked
                            </Badge>
                          ) : isFinal ? (
                            <Badge className="text-xs gap-1 bg-primary">
                              <CheckCircle2 className="w-3 h-3" /> Final
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <AlertCircle className="w-3 h-3" /> Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => setPreviewGroup(s)}
                            >
                              <Eye className="w-3 h-3 mr-1" /> Preview
                            </Button>
                            {isFinal && !isLockedGroup && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => toggleLock.mutate({
                                  seasonId: effectiveSeasonId!,
                                  houseId: s.house_id,
                                  sportId: s.sport_id,
                                  category: s.category,
                                  locked: true,
                                })}
                              >
                                <Lock className="w-3 h-3 mr-1" /> Lock
                              </Button>
                            )}
                            {isLockedGroup && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => toggleLock.mutate({
                                  seasonId: effectiveSeasonId!,
                                  houseId: s.house_id,
                                  sportId: s.sport_id,
                                  category: s.category,
                                  locked: false,
                                })}
                              >
                                <Unlock className="w-3 h-3 mr-1" /> Unlock
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="py-8 text-center text-muted-foreground">
                No selections found for this season. Captains need to submit selections first.
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Status Counts */}
      {effectiveSeasonId && (
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{counts?.participations ?? 0}</p>
                <p className="text-xs text-muted-foreground">Participations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Users className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{counts?.teams ?? 0}</p>
                <p className="text-xs text-muted-foreground">Teams</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center">
                <Swords className="w-5 h-5 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{counts?.matches ?? 0}</p>
                <p className="text-xs text-muted-foreground">Matches</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{counts?.points ?? 0}</p>
                <p className="text-xs text-muted-foreground">Point Txns</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generation Pipeline */}
      {effectiveSeasonId && (
        <motion.div variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-semibold text-foreground">Pipeline Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  Step 1: Generate Participations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Map final <strong>locked</strong> selections to event participations. Lock selections in Step 0 first.
                </p>
                {!allLocked && lockedGroups === 0 && (
                  <p className="text-xs text-warning mb-2">⚠ No locked selections yet. Lock selections above first.</p>
                )}
                <Button
                  size="sm"
                  onClick={() => genParticipations.mutate(effectiveSeasonId!)}
                  disabled={anyPending || lockedGroups === 0}
                >
                  {genParticipations.isPending ? "Generating…" : "Generate Participations"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  Step 2: Generate Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Create team rosters for team events from participations. Respects lineup limits.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => genTeams.mutate(effectiveSeasonId!)}
                  disabled={anyPending}
                >
                  {genTeams.isPending ? "Generating…" : "Generate Teams"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Swords className="w-4 h-4 text-success" />
                  Step 3: Generate Fixtures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Create round-robin group stage match fixtures and initialize standings.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => genFixtures.mutate(effectiveSeasonId!)}
                  disabled={anyPending}
                >
                  {genFixtures.isPending ? "Generating…" : "Generate Fixtures"}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Step 3.5: Generate Playoffs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Generate semifinal, final &amp; third place bracket from group standings. Run after all group matches are scored.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => genPlayoffs.mutate(effectiveSeasonId!)}
                  disabled={anyPending}
                >
                  {genPlayoffs.isPending ? "Generating…" : "Generate Playoff Bracket"}
                </Button>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-warning" />
                  Step 4: Compute Standings & Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Calculate placements and award house points based on event configuration.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => computeStandings.mutate(effectiveSeasonId!)}
                  disabled={anyPending}
                >
                  {computeStandings.isPending ? "Computing…" : "Compute Standings"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Selection Preview Dialog */}
      {previewGroup && effectiveSeasonId && (
        <SelectionPreviewDialog
          open={!!previewGroup}
          onOpenChange={(open) => !open && setPreviewGroup(null)}
          seasonId={effectiveSeasonId}
          houseId={previewGroup.house_id}
          sportId={previewGroup.sport_id}
          category={previewGroup.category}
          houseName={previewGroup.house_name}
          houseColor={previewGroup.house_color}
          sportName={previewGroup.sport_name}
          isLocked={previewGroup.locked_count === previewGroup.total && previewGroup.total > 0}
          lockPending={toggleLock.isPending}
          onToggleLock={(locked) => {
            toggleLock.mutate({
              seasonId: effectiveSeasonId,
              houseId: previewGroup.house_id,
              sportId: previewGroup.sport_id,
              category: previewGroup.category,
              locked,
            }, {
              onSuccess: () => setPreviewGroup(null),
            });
          }}
        />
      )}
    </motion.div>
  );
}
