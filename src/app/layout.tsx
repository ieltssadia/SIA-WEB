import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

/* Local brand fonts (from the client's font pack — no external fetching):
   Urbanist → Latin body/UI · Bricolage Grotesque → display/headings
   Hind Siliguri → Bengali body · Atma → Bengali display accent  */
const urbanist = localFont({
  src: [
    {
      path: "../../public/fonts/Urbanist-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-urbanist",
  display: "swap",
});

const bricolage = localFont({
  src: [
    { path: "../../public/fonts/BricolageGrotesque-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/BricolageGrotesque-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/BricolageGrotesque-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/BricolageGrotesque-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/BricolageGrotesque-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-bricolage",
  display: "swap",
});

const hindSiliguri = localFont({
  src: [
    { path: "../../public/fonts/HindSiliguri-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/HindSiliguri-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/HindSiliguri-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/HindSiliguri-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const atma = localFont({
  src: [
    { path: "../../public/fonts/Atma-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Atma-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Atma-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Atma-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-atma",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sadia's IELTS: Unlock Your Future | IELTS Coaching in Sreemangal, Sylhet",
  description:
    "Transform your English skills to perfection with Sadia's IELTS. 9+ years of excellence, 316+ batches completed, 5,983+ successful learners. Basic to IELTS, Crash Course, Free Course & more in Sreemangal, Moulvibazar, Sylhet.",
  keywords: [
    "Sadia's IELTS",
    "IELTS coaching Sreemangal",
    "IELTS Sylhet",
    "IELTS Bangladesh",
    "Basic to IELTS",
    "IELTS crash course",
    "English learning Moulvibazar",
  ],
  icons: {
    icon: "/sadia-logo.png",
  },
  openGraph: {
    title: "Sadia's IELTS: Unlock Your Future",
    description:
      "Transform Your English Skills to Perfection. 9+ years, 316+ batches, 5,983+ learners in Sreemangal, Sylhet.",
    url: "https://sadiasielts.com",
    siteName: "Sadia's IELTS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${urbanist.variable} ${bricolage.variable} ${hindSiliguri.variable} ${atma.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
