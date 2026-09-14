import { PageHeader } from "@/components/site/page-header";
import { CoursesSection } from "@/components/site/courses-section";

export function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Courses"
        title={
          <>
            IELTS Courses for <span className="text-brand-gradient">Every Level</span>
          </>
        }
        subtitle="একদম শূন্য থেকে Band 7+ — আপনার level ও target অনুযায়ী সঠিক কোর্সটি বেছে নিন।"
        crumbs={[{ label: "Courses" }]}
      />
      <CoursesSection />
    </>
  );
}
