import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Plus, Users, ToggleLeft, ToggleRight, Calendar, Eye, BarChart3, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminClubs, useCreateClub, useUpdateClub, useCreateClubEvent, useClubMembers, useClubEvents } from "@/hooks/useClubs";
import { useClubAnalytics } from "@/hooks/useClubEventParticipants";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function AdminClubs() {
  const { data: clubs, isLoading } = useAdminClubs();
  const { data: profile } = useProfile();
  const { data: analytics } = useClubAnalytics();
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const createEvent = useCreateClubEvent();

  const [showCreate, setShowCreate] = useState(false);
  const [showEventForm, setShowEventForm] = useState<string | null>(null);
  const [viewClubId, setViewClubId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sport_id: "", description: "" });
  const [eventForm, setEventForm] = useState({ title: "", event_type: "practice", description: "", location: "", event_date: "", max_participants: "" });

  const { data: sports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: viewMembers } = useClubMembers(viewClubId);
  const { data: viewEvents } = useClubEvents(viewClubId);

  const handleCreateClub = () => {
    if (!form.name || !form.sport_id) return;
    createClub.mutate(
      { name: form.name, sport_id: form.sport_id, description: form.description || undefined, created_by: profile?.id },
      { onSuccess: () => { setShowCreate(false); setForm({ name: "", sport_id: "", description: "" }); } }
    );
  };

  const handleCreateEvent = () => {
    if (!eventForm.title || !showEventForm) return;
    createEvent.mutate(
      {
        club_id: showEventForm,
        title: eventForm.title,
        event_type: eventForm.event_type,
        description: eventForm.description || undefined,
        location: eventForm.location || undefined,
        event_date: eventForm.event_date || undefined,
        max_participants: eventForm.max_participants ? parseInt(eventForm.max_participants) : undefined,
        created_by: profile?.id,
      },
      { onSuccess: () => { setShowEventForm(null); setEventForm({ title: "", event_type: "practice", description: "", location: "", event_date: "", max_participants: "" }); } }
    );
  };

  const totalMembers = clubs?.reduce((sum, c) => sum + (c.member_count || 0), 0) ?? 0;
  const totalEvents = analytics?.clubStats.reduce((sum, c) => sum + c.eventsHosted, 0) ?? 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" /> Clubs Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create, manage clubs and track participation.</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1">
          <Plus className="w-4 h-4" /> Create Club
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{clubs?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total Clubs</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{clubs?.filter(c => c.is_active).length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{totalMembers}</p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{totalEvents}</p>
            <p className="text-xs text-muted-foreground">Events Hosted</p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="clubs">
        <TabsList>
          <TabsTrigger value="clubs" className="gap-1"><Dumbbell className="w-3 h-3" /> Clubs</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1"><BarChart3 className="w-3 h-3" /> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="clubs">
          <motion.div variants={item}>
            <Card className="glass-card overflow-hidden">
              {isLoading ? (
                <CardContent className="py-8 flex justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </CardContent>
              ) : clubs && clubs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Club</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead className="text-center">Members</TableHead>
                      <TableHead>In-charge</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clubs.map((club) => (
                      <TableRow key={club.id}>
                        <TableCell>
                          <p className="text-sm font-medium text-foreground">{club.name}</p>
                          {club.description && <p className="text-xs text-muted-foreground line-clamp-1">{club.description}</p>}
                        </TableCell>
                        <TableCell className="text-sm">{club.sports?.name}</TableCell>
                        <TableCell className="text-center font-mono">{club.member_count}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{(club.incharge as any)?.full_name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("text-xs", club.is_active ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive")}>
                            {club.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setViewClubId(club.id)}>
                              <Eye className="w-3 h-3 mr-1" /> View
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowEventForm(club.id)}>
                              <Calendar className="w-3 h-3 mr-1" /> Event
                            </Button>
                            <Button
                              size="sm" variant="ghost" className="h-7 text-xs"
                              onClick={() => updateClub.mutate({ id: club.id, updates: { is_active: !club.is_active } })}
                            >
                              {club.is_active ? <ToggleRight className="w-3.5 h-3.5 text-success" /> : <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <CardContent className="py-8 text-center text-muted-foreground text-sm">No clubs created yet.</CardContent>
              )}
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Club Activity Stats */}
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Club Activity
              </CardTitle>
            </CardHeader>
            {analytics?.clubStats && analytics.clubStats.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Club</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead className="text-center">Events</TableHead>
                    <TableHead className="text-center">Total Attended</TableHead>
                    <TableHead className="text-center">Avg Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.clubStats.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm font-medium text-foreground">{s.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.sport}</TableCell>
                      <TableCell className="text-center font-mono">{s.eventsHosted}</TableCell>
                      <TableCell className="text-center font-mono">{s.totalAttended}</TableCell>
                      <TableCell className="text-center font-mono">{s.avgAttendance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent className="py-6 text-center text-sm text-muted-foreground">No event data yet.</CardContent>
            )}
          </Card>

          {/* Most Active Students */}
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Most Active Students
              </CardTitle>
            </CardHeader>
            {analytics?.topStudents && analytics.topStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Events Attended</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topStudents.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm font-mono text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{s.name}</TableCell>
                      <TableCell className="text-center font-mono">{s.attended}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent className="py-6 text-center text-sm text-muted-foreground">No attendance data yet.</CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Club Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Club</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Club name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select value={form.sport_id} onValueChange={(v) => setForm({ ...form, sport_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
              <SelectContent>
                {sports?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <Button className="w-full" onClick={handleCreateClub} disabled={!form.name || !form.sport_id || createClub.isPending}>
              {createClub.isPending ? "Creating..." : "Create Club"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={!!showEventForm} onOpenChange={(o) => !o && setShowEventForm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Club Event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Event title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <Select value={eventForm.event_type} onValueChange={(v) => setEventForm({ ...eventForm, event_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Practice</SelectItem>
                <SelectItem value="friendly_match">Friendly Match</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="open_game">Open Game</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Description (optional)" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={2} />
            <Input placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
            <Input type="datetime-local" value={eventForm.event_date} onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })} />
            <Input type="number" placeholder="Max participants (optional)" value={eventForm.max_participants} onChange={(e) => setEventForm({ ...eventForm, max_participants: e.target.value })} />
            <Button className="w-full" onClick={handleCreateEvent} disabled={!eventForm.title || createEvent.isPending}>
              {createEvent.isPending ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Club Dialog */}
      <Dialog open={!!viewClubId} onOpenChange={(o) => !o && setViewClubId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Club Members ({viewMembers?.length || 0})
            </DialogTitle>
          </DialogHeader>
          {viewMembers && viewMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm">{m.profiles?.full_name || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.profiles?.class_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">{m.role.replace("_", " ")}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No members yet.</p>
          )}
          {viewEvents && viewEvents.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-foreground mt-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Events ({viewEvents.length})
              </h3>
              <div className="space-y-2">
                {viewEvents.map((ev) => (
                  <div key={ev.id} className="p-2 rounded-lg bg-secondary/50 border border-border text-sm">
                    <span className="font-medium text-foreground">{ev.title}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">{ev.event_type.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
