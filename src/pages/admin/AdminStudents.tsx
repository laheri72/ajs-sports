import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Upload, Search, Users, Pencil, Trash2 } from "lucide-react";
import { useHouses } from "@/hooks/useHouses";

interface StudentForm {
  full_name: string;
  tr_number: string;
  its_number: string;
  edu_email: string;
  house_id: string;
  hizb_id: string;
  darajah: string;
  class_name: string;
  birth_date: string;
  is_under_18: boolean;
}

const emptyForm: StudentForm = {
  full_name: "",
  tr_number: "",
  its_number: "",
  edu_email: "",
  house_id: "",
  hizb_id: "",
  darajah: "",
  class_name: "",
  birth_date: "",
  is_under_18: false,
};

export default function AdminStudents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [csvText, setCsvText] = useState("");

  const { data: houses } = useHouses();

  const { data: hizbTeams } = useQuery({
    queryKey: ["hizb-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hizb").select("*, houses(name)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, houses(name, color), hizb(name)")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (studentData: StudentForm[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("manage-students", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: {
          action: "create",
          students: studentData.map((s) => ({
            full_name: s.full_name,
            tr_number: s.tr_number || null,
            its_number: s.its_number || null,
            edu_email: s.edu_email,
            house_id: s.house_id || null,
            hizb_id: s.hizb_id || null,
            darajah: s.darajah || null,
            class_name: s.class_name || null,
            birth_date: s.birth_date || null,
            is_under_18: s.is_under_18,
          })),
        },
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      const results = data?.results || [];
      const succeeded = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success);
      toast({
        title: `${succeeded} student(s) created`,
        description: failed.length > 0
          ? `${failed.length} failed: ${failed.map((f: any) => `${f.edu_email}: ${f.error}`).join(", ")}`
          : undefined,
        variant: failed.length > 0 ? "destructive" : "default",
      });
      setDialogOpen(false);
      setBulkDialogOpen(false);
      setForm(emptyForm);
      setCsvText("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ trNumber, updates }: { trNumber: string; updates: Partial<StudentForm> }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("manage-students", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: { action: "update", students: { tr_number: trNumber, updates } },
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast({ title: "Student updated" });
      setEditDialogOpen(false);
      setSelectedStudent(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ trNumber, userId }: { trNumber: string; userId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("manage-students", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: { action: "delete", students: { tr_number: trNumber, user_id: userId } },
      });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast({ title: "Student deleted" });
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleAddStudent = () => {
    if (!form.full_name || !form.edu_email) {
      toast({ title: "Name and Edu Email are required", variant: "destructive" });
      return;
    }
    createMutation.mutate([form]);
  };

  const handleEditStudent = () => {
    if (!selectedStudent) return;
    updateMutation.mutate({
      trNumber: selectedStudent.tr_number,
      updates: {
        full_name: form.full_name,
        tr_number: form.tr_number || null,
        its_number: form.its_number || null,
        edu_email: form.edu_email,
        house_id: form.house_id || null,
        hizb_id: form.hizb_id || null,
        darajah: form.darajah || null,
        class_name: form.class_name || null,
        birth_date: form.birth_date || null,
        is_under_18: form.is_under_18,
      },
    });
  };

  const openEditDialog = (student: any) => {
    setSelectedStudent(student);
    setForm({
      full_name: student.full_name || "",
      tr_number: student.tr_number || "",
      its_number: student.its_number || "",
      edu_email: student.edu_email || "",
      house_id: student.house_id || "",
      hizb_id: student.hizb_id || "",
      darajah: student.darajah || "",
      class_name: student.class_name || "",
      birth_date: student.birth_date || "",
      is_under_18: student.is_under_18 || false,
    });
    setEditDialogOpen(true);
  };

  const handleBulkImport = () => {
    if (!csvText.trim()) {
      toast({ title: "Paste CSV data first", variant: "destructive" });
      return;
    }
    const lines = csvText.trim().split("\n");
    // Expect header: TR,ITS,Name,Hizb,Darajah,Class,House,Age,18,Edu Email,DOB
    const dataLines = lines.slice(1);
    const bulkStudents: StudentForm[] = dataLines.map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      const houseName = cols[6] || "";
      const hizbName = cols[3] || "";
      const house = houses?.find((h) => (h.name || "").toLowerCase() === houseName.toLowerCase());
      const hizb = hizbTeams?.find((h) => (h.name || "").toLowerCase() === hizbName.toLowerCase());
      return {
        tr_number: cols[0] || "",
        its_number: cols[1] || "",
        full_name: cols[2] || "",
        hizb_id: hizb?.id || "",
        darajah: cols[4] || "",
        class_name: cols[5] || "",
        house_id: house?.id || "",
        is_under_18: cols[8]?.toLowerCase() === "yes" || cols[8] === "true",
        edu_email: cols[9] || "",
        birth_date: cols[10] || "",
      };
    }).filter((s) => s.full_name && s.edu_email);

    if (bulkStudents.length === 0) {
      toast({ title: "No valid rows found", variant: "destructive" });
      return;
    }
    createMutation.mutate(bulkStudents);
  };

  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];
    if (!search.trim()) return students;
    
    const q = search.toLowerCase().trim();
    return students.filter((s) => {
      return (
        String(s.full_name || "").toLowerCase().includes(q) ||
        String(s.tr_number || "").toLowerCase().includes(q) ||
        String(s.edu_email || "").toLowerCase().includes(q) ||
        String(s.its_number || "").toLowerCase().includes(q)
      );
    });
  }, [students, search]);

  const filteredHizb = useMemo(() => {
    if (!hizbTeams) return [];
    return form.house_id
      ? hizbTeams.filter((h: any) => h.house_id === form.house_id)
      : hizbTeams;
  }, [hizbTeams, form.house_id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Students
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {students?.length || 0} registered students
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Import Students (CSV)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Paste CSV with header: <code>TR,ITS,Name,Hizb,Darajah,Class,House,Age,18,Edu Email,DOB</code>
                </p>
                <textarea
                  className="w-full h-48 rounded-xl border border-border bg-secondary p-3 text-sm font-mono"
                  placeholder={`TR,ITS,Name,Hizb,Darajah,Class,House,Age,18,Edu Email,DOB\n12345,67890,Ahmed Ali,Hizb A,10,10A,RED,17,yes,ahmed@edu.com,2008-05-15`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
                <Button
                  onClick={handleBulkImport}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? "Importing..." : "Import Students"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Full Name *</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Edu Email *</Label>
                  <Input type="email" value={form.edu_email} onChange={(e) => setForm({ ...form, edu_email: e.target.value })} />
                </div>
                <div>
                  <Label>TR Number</Label>
                  <Input value={form.tr_number} onChange={(e) => setForm({ ...form, tr_number: e.target.value })} />
                </div>
                <div>
                  <Label>ITS Number</Label>
                  <Input value={form.its_number} onChange={(e) => setForm({ ...form, its_number: e.target.value })} />
                </div>
                <div>
                  <Label>House</Label>
                  <Select value={form.house_id} onValueChange={(v) => setForm({ ...form, house_id: v, hizb_id: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                    <SelectContent>
                      {houses?.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hizb</Label>
                  <Select value={form.hizb_id} onValueChange={(v) => setForm({ ...form, hizb_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select hizb" /></SelectTrigger>
                    <SelectContent>
                      {filteredHizb?.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Darajah</Label>
                  <Input value={form.darajah} onChange={(e) => setForm({ ...form, darajah: e.target.value })} />
                </div>
                <div>
                  <Label>Class</Label>
                  <Input value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={form.is_under_18}
                    onChange={(e) => setForm({ ...form, is_under_18: e.target.checked })}
                    className="rounded"
                  />
                  <Label>Under 18</Label>
                </div>
              </div>
              <Button
                onClick={handleAddStudent}
                disabled={createMutation.isPending}
                className="w-full mt-4"
              >
                {createMutation.isPending ? "Creating..." : "Create Student"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, TR, ITS, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>TR</TableHead>
              <TableHead>ITS</TableHead>
              <TableHead>House</TableHead>
              <TableHead>Hizb</TableHead>
              <TableHead>Darajah</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Edu Email</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>U18</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredStudents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents?.map((s: any) => (
                <TableRow key={s.tr_number}>
                  <TableCell className="font-medium">{s.full_name || "—"}</TableCell>
                  <TableCell>{s.tr_number || "—"}</TableCell>
                  <TableCell>{s.its_number || "—"}</TableCell>
                  <TableCell>
                    {s.houses ? (
                      <Badge
                        variant="outline"
                        style={{ borderColor: s.houses.color, color: s.houses.color }}
                      >
                        {s.houses.name}
                      </Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{s.hizb?.name || "—"}</TableCell>
                  <TableCell>{s.darajah || "—"}</TableCell>
                  <TableCell>{s.class_name || "—"}</TableCell>
                  <TableCell className="text-xs">{s.edu_email || "—"}</TableCell>
                  <TableCell>{s.birth_date || "—"}</TableCell>
                  <TableCell>{s.is_under_18 ? "✓" : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(s)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelectedStudent(s); setDeleteDialogOpen(true); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setSelectedStudent(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Edu Email *</Label>
              <Input type="email" value={form.edu_email} onChange={(e) => setForm({ ...form, edu_email: e.target.value })} />
            </div>
            <div>
              <Label>TR Number</Label>
              <Input value={form.tr_number} onChange={(e) => setForm({ ...form, tr_number: e.target.value })} />
            </div>
            <div>
              <Label>ITS Number</Label>
              <Input value={form.its_number} onChange={(e) => setForm({ ...form, its_number: e.target.value })} />
            </div>
            <div>
              <Label>House</Label>
              <Select value={form.house_id} onValueChange={(v) => setForm({ ...form, house_id: v, hizb_id: "" })}>
                <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                <SelectContent>
                  {houses?.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hizb</Label>
              <Select value={form.hizb_id} onValueChange={(v) => setForm({ ...form, hizb_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select hizb" /></SelectTrigger>
                <SelectContent>
                  {filteredHizb?.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Darajah</Label>
              <Input value={form.darajah} onChange={(e) => setForm({ ...form, darajah: e.target.value })} />
            </div>
            <div>
              <Label>Class</Label>
              <Input value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.is_under_18} onChange={(e) => setForm({ ...form, is_under_18: e.target.checked })} className="rounded" />
              <Label>Under 18</Label>
            </div>
          </div>
          <Button onClick={handleEditStudent} disabled={updateMutation.isPending} className="w-full mt-4">
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedStudent?.full_name}</strong>? This will remove their profile and auth account permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedStudent && deleteMutation.mutate({ trNumber: selectedStudent.tr_number, userId: selectedStudent.user_id })}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
