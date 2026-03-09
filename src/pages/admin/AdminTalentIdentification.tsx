import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Search, Users, TrendingUp, BarChart3, Filter, Star, StarOff, ChevronUp, AlertTriangle, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAllInterests, useInterestAnalytics, useNeedsCoaching, useAdminUpdateInterest, InterestLevel } from "@/hooks/useSportsInterests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const levelColors: Record<string, string> = {
  curious: "bg-blue-500/20 text-blue-400",
  beginner: "bg-yellow-500/20 text-yellow-400",
  learning: "bg-primary/20 text-primary",
  active: "bg-accent/20 text-accent",
  competitive: "bg-success/20 text-success",
};

const confidenceColors: Record<string, string> = {
  low: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  high: "bg-success/20 text-success",
};

const LEVEL_ORDER: InterestLevel[] = ["curious", "beginner", "learning", "active", "competitive"];

function getNextLevel(current: InterestLevel): InterestLevel | null {
  const idx = LEVEL_ORDER.indexOf(current);
  return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
}

export default function AdminTalentIdentification() {
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [tab, setTab] = useState("all");

  const { data: sports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: interests, isLoading } = useAllInterests({
    sportId: sportFilter !== "all" ? sportFilter : undefined,
    interestLevel: levelFilter !== "all" ? levelFilter : undefined,
    talentOnly: tab === "talent",
  });

  const { data: analytics } = useInterestAnalytics();
  const { data: needsCoaching } = useNeedsCoaching();
  const adminUpdate = useAdminUpdateInterest();

  const totalInterests = interests?.length ?? 0;
  const beginnerCount = interests?.filter((i: any) => i.interest_level === "beginner" || i.interest_level === "curious").length ?? 0;
  const competitiveCount = interests?.filter((i: any) => i.interest_level === "competitive" || i.interest_level === "active").length ?? 0;
  const talentCount = interests?.filter((i: any) => i.is_identified_talent).length ?? 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" /> Talent Identification
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover student sports interests, identify beginners needing coaching, and spot potential athletes. Interests auto-update from competition data.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{totalInterests}</p>
              <p className="text-xs text-muted-foreground">Total Interests</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{needsCoaching?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Need Coaching</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{competitiveCount}</p>
              <p className="text-xs text-muted-foreground">Active/Competitive</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{talentCount}</p>
              <p className="text-xs text-muted-foreground">Identified Talent</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sports Demand Overview */}
      {analytics && analytics.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Sports Demand Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.map((a) => (
                  <div key={a.name} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-28 truncate">{a.name}</span>
                    <div className="flex-1 h-6 bg-secondary rounded-lg overflow-hidden flex">
                      {(["curious", "beginner", "learning", "active", "competitive"] as const).map((lvl) => {
                        const count = a[lvl];
                        if (!count) return null;
                        const pct = (count / a.total) * 100;
                        return (
                          <div
                            key={lvl}
                            className={cn("h-full flex items-center justify-center text-[10px] font-bold", levelColors[lvl])}
                            style={{ width: `${pct}%`, minWidth: count ? "20px" : 0 }}
                            title={`${lvl}: ${count}`}
                          >
                            {count}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 w-20">
                      <span className="text-xs text-muted-foreground font-mono w-8 text-right">{a.total}</span>
                      {a.identified > 0 && (
                        <span className="text-[10px] text-accent flex items-center gap-0.5">
                          <Star className="w-3 h-3" />{a.identified}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4 flex-wrap">
                {(["curious", "beginner", "learning", "active", "competitive"] as const).map((lvl) => (
                  <span key={lvl} className={cn("px-2 py-0.5 rounded text-[10px] font-medium capitalize", levelColors[lvl])}>
                    {lvl}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs: All / Needs Coaching / Identified Talent */}
      <motion.div variants={item}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Interests</TabsTrigger>
            <TabsTrigger value="coaching" className="gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Needs Coaching
              {needsCoaching && needsCoaching.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 text-[10px] px-1.5">{needsCoaching.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="talent" className="gap-1">
              <Star className="w-3.5 h-3.5" /> Identified Talent
            </TabsTrigger>
          </TabsList>

          {/* Filters (for "all" tab) */}
          {tab === "all" && (
            <Card className="glass-card mb-4">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filter:</span>
                  </div>
                  <Select value={sportFilter} onValueChange={setSportFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Sports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      {sports?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="curious">Curious</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="competitive">Competitive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <TabsContent value="all">
            <InterestTable
              data={interests}
              isLoading={isLoading}
              onUpgrade={(id, level) => {
                const next = getNextLevel(level);
                if (next) adminUpdate.mutate({ id, interest_level: next });
              }}
              onToggleTalent={(id, current) => adminUpdate.mutate({ id, is_identified_talent: !current })}
              isPending={adminUpdate.isPending}
            />
          </TabsContent>

          <TabsContent value="coaching">
            <Card className="glass-card mb-4">
              <CardContent className="py-3">
                <p className="text-sm text-muted-foreground">
                  Students with <strong>beginner/curious</strong> interest level and <strong>low confidence</strong>. These students may need coaching support to develop their skills.
                </p>
              </CardContent>
            </Card>
            <InterestTable
              data={needsCoaching}
              isLoading={false}
              onUpgrade={(id, level) => {
                const next = getNextLevel(level);
                if (next) adminUpdate.mutate({ id, interest_level: next });
              }}
              onToggleTalent={(id, current) => adminUpdate.mutate({ id, is_identified_talent: !current })}
              isPending={adminUpdate.isPending}
            />
          </TabsContent>

          <TabsContent value="talent">
            <InterestTable
              data={interests}
              isLoading={isLoading}
              onUpgrade={(id, level) => {
                const next = getNextLevel(level);
                if (next) adminUpdate.mutate({ id, interest_level: next });
              }}
              onToggleTalent={(id, current) => adminUpdate.mutate({ id, is_identified_talent: !current })}
              isPending={adminUpdate.isPending}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

function InterestTable({
  data,
  isLoading,
  onUpgrade,
  onToggleTalent,
  isPending,
}: {
  data: any[] | undefined;
  isLoading: boolean;
  onUpgrade: (id: string, currentLevel: InterestLevel) => void;
  onToggleTalent: (id: string, current: boolean) => void;
  isPending: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          No interests found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>House</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((i: any) => {
            const nextLevel = getNextLevel(i.interest_level);
            return (
              <TableRow key={i.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {i.is_identified_talent && <Star className="w-3.5 h-3.5 text-accent fill-accent flex-shrink-0" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">{i.profiles?.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{i.profiles?.class_name} · {i.profiles?.darajah}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{i.sports?.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-xs capitalize", levelColors[i.interest_level])}>
                    {i.interest_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-xs capitalize", confidenceColors[i.confidence_level])}>
                    {i.confidence_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground capitalize">{i.created_by}</span>
                </TableCell>
                <TableCell>
                  {i.profiles?.houses ? (
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i.profiles.houses.color }} />
                      {i.profiles.houses.name}
                    </span>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {nextLevel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={() => onUpgrade(i.id, i.interest_level)}
                        disabled={isPending}
                        title={`Upgrade to ${nextLevel}`}
                      >
                        <ChevronUp className="w-3 h-3" /> {nextLevel}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn("h-7 text-xs", i.is_identified_talent ? "text-accent" : "text-muted-foreground")}
                      onClick={() => onToggleTalent(i.id, i.is_identified_talent)}
                      disabled={isPending}
                      title={i.is_identified_talent ? "Remove talent flag" : "Mark as talent"}
                    >
                      {i.is_identified_talent ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
