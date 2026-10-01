"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  FileText,
  HelpCircle,
  IdCard,
  Loader2,
  MapPin,
  Phone,
  Printer,
  Search,
  Send,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type RegistrationFormState = {
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  nationality: string;
  identityNumber: string;
  phone: string;
  whatsapp: string;
  email: string;
  presentAddress: string;
  permanentAddress: string;
  examType: "IELTS Academic" | "IELTS General Training";
  testFormat: "Computer-Delivered" | "Paper-Based";
  modules: string;
  preferredDate: string;
  preferredCentre: string;
  previousExam: boolean;
  previousScore: string;
  targetScore: string;
  highestEducation: string;
  institutionName: string;
  occupation: string;
  passportCopyUrl: string;
  photoUrl: string;
  otherDocsUrl: string;
  agree: boolean;
};

const INITIAL_FORM: RegistrationFormState = {
  fullName: "",
  fatherName: "",
  motherName: "",
  dob: "",
  gender: "Male",
  nationality: "Bangladeshi",
  identityNumber: "",
  phone: "",
  whatsapp: "",
  email: "",
  presentAddress: "",
  permanentAddress: "",
  examType: "IELTS Academic",
  testFormat: "Computer-Delivered",
  modules: "Listening, Reading, Writing, Speaking",
  preferredDate: "",
  preferredCentre: "Sylhet",
  previousExam: false,
  previousScore: "",
  targetScore: "7.0",
  highestEducation: "HSC / Equivalent",
  institutionName: "",
  occupation: "Student",
  passportCopyUrl: "",
  photoUrl: "",
  otherDocsUrl: "",
  agree: true,
};

const EXAM_CENTRES = [
  "Sylhet (Rose View Hotel / British Council / IDP Venue)",
  "Dhaka - Banani",
  "Dhaka - Dhanmondi",
  "Dhaka - Uttara",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Cumilla",
];

const TARGET_SCORES = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export function IeltsRegistrationPage() {
  const [activeTab, setActiveTab] = useState<"form" | "track">("form");
  const [form, setForm] = useState<RegistrationFormState>(INITIAL_FORM);
  const [sameAsPresent, setSameAsPresent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPassport, setUploadingPassport] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    regNo: string;
    fullName: string;
    phone: string;
    email: string;
    examType: string;
    testFormat: string;
    preferredDate: string;
    preferredCentre: string;
    createdAt: string;
  } | null>(null);

  // Tracking State
  const [trackingQuery, setTrackingQuery] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResults, setTrackingResults] = useState<any[] | null>(null);
  const [trackingSearched, setTrackingSearched] = useState(false);

  // Handle single file upload
  async function handleFileUpload(file: File, type: "passport" | "photo" | "docs") {
    const formData = new FormData();
    formData.append("file", file);

    if (type === "passport") setUploadingPassport(true);
    if (type === "photo") setUploadingPhoto(true);
    if (type === "docs") setUploadingDocs(true);

    try {
      const res = await fetch("/api/ielts-registration/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.ok && data.url) {
        if (type === "passport") {
          setForm((f) => ({ ...f, passportCopyUrl: data.url }));
          toast.success("পাসপোর্ট কপি সফলভাবে আপলোড হয়েছে।");
        } else if (type === "photo") {
          setForm((f) => ({ ...f, photoUrl: data.url }));
          toast.success("ছবি সফলভাবে আপলোড হয়েছে।");
        } else {
          setForm((f) => ({ ...f, otherDocsUrl: data.url }));
          toast.success("ডকুমেন্ট সফলভাবে আপলোড হয়েছে।");
        }
      } else {
        toast.error(data.error || "ফাইল আপলোড ব্যর্থ হয়েছে।");
      }
    } catch {
      toast.error("ফাইল আপলোড করতে সমস্যা হয়েছে। নেটওয়ার্ক চেক করুন।");
    } finally {
      if (type === "passport") setUploadingPassport(false);
      if (type === "photo") setUploadingPhoto(false);
      if (type === "docs") setUploadingDocs(false);
    }
  }

  // Handle Form Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.fullName.trim()) {
      toast.error("প্রার্থীর পুরো নাম লিখুন।");
      return;
    }
    if (!form.dob.trim()) {
      toast.error("জন্ম তারিখ নির্বাচন করুন।");
      return;
    }
    if (!form.identityNumber.trim()) {
      toast.error("NID / Birth Registration / Passport নম্বর প্রদান করুন।");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("মোবাইল নম্বর লিখুন।");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      toast.error("সঠিক ইমেইল এড্রেস লিখুন।");
      return;
    }
    if (!form.presentAddress.trim()) {
      toast.error("বর্তমান ঠিকানা লিখুন।");
      return;
    }
    if (!form.preferredDate.trim()) {
      toast.error("পরীক্ষার পছন্দের তারিখ নির্বাচন করুন।");
      return;
    }
    if (!form.agree) {
      toast.error("ঘোষণাপত্রটি (Declaration) টিক দিয়ে সম্মতি জানান।");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        permanentAddress: sameAsPresent ? form.presentAddress : form.permanentAddress,
      };

      const res = await fetch("/api/ielts-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setSubmittedData({
          regNo: data.registration.regNo,
          fullName: data.registration.fullName,
          phone: data.registration.phone,
          email: data.registration.email,
          examType: data.registration.examType,
          testFormat: data.registration.testFormat,
          preferredDate: data.registration.preferredDate,
          preferredCentre: data.registration.preferredCentre,
          createdAt: data.registration.createdAt,
        });
        toast.success("আপনার IELTS পরীক্ষার রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(data.error || "রেজিস্ট্রেশন করতে সমস্যা হয়েছে।");
      }
    } catch {
      toast.error("সার্ভারে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Tracking Search
  async function handleTrackSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingQuery.trim()) {
      toast.error("রেজিস্ট্রেশন আইডি অথবা মোবাইল নম্বর লিখুন।");
      return;
    }

    setTrackingLoading(true);
    setTrackingSearched(true);
    try {
      const res = await fetch(
        `/api/ielts-registration?q=${encodeURIComponent(trackingQuery.trim())}`
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setTrackingResults(data.registrations || []);
      } else {
        setTrackingResults([]);
        toast.error(data.error || "তথ্য লোড করা যায়নি।");
      }
    } catch {
      toast.error("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
      setTrackingResults([]);
    } finally {
      setTrackingLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("ট্র্যাকিং আইডি কপি করা হয়েছে!");
  }

  return (
    <>
      <PageHeader
        title={
          <>
            Official IELTS <span className="text-brand-gradient">Exam Registration</span>
          </>
        }
        subtitle="সরাসরি ব্রিটিশ কাউন্সিল এবং আইডিপির অফিশিয়াল ভেন্যুর জন্য সাদিয়া'স আইইএলটিএস একাডেমির মাধ্যমে নির্বিঘ্নে রেজিস্ট্রেশন করুন।"
        crumbs={[{ label: "IELTS Exam Registration" }]}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === "form"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            রেজিস্ট্রেশন ফর্ম (Exam Form)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all ${
              activeTab === "track"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            আবেদনের অবস্থা ট্র্যাক করুন (Track Status)
          </button>
        </div>

        {/* TAB 1: REGISTRATION FORM */}
        {activeTab === "form" && (
          <div>
            {submittedData ? (
              /* Submission Success Receipt */
              <Reveal>
                <Card className="overflow-hidden border-2 border-primary/25 shadow-2xl">
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      রেজিস্ট্রেশন সফলভাবে জমা হয়েছে!
                    </h2>
                    <p className="mt-2 text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
                      আপনার IELTS পরীক্ষার নিবন্ধন ফর্মটি গ্রহণ করা হয়েছে। একটি নিশ্চিতকরণ ইমেইল আপনার
                      ইমেইলে পাঠানো হয়েছে।
                    </p>
                  </div>

                  <CardContent className="p-6 sm:p-8 space-y-6">
                    {/* Official Registration Tracking Badge */}
                    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 sm:p-6 text-center">
                      <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                        Your Official Registration Tracking ID
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-3">
                        <span className="font-mono text-2xl sm:text-3xl font-extrabold text-primary">
                          {submittedData.regNo}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(submittedData.regNo)}
                          className="h-9 w-9 rounded-xl hover:bg-primary/10"
                          title="Copy ID"
                        >
                          <Copy className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        ভবিষ্যতে আবেদনের সর্বশেষ অবস্থা জানতে এই ট্র্যাকিং নম্বরটি সংরক্ষণ করুন।
                      </p>
                    </div>

                    {/* Summary Info Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                      <div className="rounded-xl bg-muted/40 p-4 border border-border/50">
                        <p className="text-xs text-muted-foreground">Candidate Name (প্রার্থীর নাম)</p>
                        <p className="font-semibold text-foreground text-base mt-0.5">
                          {submittedData.fullName}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-4 border border-border/50">
                        <p className="text-xs text-muted-foreground">Mobile & Email</p>
                        <p className="font-semibold text-foreground mt-0.5">
                          {submittedData.phone}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {submittedData.email}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-4 border border-border/50">
                        <p className="text-xs text-muted-foreground">Exam Type & Format</p>
                        <p className="font-semibold text-foreground mt-0.5">
                          {submittedData.examType} ({submittedData.testFormat})
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-4 border border-border/50">
                        <p className="text-xs text-muted-foreground">Exam Centre & Preferred Date</p>
                        <p className="font-semibold text-foreground mt-0.5">
                          {submittedData.preferredCentre}
                        </p>
                        <p className="text-xs text-primary font-medium">
                          Date: {submittedData.preferredDate}
                        </p>
                      </div>
                    </div>

                    {/* Academy Contact Box */}
                    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-950 dark:text-amber-200">
                      <h4 className="font-bold flex items-center gap-2 text-amber-900 dark:text-amber-100">
                        <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                        সরাসরি যোগাযোগ ও সহায়তা:
                      </h4>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        সৈয়দ মুজিবুর রহমান মার্কেট, ২য় তলা, চৌমুহনা, শ্রীমঙ্গল। হটলাইন:{" "}
                        <a href="tel:01752716238" className="font-bold text-primary underline">
                          01752716238
                        </a>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="rounded-xl gap-2"
                      >
                        <Printer className="h-4 w-4" />
                        প্রিন্ট স্লিপ (Print Confirmation)
                      </Button>
                      <Button
                        onClick={() => {
                          setSubmittedData(null);
                          setForm(INITIAL_FORM);
                        }}
                        className="rounded-xl bg-primary text-primary-foreground gap-2"
                      >
                        নতুন রেজিস্ট্রেশন করুন
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ) : (
              /* The Official Registration Form */
              <Reveal>
                <Card className="border border-border/70 shadow-xl overflow-hidden rounded-3xl">
                  {/* Official Header Banner */}
                  <div className="border-b border-border/60 bg-card/60 p-6 sm:p-8 text-center relative">
                    <div className="mx-auto mb-3 flex items-center justify-center gap-2">
                      <Image
                        src="/sadia-logo.png"
                        alt="Sadia's IELTS Academy"
                        width={180}
                        height={50}
                        className="h-10 w-auto"
                      />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground uppercase">
                      IELTS Exam Registration Form
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
                      <span>
                        📍 <strong>Address:</strong> Syed Mujibur Rahman Market, 2nd Floor,
                        Chowmuhona, Sreemangal
                      </span>
                      <span>·</span>
                      <span>
                        📞 <strong>Contact:</strong> 01752716238
                      </span>
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                    {/* SECTION 1: Personal Information */}
                    <div className="space-y-4 rounded-2xl bg-muted/20 p-4 sm:p-6 border border-border/50">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                          1
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          Personal Information (ব্যক্তিগত তথ্য)
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Candidate Full Name */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-sm font-semibold">
                            Candidate&apos;s Full Name (পাসপোর্ট অনুযায়ী পুরো নাম){" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            required
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            placeholder="e.g. MOHAMMED RAHMAN"
                            className="rounded-xl"
                          />
                        </div>

                        {/* Father's Name */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Father&apos;s Name (পিতার নাম)</Label>
                          <Input
                            value={form.fatherName}
                            onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                            placeholder="Father's full name"
                            className="rounded-xl"
                          />
                        </div>

                        {/* Mother's Name */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Mother&apos;s Name (মাতার নাম)</Label>
                          <Input
                            value={form.motherName}
                            onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                            placeholder="Mother's full name"
                            className="rounded-xl"
                          />
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold">
                            Date of Birth (জন্ম তারিখ) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="date"
                            required
                            value={form.dob}
                            onChange={(e) => setForm({ ...form, dob: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold">Gender (লিঙ্গ)</Label>
                          <Select
                            value={form.gender}
                            onValueChange={(val: any) => setForm({ ...form, gender: val })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male (পুরুষ)</SelectItem>
                              <SelectItem value="Female">Female (মহিলা)</SelectItem>
                              <SelectItem value="Other">Other (অন্যান্য)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Nationality */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Nationality (জাতীয়তা)</Label>
                          <Input
                            value={form.nationality}
                            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                            placeholder="Bangladeshi"
                            className="rounded-xl"
                          />
                        </div>

                        {/* Identity Number */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold">
                            NID / Birth Reg / Passport No. <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            required
                            value={form.identityNumber}
                            onChange={(e) =>
                              setForm({ ...form, identityNumber: e.target.value })
                            }
                            placeholder="Passport / NID / Birth Certificate No."
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Contact Information */}
                    <div className="space-y-4 rounded-2xl bg-muted/20 p-4 sm:p-6 border border-border/50">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                          2
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          Contact Information (যোগাযোগের তথ্য)
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold">
                            Mobile Number (মোবাইল নম্বর) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="017XXXXXXXX"
                            className="rounded-xl"
                          />
                        </div>

                        {/* WhatsApp Number */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">WhatsApp Number (হোয়াটসঅ্যাপ)</Label>
                          <Input
                            type="tel"
                            value={form.whatsapp}
                            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                            placeholder="017XXXXXXXX"
                            className="rounded-xl"
                          />
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-sm font-semibold">
                            Email Address (ইমেইল এড্রেস) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="example@gmail.com"
                            className="rounded-xl"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            এই ইমেইলে ব্রিটিশ কাউন্সিল / আইডিপির অফিশিয়াল কনফার্মেশন পাঠানো হবে।
                          </p>
                        </div>

                        {/* Present Address */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-sm font-semibold">
                            Present Address (বর্তমান ঠিকানা) <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            required
                            rows={2}
                            value={form.presentAddress}
                            onChange={(e) =>
                              setForm({ ...form, presentAddress: e.target.value })
                            }
                            placeholder="House / Village, Road, Thana, District"
                            className="rounded-xl"
                          />
                        </div>

                        {/* Same Address toggle */}
                        <div className="sm:col-span-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sameAsPresent"
                            checked={sameAsPresent}
                            onChange={(e) => setSameAsPresent(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor="sameAsPresent"
                            className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
                          >
                            Permanent Address is same as Present Address (স্থায়ী ঠিকানা বর্তমান ঠিকানার
                            অনুরূপ)
                          </label>
                        </div>

                        {/* Permanent Address (if different) */}
                        {!sameAsPresent && (
                          <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-sm font-medium">
                              Permanent Address (স্থায়ী ঠিকানা)
                            </Label>
                            <Textarea
                              rows={2}
                              value={form.permanentAddress}
                              onChange={(e) =>
                                setForm({ ...form, permanentAddress: e.target.value })
                              }
                              placeholder="Permanent Address"
                              className="rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 3: IELTS Exam Information */}
                    <div className="space-y-4 rounded-2xl bg-muted/20 p-4 sm:p-6 border border-border/50">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                          3
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          IELTS Exam Information (আইইএলটিএস পরীক্ষার তথ্য)
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Exam Type */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">
                            Exam Type (পরীক্ষার ধরন) <span className="text-destructive">*</span>
                          </Label>
                          <RadioGroup
                            value={form.examType}
                            onValueChange={(val: any) => setForm({ ...form, examType: val })}
                            className="flex flex-col sm:flex-row gap-3"
                          >
                            <div className="flex items-center space-x-2 rounded-xl border border-border bg-card p-3 flex-1 cursor-pointer">
                              <RadioGroupItem value="IELTS Academic" id="acad" />
                              <Label htmlFor="acad" className="cursor-pointer font-medium">
                                IELTS Academic
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-xl border border-border bg-card p-3 flex-1 cursor-pointer">
                              <RadioGroupItem value="IELTS General Training" id="gt" />
                              <Label htmlFor="gt" className="cursor-pointer font-medium">
                                General Training
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Test Format */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">
                            Test Format (পরীক্ষার মাধ্যম) <span className="text-destructive">*</span>
                          </Label>
                          <RadioGroup
                            value={form.testFormat}
                            onValueChange={(val: any) => setForm({ ...form, testFormat: val })}
                            className="flex flex-col sm:flex-row gap-3"
                          >
                            <div className="flex items-center space-x-2 rounded-xl border border-border bg-card p-3 flex-1 cursor-pointer">
                              <RadioGroupItem value="Computer-Delivered" id="cd" />
                              <Label htmlFor="cd" className="cursor-pointer font-medium">
                                Computer-Delivered (CD)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-xl border border-border bg-card p-3 flex-1 cursor-pointer">
                              <RadioGroupItem value="Paper-Based" id="pb" />
                              <Label htmlFor="pb" className="cursor-pointer font-medium">
                                Paper-Based (PB)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Test Modules */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-sm font-medium">
                            Test Modules (মডিউলসমূহ - ৪টি স্কিল অন্তর্ভুক্ত)
                          </Label>
                          <Input
                            disabled
                            value={form.modules}
                            className="rounded-xl bg-muted/60 text-muted-foreground cursor-not-allowed"
                          />
                        </div>

                        {/* Preferred Exam Date */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold">
                            Preferred Exam Date (পছন্দের তারিখ){" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="date"
                            required
                            value={form.preferredDate}
                            onChange={(e) =>
                              setForm({ ...form, preferredDate: e.target.value })
                            }
                            className="rounded-xl"
                          />
                        </div>

                        {/* Preferred Exam Centre */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold">
                            Preferred Exam Centre (পরীক্ষা কেন্দ্র){" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={form.preferredCentre}
                            onValueChange={(val) => setForm({ ...form, preferredCentre: val })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select Exam Centre" />
                            </SelectTrigger>
                            <SelectContent>
                              {EXAM_CENTRES.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Previous Exam Experience */}
                        <div className="space-y-2 sm:col-span-2 pt-2">
                          <Label className="text-sm font-medium">
                            Previous IELTS Exam Taken? (পূর্বে কি IELTS পরীক্ষা দিয়েছেন?)
                          </Label>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="radio"
                                name="prevExam"
                                checked={form.previousExam === true}
                                onChange={() => setForm({ ...form, previousExam: true })}
                                className="text-primary"
                              />
                              Yes (হ্যাঁ)
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="radio"
                                name="prevExam"
                                checked={form.previousExam === false}
                                onChange={() =>
                                  setForm({ ...form, previousExam: false, previousScore: "" })
                                }
                                className="text-primary"
                              />
                              No (না)
                            </label>
                          </div>
                        </div>

                        {/* Previous Score (if Yes) */}
                        {form.previousExam && (
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                              Previous Overall Band Score
                            </Label>
                            <Input
                              value={form.previousScore}
                              onChange={(e) =>
                                setForm({ ...form, previousScore: e.target.value })
                              }
                              placeholder="e.g. 6.0 or 6.5"
                              className="rounded-xl"
                            />
                          </div>
                        )}

                        {/* Target Band Score */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">
                            Target Band Score (কাঙ্ক্ষিত ব্যান্ড স্কোর)
                          </Label>
                          <Select
                            value={form.targetScore}
                            onValueChange={(val) => setForm({ ...form, targetScore: val })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Target score" />
                            </SelectTrigger>
                            <SelectContent>
                              {TARGET_SCORES.map((score) => (
                                <SelectItem key={score} value={score}>
                                  Band {score}+
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Educational & Professional Information */}
                    <div className="space-y-4 rounded-2xl bg-muted/20 p-4 sm:p-6 border border-border/50">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                          4
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          Educational & Professional (শিক্ষাগত ও পেশাগত তথ্য)
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Highest Qualification */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Highest Qualification</Label>
                          <Input
                            value={form.highestEducation}
                            onChange={(e) =>
                              setForm({ ...form, highestEducation: e.target.value })
                            }
                            placeholder="e.g. HSC, Bachelor, Masters"
                            className="rounded-xl"
                          />
                        </div>

                        {/* Institution Name */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Institution / University</Label>
                          <Input
                            value={form.institutionName}
                            onChange={(e) =>
                              setForm({ ...form, institutionName: e.target.value })
                            }
                            placeholder="College / University Name"
                            className="rounded-xl"
                          />
                        </div>

                        {/* Occupation */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">Occupation (পেশা)</Label>
                          <Input
                            value={form.occupation}
                            onChange={(e) =>
                              setForm({ ...form, occupation: e.target.value })
                            }
                            placeholder="Student / Job Holder / etc."
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: Required Documents */}
                    <div className="space-y-4 rounded-2xl bg-muted/20 p-4 sm:p-6 border border-border/50">
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                          5
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                          Required Documents (প্রয়োজনীয় ডকুমেন্টস আপলোড)
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Passport / NID Copy */}
                        <div className="rounded-xl border border-dashed border-border p-4 text-center space-y-2">
                          <IdCard className="h-8 w-8 mx-auto text-primary/70" />
                          <p className="text-xs font-semibold text-foreground">
                            Valid Passport Copy / NID
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            PDF, JPG বা PNG (সর্বোচ্চ ১৫ MB)
                          </p>

                          {form.passportCopyUrl ? (
                            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg">
                              <CheckCircle2 className="h-4 w-4" />
                              ফাইল আপলোড হয়েছে
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, passportCopyUrl: "" })}
                                className="text-red-500 hover:text-red-700 ml-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition">
                              {uploadingPassport ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              পাসপোর্ট কপি আপলোড
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="sr-only"
                                disabled={uploadingPassport}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) void handleFileUpload(file, "passport");
                                }}
                              />
                            </label>
                          )}
                        </div>

                        {/* Recent Photograph */}
                        <div className="rounded-xl border border-dashed border-border p-4 text-center space-y-2">
                          <User className="h-8 w-8 mx-auto text-primary/70" />
                          <p className="text-xs font-semibold text-foreground">
                            Recent Passport Photo
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            পাসপোর্ট সাইজ রঙিন ছবি (JPG / PNG)
                          </p>

                          {form.photoUrl ? (
                            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg">
                              <CheckCircle2 className="h-4 w-4" />
                              ছবি আপলোড হয়েছে
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, photoUrl: "" })}
                                className="text-red-500 hover:text-red-700 ml-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition">
                              {uploadingPhoto ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              ছবি আপলোড
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                disabled={uploadingPhoto}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) void handleFileUpload(file, "photo");
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 6: Declaration & Agreement */}
                    <div className="space-y-4 rounded-2xl bg-amber-500/5 p-4 sm:p-6 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="declarationCheck"
                          required
                          checked={form.agree}
                          onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-amber-500 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor="declarationCheck"
                          className="text-xs sm:text-sm text-foreground/90 leading-relaxed cursor-pointer"
                        >
                          <strong>Declaration (ঘোষণাপত্র):</strong> আমি নিশ্চয়তা দিচ্ছি যে উপরের সকল
                          প্রদত্ত তথ্য নির্ভুল ও সত্য। ব্রিটিশ কাউন্সিল / আইডিপির সাথে পরীক্ষার অফিশিয়াল
                          নিবন্ধন কার্যক্রম পরিচালনার জন্য সাদিয়া&apos;স আইইএলটিএস একাডেমিকে আমি সম্মতি
                          প্রদান করছি।
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-2xl py-6 text-base font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            রেজিস্ট্রেশন জমা হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Submit IELTS Exam Registration Form
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Card>
              </Reveal>
            )}
          </div>
        )}

        {/* TAB 2: TRACK REGISTRATION STATUS */}
        {activeTab === "track" && (
          <Reveal>
            <Card className="border border-border shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center p-6 sm:p-8 bg-muted/20 border-b border-border">
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  IELTS Registration Status Tracking
                </CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  আপনার ট্র্যাকিং আইডি (যেমন: <code>SIA-REG-2610-1234</code>) অথবা নিবন্ধিত মোবাইল নম্বর
                  দিয়ে বর্তমান স্ট্যাটাস জানুন।
                </CardDescription>

                <form
                  onSubmit={handleTrackSearch}
                  className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto"
                >
                  <Input
                    required
                    value={trackingQuery}
                    onChange={(e) => setTrackingQuery(e.target.value)}
                    placeholder="Enter Registration ID or Phone Number..."
                    className="rounded-xl flex-1 bg-background"
                  />
                  <Button
                    type="submit"
                    disabled={trackingLoading}
                    className="rounded-xl bg-primary text-primary-foreground font-semibold px-6"
                  >
                    {trackingLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </form>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                {trackingLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm">সার্ভার থেকে তথ্য খোঁজা হচ্ছে...</p>
                  </div>
                ) : trackingResults && trackingResults.length > 0 ? (
                  <div className="space-y-4">
                    {trackingResults.map((item) => {
                      const statusMap: Record<
                        string,
                        { label: string; tone: string; desc: string }
                      > = {
                        new: {
                          label: "Application Received (নতুন আবেদন)",
                          tone: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
                          desc: "আপনার ফর্মটি গৃহীত হয়েছে। শীঘ্রই অ্যাডমিশন টিম তথ্য ভেরিফাই করবে।",
                        },
                        reviewing: {
                          label: "Under Review (যাচাইকরণ চলমান)",
                          tone: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
                          desc: "ডকুমেন্টস ও স্লট প্রাপ্যতা যাচাই করা হচ্ছে।",
                        },
                        submitted: {
                          label: "Submitted to Test Center (সেন্টারে প্রেরিত)",
                          tone: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
                          desc: "ব্রিটিশ কাউন্সিল / আইডিপিতে অফিসিয়াল বুকিং জমা দেওয়া হয়েছে।",
                        },
                        registered: {
                          label: "Officially Registered (কনফার্মড)",
                          tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
                          desc: "পরীক্ষার চূড়ান্ত সিট বুকিং নিশ্চিত হয়েছে। ইমেইলে কনফার্মেশন স্লিপ পাঠানো হয়েছে।",
                        },
                        rejected: {
                          label: "Rejected / Cancelled (বাতিল)",
                          tone: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
                          desc: "কোনো ত্রুটি বা সিট সংকটের কারণে আবেদনটি সম্পন্ন হয়নি। অনুগ্রহ করে ব্রাঞ্চে যোগাযোগ করুন।",
                        },
                      };

                      const currentStatus =
                        statusMap[item.status] || statusMap.new;

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Tracking ID
                              </span>
                              <p className="font-mono text-lg sm:text-xl font-extrabold text-primary">
                                {item.regNo}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${currentStatus.tone}`}
                            >
                              {currentStatus.label}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-muted-foreground bg-muted/40 p-3 rounded-xl">
                            {currentStatus.desc}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                            <div>
                              <span className="text-muted-foreground">Candidate:</span>{" "}
                              <strong className="text-foreground">{item.fullName}</strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Exam Type:</span>{" "}
                              <strong className="text-foreground">
                                {item.examType} ({item.testFormat})
                              </strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Exam Centre:</span>{" "}
                              <strong className="text-foreground">{item.preferredCentre}</strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Exam Date:</span>{" "}
                              <strong className="text-foreground">{item.preferredDate}</strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Payment Status:</span>{" "}
                              <span
                                className={`font-semibold uppercase text-xs px-2 py-0.5 rounded ${
                                  item.paymentStatus === "paid"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : item.paymentStatus === "partial"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {item.paymentStatus || "unpaid"}
                              </span>
                            </div>
                            {item.remarks && (
                              <div className="sm:col-span-2">
                                <span className="text-muted-foreground">Staff Remarks:</span>{" "}
                                <span className="text-foreground italic">{item.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : trackingSearched ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <HelpCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-base font-semibold text-foreground">
                      কোনো রেজিস্ট্রেশন রেকর্ড পাওয়া যায়নি
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      অনুগ্রহ করে সঠিক রেজিস্ট্রেশন ট্র্যাকিং নম্বর অথবা মোবাইল নম্বর দিয়ে পুনরায় অনুসন্ধান
                      করুন।
                    </p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <Search className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-sm">
                      উপরের সার্চ বক্সে ট্র্যাকিং নম্বর লিখে <strong>Search</strong> বাটনে ক্লিক করুন।
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>
        )}
      </div>
    </>
  );
}
