import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ChevronRight, Check, Sparkles, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyInterests, useUpsertInterest, useDeleteInterest, InterestLevel, ConfidenceLevel } from "@/hooks/useSportsInterests";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const INTEREST_LEVELS: { value: InterestLevel; label: string; desc: string; color: string }[] = [
  { value: "curious", label: "Curious", desc: "I want to know more about this sport", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "beginner", label: "Beginner", desc: "I want to learn this sport", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "learning", label: "Learning", desc: "I am actively trying to learn", color: "bg-primary/20 text-primary border-primary/30" },
  { value: "active", label: "Active", desc: "I actively play this sport", color: "bg-accent/20 text-accent border-accent/30" },
  { value: "competitive", label: "Competitive", desc: "I compete in this sport", color: "bg-success/20 text-success border-success/30" },
];

const CONFIDENCE_LEVELS: { value: ConfidenceLevel; label: string; desc: string }[] = [
  { value: "low", label: "Low", desc: "I'm unsure about my ability" },
  { value: "medium", label: "Medium", desc: "I believe I can play" },
  { value: "high", label: "High", desc: "I'm confident in this sport" },
];

export default function SportsInterests() {
  const [selectedSport, setSelectedSport] = useState<any>(null);
  const [form, setForm] = useState({ interest_level: "" as InterestLevel | "", confidence_level: "" as ConfidenceLevel | "", notes: "" });

  const { data: sports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: interests } = useMyInterests();
  const upsert = useUpsertInterest();
  const remove = useDeleteInterest();

  const getInterest = (sportId: string) => interests?.find((i) => i.sport_id === sportId);

  const openForm = (sport: any) => {
    const existing = getInterest(sport.id);
    if (existing) {
      setForm({ interest_level: existing.interest_level, confidence_level: existing.confidence_level, notes: existing.notes || "" });
    } else {
      setForm({ interest_level: "", confidence_level: "", notes: "" });
    }
    setSelectedSport(sport);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.interest_level || !form.confidence_level || !selectedSport) return;
    upsert.mutate(
      { sport_id: selectedSport.id, interest_level: form.interest_level as InterestLevel, confidence_level: form.confidence_level as ConfidenceLevel, notes: form.notes },
      { onSuccess: () => setSelectedSport(null) }
    );
  };

  const getLevelInfo = (level: string) => INTEREST_LEVELS.find((l) => l.value === level);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" /> My Sports Interests
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Explore sports and tell us what you're interested in. This helps the Sports Department identify talent and create opportunities.
        </p>
      </motion.div>

      {/* Current interests summary */}
      {interests && interests.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Your declared interests ({interests.length})</h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((i) => {
              const level = getLevelInfo(i.interest_level);
              return (
                <span key={i.id} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5", level?.color)}>
                  {(i as any).sports?.name}
                  <span className="opacity-70">· {level?.label}</span>
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Browse all sports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sports?.map((sport) => {
          const interest = getInterest(sport.id);
          const level = interest ? getLevelInfo(interest.interest_level) : null;
          return (
            <motion.div
              key={sport.id}
              variants={item}
              className="glass-card p-5 cursor-pointer hover:border-primary/40 transition-colors group"
              onClick={() => openForm(sport)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">{sport.name}</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-center gap-2">
                {level ? (
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium border capitalize", level.color)}>
                    {level.label}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground">
                    Not declared
                  </span>
                )}
                {interest && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-2 capitalize">{sport.sport_type} sport</p>
            </motion.div>
          );
        })}
      </div>

      {/* Interest Form Dialog */}
      <Dialog open={!!selectedSport} onOpenChange={(o) => !o && setSelectedSport(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {selectedSport?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Interest Level */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">How interested are you?</label>
              <div className="space-y-2">
                {INTEREST_LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setForm({ ...form, interest_level: lvl.value })}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all text-sm",
                      form.interest_level === lvl.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="font-medium">{lvl.label}</span>
                    <span className="text-xs ml-2 opacity-70">— {lvl.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">How confident are you?</label>
              <div className="flex gap-2">
                {CONFIDENCE_LEVELS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm({ ...form, confidence_level: c.value })}
                    className={cn(
                      "flex-1 p-3 rounded-xl border text-center transition-all text-sm",
                      form.confidence_level === c.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <p className="font-medium">{c.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Notes (optional)</label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. I want to learn swimming but I have never trained before."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={!form.interest_level || !form.confidence_level || upsert.isPending}
              >
                {upsert.isPending ? "Saving..." : getInterest(selectedSport?.id) ? "Update Interest" : "Declare Interest"}
              </Button>
              {getInterest(selectedSport?.id) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const interest = getInterest(selectedSport.id);
                    if (interest) remove.mutate(interest.id, { onSuccess: () => setSelectedSport(null) });
                  }}
                  disabled={remove.isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
