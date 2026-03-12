import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Star, ChevronRight, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
const EXPERIENCE_OPTIONS = ["No experience", "Less than 1 year", "1-2 years", "3-5 years", "5+ years"];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const levelColors: Record<string, string> = {
  beginner: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-primary/20 text-primary border-primary/30",
  expert: "bg-accent/20 text-accent border-accent/30",
};

export default function SportAssessment() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [selectedSport, setSelectedSport] = useState<any>(null);
  const [assessForm, setAssessForm] = useState({
    experience_level: "",
    skill_rating: 3,
    years_of_practice: 0,
  });

  const { data: sports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: proficiencies } = useQuery({
    queryKey: ["my-proficiencies", profile?.tr_number],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_sport_proficiencies")
        .select("*, sports(name)")
        .eq("student_tr", profile!.tr_number);
      if (error) throw error;
      return data;
    },
  });

  const { data: assessments } = useQuery({
    queryKey: ["my-assessments", profile?.tr_number],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sport_self_assessments")
        .select("*")
        .eq("student_tr", profile!.tr_number);
      if (error) throw error;
      return data;
    },
  });

  const submitAssessment = useMutation({
    mutationFn: async () => {
      if (!profile || !selectedSport) return;

      // Upsert self-assessment
      const { error: assessError } = await supabase
        .from("sport_self_assessments")
        .upsert(
          [{
            student_tr: profile.tr_number,
            sport_id: selectedSport.id,
            experience_level: assessForm.experience_level,
            skill_rating: assessForm.skill_rating,
            years_of_practice: assessForm.years_of_practice,
          }],
          { onConflict: "student_tr,sport_id" }
        );
      if (assessError) throw assessError;

      // Compute level from assessment
      const computedLevel = computeLevel(assessForm.skill_rating, assessForm.years_of_practice) as "beginner" | "intermediate" | "advanced" | "expert";

      const { error: profError } = await supabase
        .from("student_sport_proficiencies")
        .upsert(
          [{
            student_tr: profile.tr_number,
            sport_id: selectedSport.id,
            level: computedLevel,
            source: "self",
          }],
          { onConflict: "student_tr,sport_id" }
        );
      if (profError) throw profError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-proficiencies"] });
      qc.invalidateQueries({ queryKey: ["my-assessments"] });
      toast.success("Assessment submitted!");
      setSelectedSport(null);
      setAssessForm({ experience_level: "", skill_rating: 3, years_of_practice: 0 });
    },
    onError: (e) => toast.error(e.message),
  });

  function computeLevel(rating: number, years: number): string {
    const score = rating + Math.min(years, 5);
    if (score >= 9) return "expert";
    if (score >= 6) return "advanced";
    if (score >= 3) return "intermediate";
    return "beginner";
  }

  const getProficiency = (sportId: string) => proficiencies?.find((p) => p.sport_id === sportId);
  const getAssessment = (sportId: string) => assessments?.find((a) => a.sport_id === sportId);

  const openAssessment = (sport: any) => {
    const existing = getAssessment(sport.id);
    if (existing) {
      setAssessForm({
        experience_level: existing.experience_level,
        skill_rating: existing.skill_rating,
        years_of_practice: existing.years_of_practice,
      });
    } else {
      setAssessForm({ experience_level: "", skill_rating: 3, years_of_practice: 0 });
    }
    setSelectedSport(sport);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> Sport Assessment
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Assess your skill level in each sport. Complete the quick questionnaire to set your proficiency.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sports?.map((sport) => {
          const prof = getProficiency(sport.id);
          const assessed = !!getAssessment(sport.id);
          return (
            <motion.div
              key={sport.id}
              variants={item}
              className="glass-card p-5 cursor-pointer hover:border-primary/40 transition-colors group"
              onClick={() => openAssessment(sport)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">{sport.name}</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-center gap-2">
                {prof ? (
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium border capitalize", levelColors[prof.level])}>
                    {prof.level}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground">
                    Not assessed
                  </span>
                )}
                {assessed && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-2 capitalize">{sport.sport_type} sport</p>
            </motion.div>
          );
        })}
      </div>

      {/* Assessment Dialog */}
      <Dialog open={!!selectedSport} onOpenChange={(o) => !o && setSelectedSport(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Assess: {selectedSport?.name}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitAssessment.mutate();
            }}
            className="space-y-5"
          >
            {/* Q1: Experience */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                How much experience do you have in {selectedSport?.name}?
              </label>
              <Select
                value={assessForm.experience_level}
                onValueChange={(v) => setAssessForm({ ...assessForm, experience_level: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Q2: Skill Rating */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Rate your skill level (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setAssessForm({ ...assessForm, skill_rating: n })}
                    className={cn(
                      "w-10 h-10 rounded-xl border text-sm font-bold transition-all",
                      assessForm.skill_rating >= n
                        ? "gradient-primary text-primary-foreground border-primary"
                        : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Years */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Years of practice
              </label>
              <Select
                value={String(assessForm.years_of_practice)}
                onValueChange={(v) => setAssessForm({ ...assessForm, years_of_practice: Number(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y === 0 ? "None" : `${y} year${y > 1 ? "s" : ""}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!assessForm.experience_level || submitAssessment.isPending}
            >
              {submitAssessment.isPending ? "Submitting..." : "Submit Assessment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
