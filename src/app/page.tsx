import { SiteHeader } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { StatsStrip } from "@/components/site/stats-strip";
import { CoursesSection } from "@/components/site/courses-section";
import { FreeResourcesSection } from "@/components/site/free-resources-section";
import { SkillsSection } from "@/components/site/skills-section";
import { WhyUsSection } from "@/components/site/why-us-section";
import { TipsSection } from "@/components/site/tips-section";
import { StoriesSection } from "@/components/site/stories-section";
import { InstructorSection } from "@/components/site/instructor-section";
import { FaqSection } from "@/components/site/faq-section";
import { EnrollSection } from "@/components/site/enroll-section";
import { FloatingCta } from "@/components/site/floating-cta";
import { SiteFooter } from "@/components/site/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <StatsStrip />
        <CoursesSection />
        <FreeResourcesSection />
        <SkillsSection />
        <WhyUsSection />
        <TipsSection />
        <StoriesSection />
        <InstructorSection />
        <FaqSection />
        <EnrollSection />
      </main>
      <SiteFooter />
      <FloatingCta />
    </div>
  );
}
