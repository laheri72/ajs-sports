import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Dumbbell, ChevronRight, UserPlus, Search } from "lucide-react";
import { useClubs } from "@/hooks/useClubs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Clubs() {
  const { data: clubs, isLoading } = useClubs();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = clubs?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sports?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-primary" /> Sports Clubs
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Join a club to practice, train, and play with others year-round.
        </p>
      </motion.div>

      <motion.div variants={item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search clubs or sports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((club) => (
            <motion.div
              key={club.id}
              variants={item}
              className="glass-card p-5 cursor-pointer hover:border-primary/40 transition-colors group"
              onClick={() => navigate(`/clubs/${club.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">{club.name}</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              {club.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{club.description}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs capitalize bg-primary/10 text-primary">
                  {club.sports?.name}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" /> {club.member_count} member{club.member_count !== 1 ? "s" : ""}
                </span>
              </div>
              {club.incharge && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  In-charge: <span className="text-foreground">{(club.incharge as any)?.full_name}</span>
                </p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No clubs available yet. Check back later!
        </div>
      )}
    </motion.div>
  );
}
