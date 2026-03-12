import { motion } from "framer-motion";
import { Trophy, Star, TrendingUp, Award } from "lucide-react";
import { useCertifications } from "@/hooks/useCertifications";
import { useSportScores } from "@/hooks/useSportScores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const levelColors: Record<string, string> = {
  advanced: "bg-primary/20 text-primary",
  expert: "bg-accent/20 text-accent",
  master: "bg-success/20 text-success",
};

export default function HallOfAthletes() {
  const currentYear = new Date().getFullYear();
  const { data: certifications } = useCertifications(currentYear);
  const { data: scores } = useSportScores();

  const masters = certifications?.filter(c => c.status === "issued" && c.proficiency_level === "master") || [];
  const experts = certifications?.filter(c => c.status === "issued" && c.proficiency_level === "expert") || [];

  // Rising talents: high scores not yet certified
  const certifiedKeys = new Set(certifications?.map(c => `${c.student_tr}-${c.sport_id}`) || []);
  const risingTalents = scores
    ?.filter(s => s.total_score >= 41 && !certifiedKeys.has(`${s.student_tr}-${s.sport_id}`))
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 10) || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="text-center py-6">
        <Trophy className="w-12 h-12 mx-auto text-primary mb-3" />
        <h1 className="text-3xl font-display font-bold text-foreground">Hall of Athletes</h1>
        <p className="text-muted-foreground mt-2">Celebrating excellence in sports — {currentYear}</p>
      </motion.div>

      {/* Masters */}
      {masters.length > 0 && (
        <motion.div variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-success" /> Master Athletes
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {masters.map(c => (
              <Card key={c.id} className="glass-card border-success/30 overflow-hidden">
                <CardContent className="p-5 text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-success" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg">{c.profiles?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{c.sports?.name}</p>
                  <Badge variant="secondary" className="bg-success/20 text-success capitalize">Master · {c.score_snapshot}/100</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Experts */}
      {experts.length > 0 && (
        <motion.div variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" /> Expert Athletes
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map(c => (
              <Card key={c.id} className="glass-card border-accent/20 overflow-hidden">
                <CardContent className="p-5 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-foreground">{c.profiles?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{c.sports?.name}</p>
                  <Badge variant="secondary" className="bg-accent/20 text-accent capitalize">Expert · {c.score_snapshot}/100</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Rising Talents */}
      {risingTalents.length > 0 && (
        <motion.div variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Rising Talents
          </h2>
          <Card className="glass-card overflow-hidden">
            <div className="divide-y divide-border/50">
              {risingTalents.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-4 px-4 py-3">
                  <span className="w-6 text-center text-xs font-mono text-muted-foreground">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{s.sports?.name}</p>
                  </div>
                  <span className="font-display font-bold text-foreground">{s.total_score}</span>
                  <Badge variant="secondary" className={cn("text-[10px] capitalize", levelColors[s.proficiency_level])}>{s.proficiency_level}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {!masters.length && !experts.length && !risingTalents.length && (
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No athletes to display yet. Scores and certifications will appear here once generated.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
