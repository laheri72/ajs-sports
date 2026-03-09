import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface HizbForm {
  name: string;
  house_id: string;
}

const empty: HizbForm = { name: "", house_id: "" };

export default function AdminHizb() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<HizbForm>(empty);

  const { data: houses } = useQuery({
    queryKey: ["houses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("houses").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: hizbList, isLoading } = useQuery({
    queryKey: ["admin-hizb"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hizb").select("*, houses(name, color)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("hizb").update(form).eq("id", editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hizb").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hizb"] });
      toast.success(editing ? "Hizb updated" : "Hizb created");
      setOpen(false);
      setEditing(null);
      setForm(empty);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hizb").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hizb"] });
      toast.success("Hizb deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (h: any) => {
    setEditing(h.id);
    setForm({ name: h.name, house_id: h.house_id });
    setOpen(true);
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Hizb Teams
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage hizb sub-teams within houses</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Hizb</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Hizb" : "New Hizb"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
              <Input placeholder="Hizb name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">House</label>
                <Select value={form.house_id} onValueChange={(v) => setForm({ ...form, house_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                  <SelectContent>
                    {(houses || []).map((h) => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={upsert.isPending || !form.house_id}>
                {upsert.isPending ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : !hizbList?.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No hizb teams yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Name</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">House</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hizbList.map((h: any) => (
                  <tr key={h.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{h.name}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: h.houses?.color }} />
                        <span className="text-muted-foreground">{h.houses?.name}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 flex gap-2">
                      <button onClick={() => openEdit(h)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this hizb?")) remove.mutate(h.id); }}
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
