import { motion } from "framer-motion";
import { Calendar, Dumbbell, Medal, Users, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/dashboard/StatCard";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AdminOverview() {
  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [seasons, sports, events, hizb, profiles] = await Promise.all([
        supabase.from("seasons").select("id", { count: "exact", head: true }),
        supabase.from("sports").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("hizb").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        seasons: seasons.count || 0,
        sports: sports.count || 0,
        events: events.count || 0,
        hizb: hizb.count || 0,
        profiles: profiles.count || 0,
      };
    },
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage reference data for the Annual Sports Program</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Seasons" value={counts?.seasons ?? 0} icon={<Calendar className="w-5 h-5 text-primary-foreground" />} variant="primary" />
        <StatCard title="Sports" value={counts?.sports ?? 0} icon={<Dumbbell className="w-5 h-5 text-accent-foreground" />} variant="accent" />
        <StatCard title="Events" value={counts?.events ?? 0} icon={<Medal className="w-5 h-5 text-success-foreground" />} variant="success" />
        <StatCard title="Hizb Teams" value={counts?.hizb ?? 0} icon={<Users className="w-5 h-5 text-warning-foreground" />} />
        <StatCard title="Students" value={counts?.profiles ?? 0} icon={<Trophy className="w-5 h-5 text-foreground" />} />
      </motion.div>
    </motion.div>
  );
}
