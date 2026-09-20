"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/site/page-header";
import { PortalLogin } from "@/components/site/portal/portal-login";
import {
  PortalShell,
  type PortalSection,
} from "@/components/site/portal/portal-shell";
import { EmptyPortal } from "@/components/site/portal/portal-empty";
import { OverviewSection } from "@/components/site/portal/overview";
import { RoutineSection } from "@/components/site/portal/routine-section";
import { CourseSection } from "@/components/site/portal/course-section";
import { ScoresSection } from "@/components/site/portal/scores-section";
import { CertificatesSection } from "@/components/site/portal/certificates-section";
import { DownloadsSection } from "@/components/site/portal/downloads-section";
import { SuggestionsSection } from "@/components/site/portal/suggestions-section";
import { NoticesSection } from "@/components/site/portal/notices-section";
import { usePortalStore } from "@/lib/portal-store";

/**
 * Student Portal — private learning dashboard for enrolled students.
 * Guest → phone + password login. Logged in with enrollments → app shell
 * (Overview / Routine / Course / Scores / Notices). Logged in WITHOUT any
 * enrollment → empty portal (nothing to show until they join a batch).
 */
export function PortalPage() {
  const user = usePortalStore((s) => s.user);
  const enrollments = usePortalStore((s) => s.enrollments);
  const mocks = usePortalStore((s) => s.mocks);
  const certificates = usePortalStore((s) => s.certificates);
  const hasHydrated = usePortalStore((s) => s.hasHydrated);
  const setSession = usePortalStore((s) => s.setSession);
  const logout = usePortalStore((s) => s.logout);
  const [section, setSection] = useState<PortalSection>("overview");

  // Refresh fresh data from the server once per visit (best effort)
  useEffect(() => {
    const phone = usePortalStore.getState().user?.phone;
    if (!phone) return;
    let cancelled = false;
    fetch(`/api/portal/data?phone=${encodeURIComponent(phone)}`)
      .then(async (r) => (r.ok ? { ok: true, data: await r.json().catch(() => null) } : { ok: false, data: null }))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (ok && data?.user) {
          setSession(
            data.user,
            data.enrollments ?? [],
            data.mocks ?? [],
            data.token,
            data.certificates ?? []
          );
        } else if (!ok) {
          // Account no longer exists — force re-login
          logout();
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [setSession, logout]);

  // Fresh section per session — logging in/out or switching accounts should
  // always land on the Overview dashboard (render-time state adjustment)
  const userPhone = user?.phone ?? null;
  const [prevPhone, setPrevPhone] = useState(userPhone);
  if (prevPhone !== userPhone) {
    setPrevPhone(userPhone);
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
              Student <span className="text-brand-gradient">Portal</span>
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

  if (!user) {
    return (
      <>
        <PageHeader
          eyebrow="Student Portal"
          title={
            <>
              Student <span className="text-brand-gradient">Portal</span>
            </>
          }
          subtitle="শুধু ভর্তিকৃত শিক্ষার্থীদের জন্য প্রাইভেট পোর্টাল — ভর্তির সময় দেওয়া মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগ ইন করুন।"
        />
        <PortalLogin />
      </>
    );
  }

  // Logged in but not enrolled in any course — the portal stays empty
  if (enrollments.length === 0) {
    return <EmptyPortal user={user} />;
  }

  const primary = enrollments.find((e) => e.status === "active") ?? enrollments[0];
  const batchLabel =
    enrollments.length > 1
      ? `${primary.batch} +${enrollments.length - 1}`
      : primary.batch;

  return (
    <PortalShell
      user={user}
      batchLabel={batchLabel}
      section={section}
      onSectionChange={handleSectionChange}
    >
      {section === "overview" ? (
        <OverviewSection
          user={user}
          enrollments={enrollments}
          mocks={mocks}
          certificates={certificates}
          onNavigate={handleSectionChange}
        />
      ) : null}
      {section === "routine" ? (
        <RoutineSection courseSlugs={enrollments.map((e) => e.courseSlug)} />
      ) : null}
      {section === "course" ? <CourseSection enrollments={enrollments} /> : null}
      {section === "scores" ? (
        <ScoresSection mocks={mocks} targetBand={primary.targetBand} />
      ) : null}
      {section === "certificates" ? (
        <CertificatesSection
          userName={user.name}
          certificates={certificates}
          primary={primary}
        />
      ) : null}
      {section === "downloads" ? <DownloadsSection /> : null}
      {section === "suggestions" ? <SuggestionsSection /> : null}
      {section === "notices" ? <NoticesSection /> : null}
    </PortalShell>
  );
}
