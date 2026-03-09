import { motion } from "framer-motion";
import { User, Award, Star, MapPin, Calendar, Heart, Trophy, Swords, Medal } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useHouses } from "@/hooks/useHouses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const radarData = [
  { skill: "Speed", A: 0 },
  { skill: "Endurance", A: 0 },
  { skill: "Agility", A: 0 },
  { skill: "Strength", A: 0 },
  { skill: "Flexibility", A: 0 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function SportsProfile() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: houses } = useHouses();

  const houseName = houses?.find((h) => h.id === profile?.house_id)?.name || "No House";

  // Fetch latest fitness log for radar
  const { data: fitnessLog } = useQuery({
    queryKey: ["latest-fitness", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("fitness_logs")
        .select("*")
        .eq("student_id", profile!.id)
        .order("logged_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // Fetch achievements
  const { data: achievements } = useQuery({
    queryKey: ["achievements", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("student_id", profile!.id)
        .order("earned_at", { ascending: false });
      return data || [];
    },
  });

  // Participated events
  const { data: participations, isLoading: partsLoading } = useQuery({
    queryKey: ["my-participations", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participations")
        .select("id, status, event_id, season_id, events(name, is_team_event, sports(name)), seasons(name)")
        .eq("student_id", profile!.id)
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Match results via team_members → teams → matches
  const { data: myMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["my-matches", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      // Get teams this student is on
      const { data: memberships } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("student_id", profile!.id);
      if (!memberships?.length) return [];

      const teamIds = memberships.map((m) => m.team_id);
      const { data: matches, error } = await supabase
        .from("matches")
        .select(`
          id, home_score, away_score, stage, winner_team_id, home_team_id, away_team_id,
          events(name, sports(name)),
          home_team:home_team_id(name, houses:house_id(name, color)),
          away_team:away_team_id(name, houses:house_id(name, color))
        `)
        .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`)
        .not("home_score", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (matches || []).map((m: any) => {
        const isHome = teamIds.includes(m.home_team_id);
        const won = m.winner_team_id && teamIds.includes(m.winner_team_id);
        const lost = m.winner_team_id && !teamIds.includes(m.winner_team_id);
        return { ...m, isHome, won, lost, drawn: !m.winner_team_id };
      });
    },
  });

  // Career points
  const { data: careerPoints } = useQuery({
    queryKey: ["my-career-points", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase
        .from("point_transactions")
        .select("points, source")
        .eq("student_id", profile!.id);
      if (!data?.length) return { total: 0, placement: 0, participation: 0 };
      let total = 0, placement = 0, participation = 0;
      for (const p of data) {
        total += p.points;
        if (p.source === "placement") placement += p.points;
        if (p.source === "participation") participation += p.points;
      }
      return { total, placement, participation };
    },
  });

  const radar = fitnessLog
    ? [
        { skill: "Speed", A: Number(fitnessLog.speed) || 0 },
        { skill: "Endurance", A: Number(fitnessLog.endurance) || 0 },
        { skill: "Agility", A: Number(fitnessLog.agility) || 0 },
        { skill: "Strength", A: Number(fitnessLog.strength) || 0 },
        { skill: "Flexibility", A: Number(fitnessLog.flexibility) || 0 },
      ]
    : radarData;

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Athlete";
  const matchRecord = myMatches
    ? { w: myMatches.filter((m) => m.won).length, l: myMatches.filter((m) => m.lost).length, d: myMatches.filter((m) => m.drawn).length }
    : { w: 0, l: 0, d: 0 };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Profile Header */}
      <motion.div variants={item} className="glass-card p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
          <User className="w-12 h-12 text-primary-foreground" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-display font-bold text-foreground">{displayName}</h1>
          <div className="flex flex-wrap gap-3 mt-2 justify-center md:justify-start text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> House {houseName}</span>
            {profile?.age_category && (
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {profile.age_category}</span>
            )}
            {profile?.tr_number && (
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> TR: {profile.tr_number}</span>
            )}
          </div>
          <div className="flex gap-4 mt-4 justify-center md:justify-start">
            <div className="text-center">
              <p className="stat-number text-xl text-foreground">{careerPoints?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Career Pts</p>
            </div>
            <div className="text-center">
              <p className="stat-number text-xl text-foreground">{participations?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
            <div className="text-center">
              <p className="stat-number text-xl text-foreground">{matchRecord.w}W {matchRecord.d}D {matchRecord.l}L</p>
              <p className="text-xs text-muted-foreground">Match Record</p>
            </div>
            <div className="text-center">
              <p className="stat-number text-xl text-foreground">{achievements?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar */}
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-2">Fitness Radar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radar}>
              <PolarGrid stroke="hsl(222, 30%, 20%)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
              <Radar dataKey="A" stroke="hsl(174, 72%, 50%)" fill="hsl(174, 72%, 50%)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          {!fitnessLog && (
            <p className="text-xs text-muted-foreground text-center mt-2">No fitness data logged yet.</p>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> Achievements
          </h3>
          {(achievements || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No achievements earned yet. Compete to earn badges!</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {achievements!.map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-secondary/50 border border-border/30 text-center hover:border-primary/30 transition-colors">
                  <div className="text-3xl mb-2">{a.icon || "🏅"}</div>
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Participated Events */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" /> Events Participated
        </h2>
        <div className="glass-card overflow-hidden">
          {partsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !participations?.length ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No event participations recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Event</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Sport</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Season</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participations.map((p: any) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{p.events?.name || "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.events?.sports?.name || "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.seasons?.name || "—"}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="text-xs capitalize">{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Match History */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Swords className="w-4 h-4 text-accent" /> Match History
        </h2>
        <div className="glass-card overflow-hidden">
          {matchesLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !myMatches?.length ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No match history yet. Your results will appear here once matches are played.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Event</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Match</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium text-center">Score</th>
                    <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {myMatches.map((m: any) => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground">{m.events?.name || "—"}</td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {m.home_team?.houses?.name || "?"} vs {m.away_team?.houses?.name || "?"}
                      </td>
                      <td className="px-5 py-3 text-center font-display font-semibold">
                        {m.home_score} – {m.away_score}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            m.won ? "bg-success/10 text-success border-success/30" :
                            m.lost ? "bg-destructive/10 text-destructive border-destructive/30" :
                            "bg-warning/10 text-warning border-warning/30"
                          }`}
                        >
                          {m.won ? "Win" : m.lost ? "Loss" : "Draw"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
