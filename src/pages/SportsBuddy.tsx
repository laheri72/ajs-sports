import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, Plus, Users, MapPin, Clock, Calendar, UserPlus, UserMinus, CheckCircle, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMatchRequests, useCreateMatchRequest, useJoinMatchRequest, useLeaveMatchRequest, useCompleteMatchRequest, useMatchRequestPlayers, useMyMatchJoin } from "@/hooks/useMatchRequests";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const statusColors: Record<string, string> = {
  open: "bg-success/20 text-success",
  full: "bg-warning/20 text-warning",
  completed: "bg-muted text-muted-foreground",
};

function MatchCard({ match }: { match: any }) {
  const { data: profile } = useProfile();
  const { data: myJoin } = useMyMatchJoin(match.id);
  const { data: players } = useMatchRequestPlayers(match.id);
  const joinMut = useJoinMatchRequest();
  const leaveMut = useLeaveMatchRequest();
  const completeMut = useCompleteMatchRequest();
  const [showPlayers, setShowPlayers] = useState(false);

  const isCreator = profile?.id === match.created_by;
  const hasJoined = !!myJoin;
  const spotsLeft = match.max_players - (match.player_count || 0);
  const isOpen = match.status === "open";

  return (
    <>
      <Card className="glass-card">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-semibold text-foreground truncate">{match.title}</h3>
                <Badge variant="secondary" className={cn("text-[10px] capitalize", statusColors[match.status])}>
                  {match.status}
                </Badge>
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                  {match.sports?.name}
                </Badge>
              </div>
              {match.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{match.description}</p>}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {match.event_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {format(new Date(match.event_date), "PPp")}
                  </span>
                )}
                {match.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {match.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {match.player_count}/{match.max_players}
                </span>
                {isOpen && spotsLeft > 0 && (
                  <span className="text-primary font-medium">{spotsLeft} spots left</span>
                )}
                <span className="text-muted-foreground/60">by {(match.creator as any)?.full_name || "Unknown"}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              {isOpen && !hasJoined && !isCreator && (
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => joinMut.mutate(match.id)} disabled={joinMut.isPending || spotsLeft <= 0}>
                  <UserPlus className="w-3 h-3" /> Join
                </Button>
              )}
              {hasJoined && isOpen && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => leaveMut.mutate(match.id)} disabled={leaveMut.isPending}>
                  <UserMinus className="w-3 h-3" /> Leave
                </Button>
              )}
              {isCreator && isOpen && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => completeMut.mutate(match.id)} disabled={completeMut.isPending}>
                  <CheckCircle className="w-3 h-3" /> Complete
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setShowPlayers(true)}>
                <Users className="w-3 h-3" /> Players
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPlayers} onOpenChange={setShowPlayers}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{match.title} — Players ({players?.length || 0}/{match.max_players})</DialogTitle>
          </DialogHeader>
          {players && players.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>House</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.profiles?.full_name || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.profiles?.class_name}</TableCell>
                    <TableCell>
                      {p.profiles?.houses ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.profiles.houses.color }} />
                          {p.profiles.houses.name}
                        </span>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No players yet. Be the first to join!</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SportsBuddy() {
  const [sportFilter, setSportFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const { data: matches, isLoading } = useMatchRequests(sportFilter || undefined);
  const createMatch = useCreateMatchRequest();

  const [form, setForm] = useState({
    sport_id: "",
    title: "",
    description: "",
    event_date: "",
    location: "",
    max_players: "10",
  });

  const { data: sports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleCreate = () => {
    if (!form.title || !form.sport_id) return;
    createMatch.mutate(
      {
        sport_id: form.sport_id,
        title: form.title,
        description: form.description || undefined,
        event_date: form.event_date || undefined,
        location: form.location || undefined,
        max_players: parseInt(form.max_players) || 10,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ sport_id: "", title: "", description: "", event_date: "", location: "", max_players: "10" });
        },
      }
    );
  };

  const openMatches = matches?.filter((m) => m.status === "open") || [];
  const fullMatches = matches?.filter((m) => m.status === "full") || [];
  const completedMatches = matches?.filter((m) => m.status === "completed") || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Handshake className="w-6 h-6 text-primary" /> Sports Buddy
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Find players and organize casual games.</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1">
          <Plus className="w-4 h-4" /> Create Match
        </Button>
      </motion.div>

      {/* Sport Filter */}
      <motion.div variants={item} className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sports</SelectItem>
            {sports?.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sportFilter && sportFilter !== "all" && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSportFilter("")}>Clear</Button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open" className="gap-1">Open ({openMatches.length})</TabsTrigger>
            <TabsTrigger value="full" className="gap-1">Full ({fullMatches.length})</TabsTrigger>
            <TabsTrigger value="completed" className="gap-1">Completed ({completedMatches.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-3 mt-4">
            {openMatches.length > 0 ? (
              openMatches.map((m) => <MatchCard key={m.id} match={m} />)
            ) : (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No open matches. Create one to get started!
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="full" className="space-y-3 mt-4">
            {fullMatches.length > 0 ? (
              fullMatches.map((m) => <MatchCard key={m.id} match={m} />)
            ) : (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">No full matches.</CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedMatches.length > 0 ? (
              completedMatches.map((m) => <MatchCard key={m.id} match={m} />)
            ) : (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">No completed matches yet.</CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Create Match Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Match Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Match title (e.g. 'Football 5v5')" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Select value={form.sport_id} onValueChange={(v) => setForm({ ...form, sport_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
              <SelectContent>
                {sports?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <Input type="number" min={2} max={50} placeholder="Max players" value={form.max_players} onChange={(e) => setForm({ ...form, max_players: e.target.value })} />
            <Button className="w-full" onClick={handleCreate} disabled={!form.title || !form.sport_id || createMatch.isPending}>
              {createMatch.isPending ? "Creating..." : "Create Match"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
