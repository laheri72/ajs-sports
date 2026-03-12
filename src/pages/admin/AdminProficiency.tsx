import { useState } from "react";
import { motion } from "framer-motion";
import { Award, RefreshCw, Search, Filter, TrendingUp, Medal, Dumbbell, Activity, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSportScores, useRecalculateScores } from "@/hooks/useSportScores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const levelColors: Record<string, string> = {
  beginner: "bg-blue-500/20 text-blue-400",
  intermediate: "bg-yellow-500/20 text-yellow-400",
  advanced: "bg-primary/20 text-primary",
  expert: "bg-accent/20 text-accent",
  master: "bg-success/20 text-success",
};

const levelOrder: Record<string, number> = {
  beginner: 1, intermediate: 2, advanced: 3, expert: 4, master: 5,
};

const scoreBarColors: Record<string, string> = {
  competition: "bg-primary",
  club: "bg-accent",
  activity: "bg-warning",
  fitness: "bg-success",
};

export default function AdminProficiency() {
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data: scores, isLoading } = useSportScores(sportFilter);
  const recalculate = useRecalculateScores();

  const { data: sports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = scores?.filter((s) => {
    if (levelFilter !== "all" && s.proficiency_level !== levelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = (s.profiles?.full_name || "").toLowerCase();
      const tr = (s.profiles?.tr_number || "").toLowerCase();
      if (!name.includes(q) && !tr.includes(q)) return false;
    }
    return true;
  });

  // Summary stats
  const totalStudents = new Set(filtered?.map((s) => s.student_tr)).size;
  const avgScore = filtered?.length ? Math.round(filtered.reduce((sum, s) => sum + s.total_score, 0) / filtered.length) : 0;
  const masterCount = filtered?.filter((s) => s.proficiency_level === "master").length || 0;
  const expertCount = filtered?.filter((s) => s.proficiency_level === "expert").length || 0;

  // Group by sport for sport view
  const bySport: Record<string, typeof filtered> = {};
  filtered?.forEach((s) => {
    const sportName = s.sports?.name || "Unknown";
    if (!bySport[sportName]) bySport[sportName] = [];
    bySport[sportName]!.push(s);
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> Proficiency Engine
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Evaluate student sports development across all signals.</p>
        </div>
        <Button
          size="sm"
          onClick={() => recalculate.mutate()}
          disabled={recalculate.isPending}
          className="gap-1"
        >
          <RefreshCw className={cn("w-4 h-4", recalculate.isPending && "animate-spin")} />
          {recalculate.isPending ? "Calculating..." : "Recalculate All"}
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Students Scored</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{avgScore}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-success">{masterCount}</p>
            <p className="text-xs text-muted-foreground">Masters</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-accent">{expertCount}</p>
            <p className="text-xs text-muted-foreground">Experts</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div variants={item} className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary" /> Competition</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-accent" /> Club Activity</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-warning" /> Sports Buddy</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-success" /> Fitness</span>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {sports?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="master">Master</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Results */}
      {isLoading ? (
        <div className="glass-card p-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !filtered?.length ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No scores yet. Click "Recalculate All" to generate proficiency scores from platform activity.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="ranking">
          <TabsList>
            <TabsTrigger value="ranking" className="gap-1"><TrendingUp className="w-3 h-3" /> Ranking</TabsTrigger>
            <TabsTrigger value="by-sport" className="gap-1"><Dumbbell className="w-3 h-3" /> By Sport</TabsTrigger>
          </TabsList>

          {/* Ranking View */}
          <TabsContent value="ranking" className="mt-4">
            <Card className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium w-10">#</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Student</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Sport</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">House</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium w-[200px]">Score Breakdown</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium text-center">Total</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => (
                      <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{s.profiles?.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{s.profiles?.class_name} · {s.profiles?.darajah}</p>
                        </td>
                        <td className="px-4 py-3 text-sm">{s.sports?.name}</td>
                        <td className="px-4 py-3">
                          {s.profiles?.houses ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                              backgroundColor: `${s.profiles.houses.color}20`,
                              color: s.profiles.houses.color,
                            }}>
                              {s.profiles.houses.name}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <ScoreBar competition={s.competition_score} club={s.club_score} activity={s.activity_score} fitness={s.fitness_score} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-lg font-display font-bold text-foreground">{s.total_score}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className={cn("text-xs capitalize", levelColors[s.proficiency_level])}>
                            {s.proficiency_level}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* By Sport View */}
          <TabsContent value="by-sport" className="mt-4 space-y-6">
            {Object.entries(bySport)
              .sort(([, a], [, b]) => (b?.length || 0) - (a?.length || 0))
              .map(([sportName, sportScores]) => (
                <Card key={sportName} className="glass-card overflow-hidden">
                  <CardHeader className="pb-2 border-b border-border bg-secondary/30">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Medal className="w-4 h-4 text-primary" /> {sportName}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal">{sportScores?.length} students</span>
                    </CardTitle>
                  </CardHeader>
                  <div className="divide-y divide-border/50">
                    {sportScores?.slice(0, 10).map((s, idx) => (
                      <div key={s.id} className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors">
                        <span className="w-6 text-center text-xs font-mono text-muted-foreground">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{s.profiles?.full_name}</p>
                        </div>
                        {s.profiles?.houses && (
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.profiles.houses.color }} />
                        )}
                        <div className="w-24 flex-shrink-0">
                          <ScoreBar competition={s.competition_score} club={s.club_score} activity={s.activity_score} fitness={s.fitness_score} />
                        </div>
                        <span className="text-sm font-display font-bold text-foreground w-8 text-right">{s.total_score}</span>
                        <Badge variant="secondary" className={cn("text-[10px] capitalize flex-shrink-0", levelColors[s.proficiency_level])}>
                          {s.proficiency_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}

function ScoreBar({ competition, club, activity, fitness }: { competition: number; club: number; activity: number; fitness: number }) {
  const total = competition + club + activity + fitness;
  if (total === 0) return <div className="h-2 rounded-full bg-secondary" />;

  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-secondary gap-px" title={`Comp: ${competition} | Club: ${club} | Activity: ${activity} | Fitness: ${fitness}`}>
      {competition > 0 && <div className="bg-primary h-full" style={{ width: `${(competition / 100) * 100}%` }} />}
      {club > 0 && <div className="bg-accent h-full" style={{ width: `${(club / 100) * 100}%` }} />}
      {activity > 0 && <div className="bg-warning h-full" style={{ width: `${(activity / 100) * 100}%` }} />}
      {fitness > 0 && <div className="bg-success h-full" style={{ width: `${(fitness / 100) * 100}%` }} />}
    </div>
  );
}
