"use client";

import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Facebook,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/site/reveal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { enrollCourseOptions, site } from "@/lib/site-data";
import { useEnrollStore } from "@/lib/enroll-store";

type Status = "idle" | "submitting" | "success" | "error";

export function EnrollSection() {
  const course = useEnrollStore((s) => s.course);
  const setCourse = useEnrollStore((s) => s.setCourse);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and phone number.",
        variant: "destructive",
      });
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, course, message }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Request failed");
      }
      setStatus("success");
      toast({
        title: "🎉 Enrollment request received!",
        description:
          "ধন্যবাদ! Our team will call you within 24 hours with batch details.",
      });
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setCourse("not-sure");
    } catch {
      setStatus("error");
      toast({
        title: "Something went wrong",
        description:
          "Could not submit right now — please call us directly at " + site.phone,
        variant: "destructive",
      });
    } finally {
      setStatus((s) => (s === "submitting" ? "idle" : s));
    }
  }

  const contactCards = [
    { icon: Phone, label: "Call us", value: site.phone, href: site.phoneHref },
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    {
      icon: Facebook,
      label: "Facebook",
      value: "facebook.com/Sadiasielts",
      href: site.facebook,
    },
    { icon: MapPin, label: "Campus", value: site.address, href: undefined },
  ];

  return (
    <section
      id="enroll"
      className="relative scroll-mt-24 overflow-hidden border-y border-primary/10 bg-[#0d0d10] py-16 md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-[380px] w-[380px] rounded-full bg-radial-glow blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-radial-glow blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Info side */}
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <span className="h-px w-8 bg-primary/60" aria-hidden />
              Start your journey to success
            </span>
            <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
              Enroll Today — <span className="text-gold-gradient">Seats Fill Fast!</span>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
              New students join every week — কোর্সটি শুরু করতে হবে কবে? ফর্মটি পূরণ করুন,
              আমাদের টিম ২৪ ঘণ্টার মধ্যে কল করে ব্যাচের সময়সূচি ও ভর্তি প্রক্রিয়া জানিয়ে দেবে।
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-foreground/85">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
                Free level assessment before you join
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
                bKash / Nagad / Bank — pay however you like
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
                অনলাইন ও অফলাইন — দুই ধরনের ব্যাচই আছে
              </li>
            </ul>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {contactCards.map(({ icon: Icon, label, value, href }) => {
                const inner = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
                      <Icon className="h-4.5 w-4.5 text-primary" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </span>
                      <span className="block truncate text-sm font-medium text-foreground">
                        {value}
                      </span>
                    </span>
                  </>
                );
                return href ? (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form side */}
          <Reveal delay={0.1}>
            <Card className="border-primary/20 bg-card shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <CardContent className="p-6 md:p-8">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Enrollment Form
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill in your details — we&apos;ll get back to you within 24 hours.
                </p>

                {status === "success" ? (
                  <div className="mt-8 flex flex-col items-center rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400" aria-hidden />
                    <p className="mt-4 font-display text-lg font-bold text-foreground">
                      Request received!
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ধন্যবাদ {""}
                      <span className="font-bengali">— আমরা খুব শীঘ্রই আপনার সাথে যোগাযোগ করব।</span>
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 border-primary/30 hover:text-primary"
                      onClick={() => setStatus("idle")}
                    >
                      Submit another request
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g. Rahim Ahmed"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          maxLength={100}
                          autoComplete="name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="01XXX-XXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          maxLength={20}
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={120}
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course">Interested Course</Label>
                      <Select value={course} onValueChange={setCourse}>
                        <SelectTrigger id="course" className="w-full">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {enrollCourseOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message (optional)</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Any question for us? e.g. ব্যাচের সময় কবে?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        maxLength={1000}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full bg-gold-gradient py-6 text-base font-semibold text-[#16120a] shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:opacity-90 disabled:opacity-60"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4.5 w-4.5" aria-hidden />
                          Submit Enrollment Request
                        </>
                      )}
                    </Button>

                    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                      Your information stays private — used only to contact you.
                      <Timer className="ml-1 hidden" aria-hidden />
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
