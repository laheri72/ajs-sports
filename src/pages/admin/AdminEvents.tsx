import { useState } from "react";
import { motion } from "framer-motion";
import { Medal, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type EventLevel = Database["public"]["Enums"]["event_level"];

const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface EventForm {
  name: string;
  sport_id: string;
  season_id: string;
  level: EventLevel;
  is_team_event: boolean;
  quota_per_house: number;
  points_1st: number;
  points_2nd: number;
  points_3rd: number;
  points_4th: number;
  participation_points: number;
  top_8_points: number;
  age_group: string;
  playing_lineup: number;
  substitutes: number;
  reserved_u18: number;
  total_players: number;
  group_stage_desc: string;
  playoff_desc: string;
}

const emptyForm: EventForm = {
  name: "", sport_id: "", season_id: "", level: "standard",
  is_team_event: false, quota_per_house: 0,
  points_1st: 0, points_2nd: 0, points_3rd: 0, points_4th: 0,
  participation_points: 0, top_8_points: 0, age_group: "",
  playing_lineup: 0, substitutes: 0, reserved_u18: 0, total_players: 0,
  group_stage_desc: "", playoff_desc: "",
};

export default function AdminEvents() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);

  const { data: sports } = useQuery({
    queryKey: ["admin-sports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: seasons } = useQuery({
    queryKey: ["admin-seasons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seasons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, sports(name), seasons(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("events").update(form).eq("id", editing);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success(editing ? "Event updated" : "Event created");
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (ev: any) => {
    setEditing(ev.id);
    setForm({
      name: ev.name, sport_id: ev.sport_id, season_id: ev.season_id,
      level: ev.level || "standard", is_team_event: ev.is_team_event || false,
      quota_per_house: ev.quota_per_house || 0,
      points_1st: ev.points_1st || 0, points_2nd: ev.points_2nd || 0,
      points_3rd: ev.points_3rd || 0, points_4th: ev.points_4th || 0,
      participation_points: ev.participation_points || 0,
      top_8_points: ev.top_8_points || 0,
      age_group: ev.age_group || "",
      playing_lineup: ev.playing_lineup || 0, substitutes: ev.substitutes || 0,
      reserved_u18: ev.reserved_u18 || 0, total_players: ev.total_players || 0,
      group_stage_desc: ev.group_stage_desc || "", playoff_desc: ev.playoff_desc || "",
    });
    setOpen(true);
  };

  const set = (key: keyof EventForm, val: any) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Medal className="w-6 h-6 text-primary" /> Events
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage competition events</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(); }} className="space-y-4">
              <Input placeholder="Event name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Sport</label>
                  <Select value={form.sport_id} onValueChange={(v) => set("sport_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                    <SelectContent>{(sports || []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Season</label>
                  <Select value={form.season_id} onValueChange={(v) => set("season_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                    <SelectContent>{(seasons || []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Level</label>
                  <Select value={form.level} onValueChange={(v) => set("level", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prime">Prime</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Age Group</label>
                  <Input value={form.age_group} onChange={(e) => set("age_group", e.target.value)} placeholder="e.g. Open, U-18" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_team_event} onCheckedChange={(v) => set("is_team_event", v)} />
                <span className="text-sm text-foreground">Team Event</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Quota / House</label>
                  <Input type="number" value={form.quota_per_house} onChange={(e) => set("quota_per_house", +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Playing Lineup</label>
                  <Input type="number" value={form.playing_lineup} onChange={(e) => set("playing_lineup", +e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Substitutes</label>
                  <Input type="number" value={form.substitutes} onChange={(e) => set("substitutes", +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Reserved U-18</label>
                  <Input type="number" value={form.reserved_u18} onChange={(e) => set("reserved_u18", +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Total Players</label>
                  <Input type="number" value={form.total_players} onChange={(e) => set("total_players", +e.target.value)} />
                </div>
              </div>

              <h4 className="text-sm font-display font-semibold text-foreground pt-2">Points</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">1st Place</label>
                  <Input type="number" value={form.points_1st} onChange={(e) => set("points_1st", +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">2nd Place</label>
                  <Input type="number" value={form.points_2nd} onChange={(e) => set("points_2nd", +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">3rd Place</label>
                  <Input type="number" value={form.points_3rd} onChange={(e) => set("points_3rd", +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">4th Place</label>
                  <Input type="number" value={form.points_4th} onChange={(e) => set("points_4th", +e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Participation Points</label>
                  <Input type="number" value={form.participation_points} onChange={(e) => set("participation_points", +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Top 8 Points</label>
                  <Input type="number" value={form.top_8_points} onChange={(e) => set("top_8_points", +e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Group Stage Desc</label>
                  <Input value={form.group_stage_desc} onChange={(e) => set("group_stage_desc", e.target.value)} placeholder="e.g. Fastest, Best of 3" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Playoff Desc</label>
                  <Input value={form.playoff_desc} onChange={(e) => set("playoff_desc", e.target.value)} placeholder="e.g. Fastest, Best of 5" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={upsert.isPending || !form.sport_id || !form.season_id}>
                {upsert.isPending ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : !events?.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No events yet. Create seasons and sports first.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Event</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Sport</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Level</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Quota</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev: any) => (
                  <tr key={ev.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{ev.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{ev.sports?.name}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${ev.level === "prime" ? "bg-warning/20 text-warning" : "bg-secondary text-muted-foreground"}`}>
                        {ev.level}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{ev.quota_per_house}</td>
                    <td className="px-5 py-3 flex gap-2">
                      <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this event?")) remove.mutate(ev.id); }}
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
