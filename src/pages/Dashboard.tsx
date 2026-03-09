import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Calendar,
  Users,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import heroBanner from "@/assets/hero-banner.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useHouseLeaderboard } from "@/hooks/useHouseLeaderboard";

const fitnessData = [
  { week: "W1", score: 62 },
  { week: "W2", score: 65 },
  { week: "W3", score: 68 },
  { week: "W4", score: 72 },
  { week: "W5", score: 70 },
  { week: "W6", score: 78 },
  { week: "W7", score: 82 },
  { week: "W8", score: 85 },
];


const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};


export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: houseRankings } = useHouseLeaderboard();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Athlete";
  const userHouse = houseRankings?.find((h) => h.house_id === profile?.house_id);
  const userHouseRank = houseRankings?.findIndex((h) => h.house_id === profile?.house_id);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Hero Banner */}
      <motion.div variants={item} className="relative rounded-2xl overflow-hidden h-48">
        <img src={heroBanner} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome back, <span className="text-gradient">{displayName}</span> 🏆
            </h1>
            <p className="text-muted-foreground max-w-md">
              {userHouse
                ? `House ${userHouse.house_name} has ${userHouse.total_points.toLocaleString()} points this season.`
                : "Join a house to start competing!"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* House Rankings Strip */}
      {houseRankings && houseRankings.length > 0 && (
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {houseRankings.map((h, idx) => (
            <div
              key={h.house_id}
              className={`glass-card p-4 flex items-center gap-3 ${h.house_id === profile?.house_id ? "border-primary/30 glow-primary" : ""}`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: h.house_color }}
              >
                <span className="font-display font-bold" style={{ color: "hsl(222, 47%, 8%)" }}>
                  {idx + 1}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-foreground text-sm truncate">{h.house_name}</p>
                <p className="text-xs text-muted-foreground">{h.total_points.toLocaleString()} pts</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="House Points"
          value={userHouse?.total_points?.toLocaleString() || "0"}
          subtitle={userHouse ? `House ${userHouse.house_name}` : "No house"}
          icon={<Trophy className="w-5 h-5 text-primary-foreground" />}
          variant="primary"
        />
        <StatCard
          title="House Rank"
          value={userHouseRank !== undefined && userHouseRank >= 0 ? `#${userHouseRank + 1}` : "-"}
          subtitle="of 4 houses"
          icon={<Medal className="w-5 h-5 text-accent-foreground" />}
          variant="accent"
        />
        <StatCard
          title="House Members"
          value={userHouse?.member_count || 0}
          icon={<Users className="w-5 h-5 text-success-foreground" />}
          variant="success"
        />
        <StatCard
          title="Season"
          value="ASP 2026"
          subtitle="Active"
          icon={<Calendar className="w-5 h-5 text-foreground" />}
        />
      </motion.div>

    </motion.div>
  );
}
