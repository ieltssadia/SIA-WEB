"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/site/page-header";
import { PortalLogin } from "@/components/site/portal/portal-login";
import {
  PortalShell,
  type PortalSection,
} from "@/components/site/portal/portal-shell";
import { OverviewSection } from "@/components/site/portal/overview";
import { RoutineSection } from "@/components/site/portal/routine-section";
import { CourseSection } from "@/components/site/portal/course-section";
import { ScoresSection } from "@/components/site/portal/scores-section";
import { NoticesSection } from "@/components/site/portal/notices-section";
import { usePortalStore } from "@/lib/portal-store";

/**
 * Student Portal — 10MS-style learning dashboard.
 * Guest → OTP login; enrolled → app shell (Overview / Routine / Course /
 * Scores / Notices) backed by the Student + MockResult tables.
 */
export function PortalPage() {
  const student = usePortalStore((s) => s.student);
  const mocks = usePortalStore((s) => s.mocks);
  const hasHydrated = usePortalStore((s) => s.hasHydrated);
  const setSession = usePortalStore((s) => s.setSession);
  const [section, setSection] = useState<PortalSection>("overview");

  // Refresh fresh data from the server once per visit (best effort)
  useEffect(() => {
    const phone = usePortalStore.getState().student?.phone;
    if (!phone) return;
    let cancelled = false;
    fetch(`/api/portal/data?phone=${encodeURIComponent(phone)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.student) {
          setSession(data.student, data.mocks ?? []);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [setSession]);

  // Fresh section per session — logging in/out or switching accounts should
  // always land on the Overview dashboard (render-time state adjustment)
  const studentPhone = student?.phone ?? null;
  const [prevPhone, setPrevPhone] = useState(studentPhone);
  if (prevPhone !== studentPhone) {
    setPrevPhone(studentPhone);
    setSection("overview");
  }

  function handleSectionChange(next: PortalSection) {
    setSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!hasHydrated) {
    return (
      <>
        <PageHeader
          eyebrow="Student Portal"
          title={
            <>
              Student <span className="text-gold-gradient">Portal</span>
            </>
          }
        />
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto h-64 max-w-md animate-pulse rounded-3xl border border-border bg-card/50" />
          </div>
        </section>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <PageHeader
          eyebrow="Student Portal"
          title={
            <>
              Student <span className="text-gold-gradient">Portal</span>
            </>
          }
          subtitle="ভর্তিকৃত শিক্ষার্থীদের জন্য প্রাইভেট লার্নিং পোর্টাল — রুটিন, প্রোগ্রেস, mock scores ও batch update এক জায়গায়।"
        />
        <PortalLogin />
      </>
    );
  }

  return (
    <PortalShell student={student} section={section} onSectionChange={handleSectionChange}>
      {section === "overview" ? (
        <OverviewSection student={student} mocks={mocks} onNavigate={handleSectionChange} />
      ) : null}
      {section === "routine" ? <RoutineSection courseSlug={student.courseSlug} /> : null}
      {section === "course" ? <CourseSection student={student} /> : null}
      {section === "scores" ? <ScoresSection mocks={mocks} student={student} /> : null}
      {section === "notices" ? <NoticesSection /> : null}
    </PortalShell>
  );
}
