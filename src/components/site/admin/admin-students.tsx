"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, GraduationCap, Layers, Target } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminStudentDetail, AdminStudentRow } from "@/lib/admin-types";
import {
  EmptyState,
  ENROLLMENT_STATUS_TONE,
  ErrorState,
  SectionHeading,
  ToneBadge,
  formatDate,
} from "@/components/site/admin/admin-shared";
import { useAdminStore } from "@/lib/admin-store";
import { courses } from "@/lib/site-data";

const courseTitle = (slug: string) =>
  courses.find((c) => c.slug === slug)?.title ?? slug;

/**
 * Admin Students — portal accounts with enrollment counts; clicking a card
 * opens a sheet with the full enrollment + mock-score history.
 */
export function AdminStudents() {
  const token = useAdminStore((s) => s.token);

  const [students, setStudents] = useState<AdminStudentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/students", {
        headers: { "x-admin-key": token },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; students?: AdminStudentRow[]; error?: string }
        | null;
      if (res.ok && data?.ok && data.students) setStudents(data.students);
      else setError(data?.error ?? "শিক্ষার্থী লোড করা যায়নি।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Students: শিক্ষার্থী"
        sub="পোর্টাল অ্যাকাউন্ট, ভর্তি ও মক টেস্ট স্কোর"
      />

      {loading && !students ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {error && !loading ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {students && !loading ? (
        students.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="কোনো পোর্টাল অ্যাকাউন্ট নেই"
            hint="Checkout থেকে কোর্স এনরোলমেন্ট হলেই অ্যাকাউন্ট তৈরি হয়।"
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {students.map((s) => (
              <li key={s.id}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveId(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveId(s.id);
                    }
                  }}
                  className="h-full cursor-pointer rounded-2xl border-border bg-card transition hover:border-primary/50 hover:shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary" aria-hidden="true">
                        {s.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.phone}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                        {s.enrollmentCount} enrollment{s.enrollmentCount === 1 ? "" : "s"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatDate(s.createdAt)}
                      </span>
                    </div>
                    {s.latestEnrollment ? (
                      <p className="mt-2 truncate rounded-lg bg-muted/50 px-2 py-1.5 text-xs">
                        <span className="font-medium text-foreground">
                          {courseTitle(s.latestEnrollment.courseSlug)}
                        </span>{" "}
                        · {s.latestEnrollment.batch}
                      </p>
                    ) : (
                      <p className="mt-2 rounded-lg bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground">
                        কোনো ভর্তি নেই, খালি পোর্টাল
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )
      ) : null}

      <StudentSheet id={activeId} onClose={() => setActiveId(null)} />
    </div>
  );
}

function StudentSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const token = useAdminStore((s) => s.token);
  const [detail, setDetail] = useState<AdminStudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    let cancelled = false;
    // Yield to a microtask first — state resets must not run synchronously
    // inside the effect body (react-hooks/set-state-in-effect).
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setDetail(null);
      setError(null);
      setLoading(true);
    };
    void run();
    fetch(`/api/admin/students/${id}`, { headers: { "x-admin-key": token } })
      .then(async (r) => {
        const data = (await r.json().catch(() => null)) as
          | { ok?: boolean; student?: AdminStudentDetail; error?: string }
          | null;
        if (cancelled) return;
        if (r.ok && data?.ok && data.student) setDetail(data.student);
        else setError(data?.error ?? "লোড করা যায়নি।");
      })
      .catch(() => {
        if (!cancelled) setError("নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{detail ? detail.name : "Student"}</SheetTitle>
          <SheetDescription>
            {detail ? `${detail.phone} · joined ${formatDate(detail.createdAt)}` : "লোড হচ্ছে…"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          ) : null}

          {!loading && error ? <p className="text-sm text-red-600">{error}</p> : null}

          {detail && !loading ? (
            <>
              {/* Enrollments */}
              <section aria-label="Enrollments">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
                  Enrollments: ভর্তি ({detail.enrollments.length})
                </h3>
                {detail.enrollments.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    এই অ্যাকাউন্টে কোনো ভর্তি নেই, পোর্টাল খালি দেখাবে।
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {detail.enrollments.map((e) => (
                      <li key={e.id} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {courseTitle(e.courseSlug)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {e.batch}
                              {e.targetBand ? ` · target ${e.targetBand}` : ""}
                              {e.examDate ? ` · exam ${formatDate(e.examDate)}` : ""}
                            </p>
                          </div>
                          <ToneBadge tone={ENROLLMENT_STATUS_TONE[e.status as keyof typeof ENROLLMENT_STATUS_TONE] ?? "muted"}>
                            {e.status}
                          </ToneBadge>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Target className="h-3 w-3" aria-hidden="true" /> Progress
                            </p>
                            <Progress value={e.progress} aria-label={`Progress ${e.progress}%`} />
                            <p className="mt-1 text-[11px] text-muted-foreground">{e.progress}%</p>
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] text-muted-foreground">Attendance</p>
                            <Progress value={e.attendance} aria-label={`Attendance ${e.attendance}%`} />
                            <p className="mt-1 text-[11px] text-muted-foreground">{e.attendance}%</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Mock results */}
              <section aria-label="Mock results">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
                  Mock Results: মক স্কোর ({detail.mockResults.length})
                </h3>
                {detail.mockResults.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    এখনো কোনো মক টেস্ট দেয়নি।
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead>Test</TableHead>
                          <TableHead>L</TableHead>
                          <TableHead>R</TableHead>
                          <TableHead>W</TableHead>
                          <TableHead>S</TableHead>
                          <TableHead className="font-bold">Overall</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.mockResults.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell>
                              <span className="block text-xs font-medium">{m.label}</span>
                              <span className="block text-[11px] text-muted-foreground">{m.date}</span>
                            </TableCell>
                            <TableCell>{m.listening}</TableCell>
                            <TableCell>{m.reading}</TableCell>
                            <TableCell>{m.writing}</TableCell>
                            <TableCell>{m.speaking}</TableCell>
                            <TableCell className="font-bold text-primary">{m.overall}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
