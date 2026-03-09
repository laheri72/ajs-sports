import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Calendar, MapPin, UserPlus, UserMinus, Clock, Dumbbell, CheckCircle, XCircle, ClipboardList } from "lucide-react";
import { useClubDetail, useClubMembers, useClubEvents, useMyMembership, useJoinClub, useLeaveClub } from "@/hooks/useClubs";
import { useEventParticipants, useMyEventRegistration, useRegisterForEvent, useCancelEventRegistration, useMarkAttendance } from "@/hooks/useClubEventParticipants";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const eventTypeColors: Record<string, string> = {
  practice: "bg-primary/20 text-primary",
  friendly_match: "bg-accent/20 text-accent",
  training: "bg-warning/20 text-warning",
  open_game: "bg-success/20 text-success",
};

function EventCard({ ev, clubInchargeId, clubSubInchargeId }: { ev: any; clubInchargeId: string | null; clubSubInchargeId: string | null }) {
  const { data: profile } = useProfile();
  const { data: participants } = useEventParticipants(ev.id);
  const { data: myReg } = useMyEventRegistration(ev.id);
  const registerMut = useRegisterForEvent();
  const cancelMut = useCancelEventRegistration();
  const markAttendance = useMarkAttendance();
  const [showParticipants, setShowParticipants] = useState(false);

  const isIncharge = profile && (profile.id === clubInchargeId || profile.id === clubSubInchargeId);
  const registered = participants?.filter((p) => p.status !== "absent").length || 0;
  const spotsLeft = ev.max_participants ? ev.max_participants - registered : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isRegistered = !!myReg;

  return (
    <>
      <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-foreground">{ev.title}</h4>
            <Badge variant="secondary" className={cn("text-[10px] capitalize", eventTypeColors[ev.event_type])}>
              {ev.event_type.replace("_", " ")}
            </Badge>
          </div>
          {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {ev.event_date && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {format(new Date(ev.event_date), "PPp")}
              </span>
            )}
            {ev.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {ev.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {registered}{ev.max_participants ? `/${ev.max_participants}` : ""}
            </span>
            {spotsLeft !== null && spotsLeft > 0 && (
              <span className="text-primary font-medium">{spotsLeft} spots left</span>
            )}
            {isFull && <span className="text-destructive font-medium">Full</span>}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {isRegistered ? (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => cancelMut.mutate(ev.id)} disabled={cancelMut.isPending}>
              <UserMinus className="w-3 h-3" /> Cancel
            </Button>
          ) : (
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => registerMut.mutate(ev.id)} disabled={registerMut.isPending || isFull}>
              <UserPlus className="w-3 h-3" /> Register
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setShowParticipants(true)}>
            <ClipboardList className="w-3 h-3" /> {isIncharge ? "Attendance" : "List"}
          </Button>
        </div>
      </div>

      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">{ev.title} — Participants ({participants?.length || 0})</DialogTitle>
          </DialogHeader>
          {participants && participants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  {isIncharge && <TableHead className="text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.profiles?.full_name || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.profiles?.class_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("text-xs capitalize",
                        p.status === "attended" && "bg-success/20 text-success",
                        p.status === "absent" && "bg-destructive/20 text-destructive",
                        p.status === "registered" && "bg-primary/20 text-primary",
                      )}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    {isIncharge && (
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm" variant="ghost" className="h-6 w-6 p-0"
                            onClick={() => markAttendance.mutate({ id: p.id, status: "attended" })}
                            disabled={p.status === "attended"}
                          >
                            <CheckCircle className={cn("w-4 h-4", p.status === "attended" ? "text-success" : "text-muted-foreground")} />
                          </Button>
                          <Button
                            size="sm" variant="ghost" className="h-6 w-6 p-0"
                            onClick={() => markAttendance.mutate({ id: p.id, status: "absent" })}
                            disabled={p.status === "absent"}
                          >
                            <XCircle className={cn("w-4 h-4", p.status === "absent" ? "text-destructive" : "text-muted-foreground")} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No participants yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ClubDetail() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { data: club, isLoading } = useClubDetail(clubId ?? null);
  const { data: members } = useClubMembers(clubId ?? null);
  const { data: events } = useClubEvents(clubId ?? null);
  const { data: membership } = useMyMembership(clubId ?? null);
  const joinClub = useJoinClub();
  const leaveClub = useLeaveClub();

  const isMember = !!membership;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Club not found.
        <Button variant="link" onClick={() => navigate("/clubs")}>Back to Clubs</Button>
      </div>
    );
  }

  const upcomingEvents = events?.filter((e) => !e.event_date || new Date(e.event_date) >= new Date()) || [];
  const pastEvents = events?.filter((e) => e.event_date && new Date(e.event_date) < new Date()) || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" onClick={() => navigate("/clubs")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Clubs
          </Button>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" /> {club.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs capitalize bg-primary/10 text-primary">
              {club.sports?.name}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> {members?.length || 0} members
            </span>
          </div>
          {club.description && (
            <p className="text-sm text-muted-foreground mt-3 max-w-lg">{club.description}</p>
          )}
        </div>
        <div>
          {isMember ? (
            <Button variant="outline" size="sm" onClick={() => leaveClub.mutate(club.id)} disabled={leaveClub.isPending} className="gap-1">
              <UserMinus className="w-4 h-4" /> Leave
            </Button>
          ) : (
            <Button size="sm" onClick={() => joinClub.mutate(club.id)} disabled={joinClub.isPending} className="gap-1">
              <UserPlus className="w-4 h-4" /> Join Club
            </Button>
          )}
        </div>
      </motion.div>

      {/* In-charge info */}
      {(club.incharge || club.sub_incharge) && (
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardContent className="py-4 flex flex-wrap gap-6">
              {club.incharge && (
                <div>
                  <p className="text-xs text-muted-foreground">In-charge</p>
                  <p className="text-sm font-medium text-foreground">{(club.incharge as any)?.full_name}</p>
                </div>
              )}
              {club.sub_incharge && (
                <div>
                  <p className="text-xs text-muted-foreground">Sub In-charge</p>
                  <p className="text-sm font-medium text-foreground">{(club.sub_incharge as any)?.full_name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Events */}
      <motion.div variants={item}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Upcoming Events ({upcomingEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <EventCard key={ev.id} ev={ev} clubInchargeId={club.incharge_id} clubSubInchargeId={club.sub_incharge_id} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming events scheduled.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" /> Past Events ({pastEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastEvents.map((ev) => (
                  <EventCard key={ev.id} ev={ev} clubInchargeId={club.incharge_id} clubSubInchargeId={club.sub_incharge_id} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Members */}
      <motion.div variants={item}>
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Members ({members?.length || 0})
            </CardTitle>
          </CardHeader>
          {members && members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>House</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm font-medium text-foreground">{m.profiles?.full_name || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.profiles?.class_name} · {m.profiles?.darajah}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">{m.role.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      {m.profiles?.houses ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.profiles.houses.color }} />
                          {m.profiles.houses.name}
                        </span>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">No members yet. Be the first to join!</p>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
