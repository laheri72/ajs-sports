import { useState, useEffect, useMemo } from "react";
import { ClipboardList, Filter, Save, SendHorizonal, Lock, Unlock, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useSeasons, useSports, useEventCategories } from "@/hooks/useSelectionFilters";
import { useEligibleStudents } from "@/hooks/useEligibleStudents";
import { useStudentSelections, useEventQuota, useSaveDraft, useSubmitFinal, useToggleAdminLock } from "@/hooks/useStudentSelections";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { useHouses } from "@/hooks/useHouses";
import AdminRoleDialog from "@/components/captain/AdminRoleDialog";

export default function CaptainSelection() {
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [sportId, setSportId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [adminHouseId, setAdminHouseId] = useState<string | null>(null);
  const [draftSlots, setDraftSlots] = useState<Record<number, string | null>>({});
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const { data: profile } = useProfile();
  const { isAdmin } = useIsAdmin();
  const { data: seasons, isLoading: seasonsLoading } = useSeasons();
  const { data: sports, isLoading: sportsLoading } = useSports();
  const { data: houses } = useHouses();
  const activeSeason = seasons?.find((s) => s.is_active);
  const effectiveSeasonId = seasonId ?? activeSeason?.id ?? null;
  const { data: categories, isLoading: categoriesLoading } = useEventCategories(sportId, effectiveSeasonId);

  // For admins, use the selected house; for captains, use their own house
  const effectiveHouseId = isAdmin ? adminHouseId : profile?.house_id ?? null;

  const { data: students } = useEligibleStudents(effectiveHouseId);

  const filtersComplete = effectiveSeasonId && sportId && category && effectiveHouseId;

  const { data: existingSelections, isLoading: selectionsLoading } = useStudentSelections(
    effectiveSeasonId,
    sportId,
    category,
    effectiveHouseId
  );
  const { data: quota } = useEventQuota(sportId, effectiveSeasonId, category);
  const saveDraft = useSaveDraft();
  const submitFinal = useSubmitFinal();
  const toggleLock = useToggleAdminLock();

  const slotCount = quota ?? 10;
  const isLocked = existingSelections?.some((s) => s.is_locked) ?? false;
  const isFinal = existingSelections?.some((s) => s.is_final) ?? false;
  const isReadOnly = (!isAdmin && (isLocked || isFinal));

  // Initialize draft slots from existing data
  useEffect(() => {
    if (existingSelections) {
      const map: Record<number, string | null> = {};
      existingSelections.forEach((s) => {
        map[s.rank] = s.student_tr ? String(s.student_tr) : null;
      });
      setDraftSlots(map);
    } else {
      setDraftSlots({});
    }
  }, [existingSelections]);

  // Students already assigned in current draft (prevent duplicates)
  const assignedStudentIds = useMemo(() => {
    return new Set(Object.values(draftSlots).filter(Boolean) as string[]);
  }, [draftSlots]);

  const handleSlotChange = (rank: number, studentId: string | null) => {
    setDraftSlots((prev) => ({ ...prev, [rank]: studentId }));
  };

  const handleSaveDraft = () => {
    if (!effectiveSeasonId || !sportId || !category || !effectiveHouseId || !profile) return;
    const slots = Array.from({ length: slotCount }, (_, i) => ({
      rank: i + 1,
      studentId: draftSlots[i + 1] ?? null,
    }));
    saveDraft.mutate({ seasonId: effectiveSeasonId, sportId, category, houseId: effectiveHouseId, createdBy: profile.tr_number, slots });
  };

  const handleSubmitFinal = () => {
    if (!effectiveSeasonId || !sportId || !category || !effectiveHouseId || !profile) return;
    const slots = Array.from({ length: slotCount }, (_, i) => ({
      rank: i + 1,
      studentId: draftSlots[i + 1] ?? null,
    }));
    saveDraft.mutate(
      { seasonId: effectiveSeasonId, sportId, category, houseId: effectiveHouseId, createdBy: profile.tr_number, slots },
      {
        onSuccess: () => {
          submitFinal.mutate({ seasonId: effectiveSeasonId!, sportId: sportId!, category: category!, houseId: effectiveHouseId! });
        },
      }
    );
  };

  const handleToggleLock = () => {
    if (!effectiveSeasonId || !sportId || !category || !effectiveHouseId) return;
    toggleLock.mutate({
      seasonId: effectiveSeasonId,
      houseId: effectiveHouseId,
      sportId,
      category,
      locked: !isLocked,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-accent" />
            Student Selection
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Select students for {isAdmin ? "any house's" : "your house"} sports entries
          </p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => setRoleDialogOpen(true)}>
            <Users className="w-4 h-4 mr-1" />
            Manage Captains
          </Button>
        )}
      </div>

      {/* Status badges */}
      {filtersComplete && (
        <div className="flex gap-2 flex-wrap">
          {isLocked && (
            <Badge variant="destructive" className="text-xs gap-1">
              <Lock className="w-3 h-3" /> Locked by Admin
            </Badge>
          )}
          {isFinal && !isLocked && (
            <Badge className="text-xs gap-1 bg-primary">
              <ShieldCheck className="w-3 h-3" /> Final Submission
            </Badge>
          )}
        </div>
      )}

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 gap-4 ${isAdmin ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
            {/* Admin house selector */}
            {isAdmin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">House</label>
                <Select value={adminHouseId ?? ""} onValueChange={(v) => setAdminHouseId(v)}>
                  <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                  <SelectContent>
                    {houses?.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                          {h.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Season</label>
              {seasonsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={effectiveSeasonId ?? ""} onValueChange={(v) => setSeasonId(v)}>
                  <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                  <SelectContent>
                    {seasons?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.is_active ? "(Active)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Sport</label>
              {sportsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={sportId ?? ""}
                  onValueChange={(v) => { setSportId(v); setCategory(null); }}
                >
                  <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                  <SelectContent>
                    {sports?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              {categoriesLoading && sportId ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={category ?? ""}
                  onValueChange={(v) => setCategory(v)}
                  disabled={!sportId || !categories?.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!sportId ? "Select sport first" : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Lock */}
      {isAdmin && filtersComplete && existingSelections && existingSelections.length > 0 && (
        <Card className="glass-card">
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              {isLocked ? <Lock className="w-4 h-4 text-destructive" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
              <span className="font-medium">Admin Lock</span>
              <span className="text-muted-foreground">— Prevent captains from editing</span>
            </div>
            <Switch checked={isLocked} onCheckedChange={handleToggleLock} />
          </CardContent>
        </Card>
      )}

      {/* No house selected message for admins */}
      {isAdmin && !effectiveHouseId && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a house to view and manage student selections.
          </CardContent>
        </Card>
      )}

      {/* Selection Table */}
      {effectiveHouseId && (
        <Card className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filtersComplete ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Select all filters to view the selection table.
                  </TableCell>
                </TableRow>
              ) : selectionsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : (
                Array.from({ length: slotCount }, (_, i) => i + 1).map((rank) => {
                  const selectedId = draftSlots[rank] ?? null;
                  const student = students?.find((s) => String(s.tr_number) === selectedId);

                  return (
                    <TableRow key={rank}>
                      <TableCell className="font-mono text-muted-foreground">{rank}</TableCell>
                      <TableCell>
                        {isReadOnly ? (
                          <span className="font-medium">{student?.full_name ?? "—"}</span>
                        ) : (
                          <Select
                            value={selectedId ?? "empty"}
                            onValueChange={(v) => handleSlotChange(rank, v === "empty" ? null : v)}
                          >
                            <SelectTrigger className="w-full max-w-[240px]">
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="empty">— Empty —</SelectItem>
                              {students?.map((s) => {
                                const val = String(s.tr_number);
                                const taken = assignedStudentIds.has(val) && val !== selectedId;
                                return (
                                  <SelectItem key={val} value={val} disabled={taken}>
                                    {s.full_name || "Unnamed"} {taken ? "(assigned)" : ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>{student?.class_name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">Eligible</Badge>
                      </TableCell>
                      <TableCell>
                        {selectedId ? (
                          isFinal ? (
                            <Badge className="text-xs bg-primary">Final</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Draft</Badge>
                          )
                        ) : (
                          <Badge variant="secondary" className="text-xs opacity-50">Empty</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Action Buttons */}
      {filtersComplete && !isReadOnly && (
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saveDraft.isPending}
          >
            <Save className="w-4 h-4 mr-1" />
            {saveDraft.isPending ? "Saving…" : "Save Draft"}
          </Button>
          <Button
            onClick={handleSubmitFinal}
            disabled={submitFinal.isPending || saveDraft.isPending}
          >
            <SendHorizonal className="w-4 h-4 mr-1" />
            {submitFinal.isPending ? "Submitting…" : "Submit Final Selection"}
          </Button>
        </div>
      )}

      {/* Admin Role Dialog */}
      {isAdmin && (
        <AdminRoleDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen} />
      )}
    </div>
  );
}
