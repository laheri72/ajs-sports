import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonId: string;
  houseId: string;
  sportId: string;
  category: string;
  houseName: string;
  houseColor: string;
  sportName: string;
  isLocked: boolean;
  onToggleLock: (locked: boolean) => void;
  lockPending?: boolean;
}

export default function SelectionPreviewDialog({
  open,
  onOpenChange,
  seasonId,
  houseId,
  sportId,
  category,
  houseName,
  houseColor,
  sportName,
  isLocked,
  onToggleLock,
  lockPending,
}: Props) {
  const { data: selections, isLoading } = useQuery({
    queryKey: ["selection-preview", seasonId, houseId, sportId, category],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_selections")
        .select(`
          rank,
          student_id,
          is_final,
          is_locked,
          eligibility,
          profiles:student_id(full_name, class_name, darajah, is_under_18)
        `)
        .eq("season_id", seasonId)
        .eq("house_id", houseId)
        .eq("sport_id", sportId)
        .eq("category", category)
        .order("rank");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: houseColor }} />
            {houseName} — {sportName} ({category})
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !selections?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No students selected.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selections.map((s: any) => (
                <TableRow key={s.rank}>
                  <TableCell className="font-mono text-muted-foreground">{s.rank}</TableCell>
                  <TableCell className="font-medium">
                    {(s.profiles as any)?.full_name || "Unknown"}
                    {(s.profiles as any)?.is_under_18 && (
                      <Badge variant="outline" className="ml-2 text-[10px] px-1">U18</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(s.profiles as any)?.class_name || "—"}
                  </TableCell>
                  <TableCell>
                    {s.is_locked ? (
                      <Badge variant="destructive" className="text-[10px]">Locked</Badge>
                    ) : s.is_final ? (
                      <Badge className="text-[10px] bg-primary">Final</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          {isLocked ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleLock(false)}
              disabled={lockPending}
            >
              {lockPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Unlock className="w-4 h-4 mr-1" />}
              Unlock
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onToggleLock(true)}
              disabled={lockPending || !selections?.length || !selections.every((s: any) => s.is_final)}
            >
              {lockPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Lock className="w-4 h-4 mr-1" />}
              Lock Selection
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
