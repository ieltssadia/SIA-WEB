import type { Metadata } from "next";
import { NotFoundPage } from "@/components/site/pages/not-found-page";

/**
 * Next.js-level 404 (real, non-hash paths that fall outside the site router).
 * Renders the same branded 404 the hash router shows for unknown "#/..." routes.
 */
export const metadata: Metadata = {
  title: "পাতাটি খুঁজে পাওয়া যায়নি (404) | Sadia's IELTS",
  description:
    "আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি। Sadia's IELTS হোমপেজে ফিরে যান বা কোর্স, মক টেস্ট ও রুটিন দেখুন।",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundPage />;
}
