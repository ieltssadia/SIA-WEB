"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Award,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAdminStore } from "@/lib/admin-store";
import type {
  AdminIeltsRegistrationRow,
  AdminIeltsRegistrationStatus,
} from "@/lib/admin-types";
import {
  EmptyState,
  ErrorState,
  SectionHeading,
  StatCard,
  ToneBadge,
  formatBDT,
  formatDate,
  type Tone,
} from "@/components/site/admin/admin-shared";

export const IELTS_REG_STATUS_LABEL: Record<AdminIeltsRegistrationStatus, string> = {
  new: "New · নতুন আবেদন",
  reviewing: "Reviewing · যাচাইকরণ",
  submitted: "Submitted · সেন্টারে প্রেরিত",
  registered: "Registered · কনফার্মড",
  rejected: "Rejected · বাতিল",
};

export const IELTS_REG_STATUS_TONE: Record<AdminIeltsRegistrationStatus, Tone> = {
  new: "sky",
  reviewing: "amber",
  submitted: "blue",
  registered: "emerald",
  rejected: "red",
};

const PAYMENT_TONE: Record<"unpaid" | "paid" | "partial", Tone> = {
  unpaid: "muted",
  paid: "emerald",
  partial: "amber",
};

export function AdminIeltsRegistrations() {
  const token = useAdminStore((s) => s.token);

  const [registrations, setRegistrations] = useState<AdminIeltsRegistrationRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Modals & Details
  const [selectedReg, setSelectedReg] = useState<AdminIeltsRegistrationRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    status: AdminIeltsRegistrationStatus;
    paymentStatus: "unpaid" | "paid" | "partial";
    examFee: string;
    receivedBy: string;
    remarks: string;
  }>({
    status: "new",
    paymentStatus: "unpaid",
    examFee: "",
    receivedBy: "",
    remarks: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Alert
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ielts-registrations", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        registrations?: AdminIeltsRegistrationRow[];
        error?: string;
      } | null;

      if (res.ok && data?.ok && data.registrations) {
        setRegistrations(data.registrations);
      } else {
        setError(data?.error ?? "রেজিস্ট্রেশন তালিকা লোড করা যায়নি।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  // Filtered List
  const filtered = useMemo(() => {
    if (!registrations) return [];
    let list = [...registrations];

    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.regNo.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.preferredCentre.toLowerCase().includes(q)
      );
    }

    return list;
  }, [registrations, statusFilter, search]);

  // Quick Inline Status Update
  async function handleQuickStatusChange(
    reg: AdminIeltsRegistrationRow,
    status: AdminIeltsRegistrationStatus
  ) {
    if (!token || status === reg.status) return;
    try {
      const res = await fetch(`/api/admin/ielts-registrations/${reg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRegistrations((rows) =>
          (rows ?? []).map((r) => (r.id === reg.id ? { ...r, status } : r))
        );
        toast.success(`${reg.fullName} → ${IELTS_REG_STATUS_LABEL[status]}`);
      } else {
        toast.error(data.error || "স্ট্যাটাস পরিবর্তন করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা।");
    }
  }

  // Open Full Detail Modal
  function openDetails(reg: AdminIeltsRegistrationRow) {
    setSelectedReg(reg);
    setEditForm({
      status: reg.status,
      paymentStatus: reg.paymentStatus,
      examFee: reg.examFee !== null ? String(reg.examFee) : "",
      receivedBy: reg.receivedBy || "",
      remarks: reg.remarks || "",
    });
    setIsEditing(false);
  }

  // Save Office Use Only Details
  async function handleSaveOfficeDetails() {
    if (!selectedReg || !token) return;
    setSavingEdit(true);
    try {
      const feeNum = editForm.examFee.trim() ? parseInt(editForm.examFee, 10) : null;
      const res = await fetch(`/api/admin/ielts-registrations/${selectedReg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": token },
        body: JSON.stringify({
          status: editForm.status,
          paymentStatus: editForm.paymentStatus,
          examFee: isNaN(Number(feeNum)) ? null : feeNum,
          receivedBy: editForm.receivedBy.trim() || null,
          remarks: editForm.remarks.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setRegistrations((rows) =>
          (rows ?? []).map((r) => (r.id === selectedReg.id ? data.registration : r))
        );
        setSelectedReg(data.registration);
        toast.success("অফিস তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!");
        setIsEditing(false);
      } else {
        toast.error(data.error || "সংরক্ষণ করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setSavingEdit(false);
    }
  }

  // Handle Delete
  async function handleDelete() {
    if (!deletingId || !token) return;
    setDeletePending(true);
    try {
      const res = await fetch(`/api/admin/ielts-registrations/${deletingId}`, {
        method: "DELETE",
        headers: { "x-admin-key": token },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRegistrations((rows) => (rows ?? []).filter((r) => r.id !== deletingId));
        toast.success("রেজিস্ট্রেশন রেকর্ড মুছে ফেলা হয়েছে।");
        if (selectedReg?.id === deletingId) setSelectedReg(null);
      } else {
        toast.error(data.error || "মুছে ফেলা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা।");
    } finally {
      setDeletePending(false);
      setDeletingId(null);
    }
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    if (!registrations) return { total: 0, newCount: 0, registeredCount: 0, totalFees: 0 };
    return {
      total: registrations.length,
      newCount: registrations.filter((r) => r.status === "new" || r.status === "reviewing").length,
      registeredCount: registrations.filter((r) => r.status === "registered").length,
      totalFees: registrations.reduce((acc, curr) => acc + (curr.examFee || 0), 0),
    };
  }, [registrations]);

  function copyText(val: string) {
    navigator.clipboard.writeText(val);
    toast.success("কপি করা হয়েছে!");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title="IELTS Exam Registrations · আইইএলটিএস পরীক্ষা নিবন্ধন"
          sub="অফিশিয়াল ব্রিটিশ কাউন্সিল ও আইডিপি ভেন্যুর জন্য আবেদনকারী প্রার্থীদের তালিকা ও তথ্য"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-xl gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          রিফ্রেশ
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Total Applications"
          sub="মোট আবেদন"
          value={metrics.total}
          tone="sky"
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          sub="যাচাই প্রক্রিয়াধীন"
          value={metrics.newCount}
          tone="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmed Registered"
          sub="চূড়ান্ত নিবন্ধিত"
          value={metrics.registeredCount}
          tone="emerald"
        />
        <StatCard
          icon={DollarSign}
          label="Collected Exam Fees"
          sub="গৃহীত ফি"
          value={formatBDT(metrics.totalFees)}
          tone="blue"
        />
      </div>

      {/* Filters Bar */}
      <Card className="rounded-2xl border-border bg-card">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, Name, Phone, Email, Centre..."
                className="rounded-xl pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status · সব</SelectItem>
                <SelectItem value="new">New · নতুন</SelectItem>
                <SelectItem value="reviewing">Reviewing · যাচাইকরণ</SelectItem>
                <SelectItem value="submitted">Submitted · সেন্টারে প্রেরিত</SelectItem>
                <SelectItem value="registered">Registered · কনফার্মড</SelectItem>
                <SelectItem value="rejected">Rejected · বাতিল</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {loading && !registrations ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="কোনো রেজিস্ট্রেশন পাওয়া যায়নি"
          description={
            search || statusFilter !== "all"
              ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।"
              : "এখনো কোনো প্রার্থী IELTS পরীক্ষার জন্য আবেদন করেনি।"
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Tracking ID / Candidate</th>
                  <th className="px-4 py-3">Contact Info</th>
                  <th className="px-4 py-3">Exam Type & Centre</th>
                  <th className="px-4 py-3">Preferred Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="transition hover:bg-muted/30">
                    {/* ID & Candidate */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          {reg.regNo}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(reg.regNo)}
                          title="Copy ID"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-semibold text-foreground text-sm mt-0.5">
                        {reg.fullName}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(reg.createdAt)}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                        <a href={`tel:${reg.phone}`} className="hover:underline">
                          {reg.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">
                        <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{reg.email}</span>
                      </div>
                    </td>

                    {/* Exam Choice */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground text-xs">
                        {reg.examType}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {reg.testFormat} · {reg.preferredCentre}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground text-xs">
                        {reg.preferredDate}
                      </span>
                    </td>

                    {/* Status with Inline Select */}
                    <td className="px-4 py-3">
                      <Select
                        value={reg.status}
                        onValueChange={(val: any) =>
                          void handleQuickStatusChange(reg, val)
                        }
                      >
                        <SelectTrigger className="h-8 w-32 rounded-lg text-xs font-medium">
                          <ToneBadge
                            tone={IELTS_REG_STATUS_TONE[reg.status]}
                            className="px-2 py-0 text-[10px]"
                          >
                            {reg.status}
                          </ToneBadge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">new (নতুন)</SelectItem>
                          <SelectItem value="reviewing">reviewing (যাচাই)</SelectItem>
                          <SelectItem value="submitted">submitted (সেন্টারে)</SelectItem>
                          <SelectItem value="registered">registered (নিশ্চিত)</SelectItem>
                          <SelectItem value="rejected">rejected (বাতিল)</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <ToneBadge
                          tone={PAYMENT_TONE[reg.paymentStatus]}
                          className="px-2 py-0 text-[10px] uppercase font-bold"
                        >
                          {reg.paymentStatus}
                        </ToneBadge>
                        {reg.examFee !== null && reg.examFee > 0 && (
                          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatBDT(reg.examFee)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDetails(reg)}
                          className="h-8 rounded-lg px-2.5 text-xs text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingId(reg.id)}
                          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL & EDIT MODAL */}
      {selectedReg && (
        <Dialog open={!!selectedReg} onOpenChange={(open) => !open && setSelectedReg(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <span>{selectedReg.fullName}</span>
                    <ToneBadge tone={IELTS_REG_STATUS_TONE[selectedReg.status]}>
                      {selectedReg.status}
                    </ToneBadge>
                  </DialogTitle>
                  <DialogDescription className="mt-1 font-mono text-xs text-primary font-bold">
                    Registration Tracking ID: {selectedReg.regNo}
                  </DialogDescription>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="rounded-xl gap-1.5 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Form
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-2 text-sm">
              {/* SECTION 1: Personal Information */}
              <div className="rounded-xl bg-muted/20 p-4 border border-border/50 space-y-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  1. Personal Information (ব্যক্তিগত তথ্য)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Full Name:</span>
                    <p className="font-semibold text-foreground">{selectedReg.fullName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Father&apos;s Name:</span>
                    <p className="font-medium text-foreground">{selectedReg.fatherName || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mother&apos;s Name:</span>
                    <p className="font-medium text-foreground">{selectedReg.motherName || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <p className="font-medium text-foreground">{selectedReg.dob}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>
                    <p className="font-medium text-foreground">{selectedReg.gender}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nationality:</span>
                    <p className="font-medium text-foreground">{selectedReg.nationality}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-muted-foreground">NID / Birth Reg / Passport No:</span>
                    <p className="font-semibold font-mono text-foreground">
                      {selectedReg.identityNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Contact Information */}
              <div className="rounded-xl bg-muted/20 p-4 border border-border/50 space-y-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  2. Contact Information (যোগাযোগের তথ্য)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Mobile Phone:</span>
                    <p className="font-semibold text-foreground">{selectedReg.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">WhatsApp:</span>
                    <p className="font-medium text-foreground">{selectedReg.whatsapp || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium text-foreground truncate">{selectedReg.email}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-muted-foreground">Present Address:</span>
                    <p className="font-medium text-foreground">{selectedReg.presentAddress}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-muted-foreground">Permanent Address:</span>
                    <p className="font-medium text-foreground">
                      {selectedReg.permanentAddress || selectedReg.presentAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: IELTS Exam Info */}
              <div className="rounded-xl bg-muted/20 p-4 border border-border/50 space-y-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  3. IELTS Exam Details (পরীক্ষার বিবরণ)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Exam Type:</span>
                    <p className="font-semibold text-primary">{selectedReg.examType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <p className="font-semibold text-foreground">{selectedReg.testFormat}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Band:</span>
                    <p className="font-semibold text-foreground">{selectedReg.targetScore || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preferred Date:</span>
                    <p className="font-semibold text-foreground">{selectedReg.preferredDate}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Preferred Centre:</span>
                    <p className="font-semibold text-foreground">{selectedReg.preferredCentre}</p>
                  </div>
                  {selectedReg.previousExam && (
                    <div className="sm:col-span-3">
                      <span className="text-muted-foreground">Previous Exam:</span>{" "}
                      <span className="font-semibold text-foreground">
                        Yes (Score: {selectedReg.previousScore || "N/A"})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: Education & Occupation */}
              <div className="rounded-xl bg-muted/20 p-4 border border-border/50 space-y-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  4. Education & Occupation (শিক্ষাগত ও পেশাগত তথ্য)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Qualification:</span>
                    <p className="font-medium text-foreground">
                      {selectedReg.highestEducation || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Institution:</span>
                    <p className="font-medium text-foreground">
                      {selectedReg.institutionName || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Occupation:</span>
                    <p className="font-medium text-foreground">{selectedReg.occupation || "—"}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Uploaded Documents */}
              <div className="rounded-xl bg-muted/20 p-4 border border-border/50 space-y-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5 text-primary" />
                  5. Uploaded Documents (সংযুক্ত কাগজপত্র)
                </h4>
                <div className="flex flex-wrap gap-3 text-xs">
                  {selectedReg.passportCopyUrl ? (
                    <a
                      href={selectedReg.passportCopyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2 text-primary font-semibold hover:bg-primary/5 transition"
                    >
                      <IdCard className="h-4 w-4" />
                      View Passport / NID Copy
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">
                      পাসপোর্ট কপি আপলোড করা হয়নি।
                    </span>
                  )}

                  {selectedReg.photoUrl && (
                    <a
                      href={selectedReg.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2 text-primary font-semibold hover:bg-primary/5 transition"
                    >
                      <User className="h-4 w-4" />
                      View Photograph
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}

                  {selectedReg.otherDocsUrl && (
                    <a
                      href={selectedReg.otherDocsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2 text-primary font-semibold hover:bg-primary/5 transition"
                    >
                      <FileText className="h-4 w-4" />
                      Other Documents
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>

              {/* SECTION 6: Office Use Only / Admin Editor */}
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4" />
                    For Office Use Only · অফিস ব্যবস্থাপনা
                  </h4>
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="h-7 rounded-lg text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      তথ্য পরিবর্তন করুন
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Status */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Registration Status</Label>
                        <Select
                          value={editForm.status}
                          onValueChange={(val: any) =>
                            setEditForm({ ...editForm, status: val })
                          }
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New (নতুন)</SelectItem>
                            <SelectItem value="reviewing">Reviewing (যাচাইকরণ)</SelectItem>
                            <SelectItem value="submitted">
                              Submitted to Centre (সেন্টারে প্রেরিত)
                            </SelectItem>
                            <SelectItem value="registered">
                              Officially Registered (কনফার্মড)
                            </SelectItem>
                            <SelectItem value="rejected">Rejected (বাতিল)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Payment Status */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Payment Status</Label>
                        <Select
                          value={editForm.paymentStatus}
                          onValueChange={(val: any) =>
                            setEditForm({ ...editForm, paymentStatus: val })
                          }
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Unpaid (অপরিশোধিত)</SelectItem>
                            <SelectItem value="partial">Partial (আংশিক পরিশোধ)</SelectItem>
                            <SelectItem value="paid">Paid (সম্পূর্ণ পরিশোধ)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Exam Fee */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Exam Fee (BDT)</Label>
                        <Input
                          type="number"
                          value={editForm.examFee}
                          onChange={(e) =>
                            setEditForm({ ...editForm, examFee: e.target.value })
                          }
                          placeholder="e.g. 23500"
                          className="rounded-xl"
                        />
                      </div>

                      {/* Received By */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Received By (Staff Name)</Label>
                        <Input
                          value={editForm.receivedBy}
                          onChange={(e) =>
                            setEditForm({ ...editForm, receivedBy: e.target.value })
                          }
                          placeholder="e.g. Suborna Ghos / Sadia Ma'am"
                          className="rounded-xl"
                        />
                      </div>

                      {/* Remarks */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold">Staff Remarks / Notes</Label>
                        <Textarea
                          rows={2}
                          value={editForm.remarks}
                          onChange={(e) =>
                            setEditForm({ ...editForm, remarks: e.target.value })
                          }
                          placeholder="Internal remarks or test center reference number..."
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="rounded-xl text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={savingEdit}
                        onClick={handleSaveOfficeDetails}
                        className="rounded-xl bg-primary text-primary-foreground text-xs"
                      >
                        {savingEdit ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : null}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-semibold text-foreground">
                        {IELTS_REG_STATUS_LABEL[selectedReg.status]}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment:</span>
                      <p className="font-semibold uppercase text-foreground">
                        {selectedReg.paymentStatus}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Exam Fee:</span>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {selectedReg.examFee !== null
                          ? formatBDT(selectedReg.examFee)
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Received By:</span>
                      <p className="font-semibold text-foreground">
                        {selectedReg.receivedBy || "—"}
                      </p>
                    </div>
                    {selectedReg.remarks && (
                      <div className="sm:col-span-4 bg-background/80 p-2.5 rounded-xl border border-border">
                        <span className="text-muted-foreground font-medium">Remarks:</span>{" "}
                        <span className="text-foreground">{selectedReg.remarks}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-4 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedReg(null)}
                className="rounded-xl"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>রেজিস্ট্রেশন রেকর্ড মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription>
              এই প্রার্থীর রেজিস্ট্রেশন ডাটা ডাটাবেজ থেকে স্থায়ীভাবে মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
