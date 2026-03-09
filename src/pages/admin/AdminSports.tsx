import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type SportType = Database["public"]["Enums"]["sport_type"];

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface SportForm {
  name: string;
  sport_type: SportType;
}

const empty: SportForm = { name: "", sport_type: "team" };

export default function AdminSports() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<SportForm>(empty);

  const { data: sports, isLoading } = useQuery({
    queryKey: ["admin-sports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("sports").update(form).eq("id", editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sports").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sports"] });
      toast.success(editing ? "Sport updated" : "Sport created");
      setOpen(false);
      setEditing(null);
      setForm(empty);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sports"] });
      toast.success("Sport deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (s: any) => {
    setEditing(s.id);
    setForm({ name: s.name, sport_type: s.sport_type });
    setOpen(true);
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" /> Sports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage sports disciplines</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Sport</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Sport" : "New Sport"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
              <Input placeholder="Sport name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <Select value={form.sport_type} onValueChange={(v) => setForm({ ...form, sport_type: v as SportType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
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
        ) : !sports?.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No sports yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Name</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Type</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sports.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${s.sport_type === "team" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                        {s.sport_type}
                      </span>
                    </td>
                    <td className="px-5 py-3 flex gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this sport?")) remove.mutate(s.id); }}
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
