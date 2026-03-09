import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Shield, Search, Eye, Ban, CheckCircle, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCertifications, useIssueCertificate, useRevokeCertificate } from "@/hooks/useCertifications";
import { useSportScores, StudentSportScore } from "@/hooks/useSportScores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const levelColors: Record<string, string> = {
  beginner: "bg-blue-500/20 text-blue-400",
  intermediate: "bg-yellow-500/20 text-yellow-400",
  advanced: "bg-primary/20 text-primary",
  expert: "bg-accent/20 text-accent",
  master: "bg-success/20 text-success",
};

export default function AdminCertifications() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [issueDialog, setIssueDialog] = useState<StudentSportScore | null>(null);
  const [notes, setNotes] = useState("");

  const { data: scores } = useSportScores();
  const { data: certifications, isLoading } = useCertifications(year);
  const issueCert = useIssueCertificate();
  const revokeCert = useRevokeCertificate();

  const { data: sports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Eligible = advanced, expert, master who don't already have a cert this year
  const certifiedKeys = new Set(
    certifications?.filter(c => c.status !== "revoked").map(c => `${c.student_id}-${c.sport_id}`) || []
  );

  const eligible = scores?.filter(s => {
    if (!["advanced", "expert", "master"].includes(s.proficiency_level)) return false;
    if (certifiedKeys.has(`${s.student_id}-${s.sport_id}`)) return false;
    if (sportFilter !== "all" && s.sport_id !== sportFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(s.profiles?.full_name || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }) || [];

  const handleIssue = () => {
    if (!issueDialog) return;
    issueCert.mutate({
      studentId: issueDialog.student_id,
      sportId: issueDialog.sport_id,
      score: issueDialog.total_score,
      level: issueDialog.proficiency_level,
      year,
      notes,
    }, {
      onSuccess: () => { setIssueDialog(null); setNotes(""); },
    });
  };

  const issuedCerts = certifications?.filter(c => c.status === "issued") || [];
  const revokedCerts = certifications?.filter(c => c.status === "revoked") || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> Certification System
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Issue and manage official sports proficiency certificates.</p>
        </div>
        <Select value={year.toString()} onValueChange={v => setYear(parseInt(v))}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{eligible.length}</p>
            <p className="text-xs text-muted-foreground">Eligible Students</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-success">{issuedCerts.length}</p>
            <p className="text-xs text-muted-foreground">Certificates Issued</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-display font-bold text-destructive">{revokedCerts.length}</p>
            <p className="text-xs text-muted-foreground">Revoked</p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="eligible">
        <TabsList>
          <TabsTrigger value="eligible" className="gap-1"><CheckCircle className="w-3 h-3" /> Eligible ({eligible.length})</TabsTrigger>
          <TabsTrigger value="issued" className="gap-1"><FileText className="w-3 h-3" /> Issued ({issuedCerts.length})</TabsTrigger>
          <TabsTrigger value="revoked" className="gap-1"><Ban className="w-3 h-3" /> Revoked ({revokedCerts.length})</TabsTrigger>
        </TabsList>

        {/* Eligible Tab */}
        <TabsContent value="eligible" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Sports" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sports?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {!eligible.length ? (
            <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground text-sm">No eligible students found. Students need Advanced level or above to qualify.</CardContent></Card>
          ) : (
            <Card className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium">Student</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium">Sport</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium text-center">Score</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium">Level</th>
                      <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligible.map(s => (
                      <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{s.profiles?.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{s.profiles?.class_name} · {s.profiles?.darajah}</p>
                        </td>
                        <td className="px-4 py-3">{s.sports?.name}</td>
                        <td className="px-4 py-3 text-center font-display font-bold">{s.total_score}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className={cn("text-xs capitalize", levelColors[s.proficiency_level])}>{s.proficiency_level}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="default" className="gap-1" onClick={() => setIssueDialog(s)}>
                            <Award className="w-3 h-3" /> Issue
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Issued Tab */}
        <TabsContent value="issued" className="mt-4">
          <CertTable certs={issuedCerts} onRevoke={id => revokeCert.mutate(id)} showRevoke />
        </TabsContent>

        {/* Revoked Tab */}
        <TabsContent value="revoked" className="mt-4">
          <CertTable certs={revokedCerts} />
        </TabsContent>
      </Tabs>

      {/* Issue Dialog */}
      <Dialog open={!!issueDialog} onOpenChange={() => setIssueDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Issue Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Student</p>
                <p className="font-medium">{issueDialog?.profiles?.full_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Sport</p>
                <p className="font-medium">{issueDialog?.sports?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Score</p>
                <p className="font-display font-bold text-lg">{issueDialog?.total_score}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Level</p>
                <Badge variant="secondary" className={cn("text-xs capitalize mt-1", levelColors[issueDialog?.proficiency_level || ""])}>{issueDialog?.proficiency_level}</Badge>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Year</p>
              <p className="font-medium">{year}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Notes (optional)</p>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any remarks..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialog(null)}>Cancel</Button>
            <Button onClick={handleIssue} disabled={issueCert.isPending} className="gap-1">
              <Award className="w-4 h-4" /> {issueCert.isPending ? "Issuing..." : "Issue Certificate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function CertTable({ certs, onRevoke, showRevoke }: { certs: any[]; onRevoke?: (id: string) => void; showRevoke?: boolean }) {
  if (!certs.length) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center text-muted-foreground text-sm">No certificates found.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium">Certificate #</th>
              <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium">Student</th>
              <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium">Sport</th>
              <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium text-center">Score</th>
              <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium">Level</th>
              <th className="px-4 py-3 text-xs text-muted-foreground uppercase font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certs.map(c => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs text-primary">{c.certificate_number}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{c.profiles?.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{c.profiles?.class_name}</p>
                </td>
                <td className="px-4 py-3">{c.sports?.name}</td>
                <td className="px-4 py-3 text-center font-display font-bold">{c.score_snapshot}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={cn("text-xs capitalize", levelColors[c.proficiency_level])}>{c.proficiency_level}</Badge>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link to={`/certificates/${c.id}`}>
                    <Button size="sm" variant="outline" className="gap-1"><Eye className="w-3 h-3" /> View</Button>
                  </Link>
                  {showRevoke && onRevoke && (
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => onRevoke(c.id)}>
                      <Ban className="w-3 h-3" /> Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
