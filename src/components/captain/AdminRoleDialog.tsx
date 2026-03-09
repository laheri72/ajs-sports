import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAssignRole, useRemoveRole } from "@/hooks/useManageRoles";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminRoleDialog({ open, onOpenChange }: Props) {
  const [houseId, setHouseId] = useState<string | null>(null);

  const { data: houses, isLoading: housesLoading } = useQuery({
    queryKey: ["houses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("houses")
        .select("id, name, color")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: membersWithRoles, isLoading: membersLoading } = useQuery({
    queryKey: ["house-members-roles", houseId],
    enabled: !!houseId,
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, user_id, full_name")
        .eq("house_id", houseId!)
        .order("full_name");
      if (pErr) throw pErr;

      const userIds = profiles.map((p) => p.user_id);
      if (!userIds.length) return [];

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds)
        .in("role", ["captain", "co_captain"]);
      if (rErr) throw rErr;

      return profiles.map((p) => ({
        ...p,
        roles: roles.filter((r) => r.user_id === p.user_id).map((r) => r.role) as string[],
      }));
    },
  });

  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const handleToggle = (userId: string, role: "captain" | "co_captain", hasRole: boolean) => {
    if (hasRole) {
      removeRole.mutate({ userId, role });
    } else {
      assignRole.mutate({ userId, role });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Captains & Co-Captains</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">House</label>
            {housesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={houseId ?? ""} onValueChange={(v) => setHouseId(v)}>
                <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                <SelectContent>
                  {houses?.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {houseId && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Captain</TableHead>
                  <TableHead>Co-Captain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : !membersWithRoles?.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No members in this house.
                    </TableCell>
                  </TableRow>
                ) : (
                  membersWithRoles.map((m) => {
                    const isCaptain = m.roles.includes("captain");
                    const isCoCaptain = m.roles.includes("co_captain");
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.full_name || "Unnamed"}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={isCaptain ? "default" : "outline"}
                            onClick={() => handleToggle(m.user_id, "captain", isCaptain)}
                            disabled={assignRole.isPending || removeRole.isPending}
                          >
                            {isCaptain ? "Remove" : "Assign"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={isCoCaptain ? "default" : "outline"}
                            onClick={() => handleToggle(m.user_id, "co_captain", isCoCaptain)}
                            disabled={assignRole.isPending || removeRole.isPending}
                          >
                            {isCoCaptain ? "Remove" : "Assign"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
