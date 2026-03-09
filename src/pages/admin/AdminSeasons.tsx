import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface SeasonForm {
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const empty: SeasonForm = { name: "", start_date: "", end_date: "", is_active: false };

export default function AdminSeasons() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<SeasonForm>(empty);

  const { data: seasons, isLoading } = useQuery({
    queryKey: ["admin-seasons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seasons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("seasons").update(form).eq("id", editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("seasons").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-seasons"] });
      toast.success(editing ? "Season updated" : "Season created");
      setOpen(false);
      setEditing(null);
      setForm(empty);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("seasons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-seasons"] });
      toast.success("Season deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (s: any) => {
    setEditing(s.id);
    setForm({ name: s.name, start_date: s.start_date || "", end_date: s.end_date || "", is_active: s.is_active });
    setOpen(true);
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> Seasons
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage competition seasons</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Season</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Season" : "New Season"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
              <Input placeholder="Season name (e.g. ASP 2026)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <span className="text-sm text-foreground">Active Season</span>
              </div>
              <Button type="submit" className="w-full" disabled={upsert.isPending}>
                {upsert.isPending ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : !seasons?.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No seasons yet. Create your first one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Name</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Start</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">End</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.start_date || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.end_date || "—"}</td>
                    <td className="px-5 py-3">
                      {s.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-3 flex gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this season?")) remove.mutate(s.id); }}
                        className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
