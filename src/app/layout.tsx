import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Noto_Sans_Bengali,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sadia's IELTS — Unlock Your Future | IELTS Coaching in Sreemangal, Sylhet",
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
    title: "Sadia's IELTS — Unlock Your Future",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${notoBengali.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
