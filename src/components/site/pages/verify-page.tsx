"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  Check,
  Copy,
  GraduationCap,
  Loader2,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { certificateSeeds } from "@/lib/site-data";

/**
 * Public "Verify Certificate" page (10MS /certificate pattern).
 * Anyone — student, guardian, employer — can confirm a certificate was
 * genuinely issued by Sadia's IELTS by entering its ID.
 */

type VerifiedCert = {
  id: string;
  name: string;
  course: string;
  batch: string;
  band: string;
  issued: string;
};

type VerifyResponse =
  | { ok: true; cert: VerifiedCert }
  | { ok: false; error: string };

const EMPTY_INPUT_ERROR =
  "অনুগ্রহ করে সার্টিফিকেট ID লিখুন, যেমন SIE-CERT-2417। (Please enter a certificate ID.)";
const NETWORK_ERROR =
  "নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন। (Network error, please try again.)";

export function VerifyPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedCert | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  // Clear the "Copied" timer if the page unmounts mid-feedback.
  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  async function runVerify(rawId: string) {
    const trimmed = rawId.trim();
    if (!trimmed) {
      setResult(null);
      setError(EMPTY_INPUT_ERROR);
      return;
    }

    setId(trimmed);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(
        `/api/certificates/verify?id=${encodeURIComponent(trimmed)}`
      );
      const data = (await res.json().catch(() => null)) as VerifyResponse | null;

      if (res.ok && data && data.ok === true) {
        setResult(data.cert);
      } else {
        setError(data && data.ok === false ? data.error : NETWORK_ERROR);
      }
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runVerify(id);
  }

  function handleCopy() {
    if (!result) return;
    const markCopied = () => {
      setCopied(true);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(result.id).then(markCopied).catch(() => {});
    }
  }

  // Rendered only after a client-side fetch — hydration-safe.
  const verifiedOn = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <PageHeader
        title={
          <>
            Verify a <span className="text-brand-gradient">Certificate</span>
          </>
        }
        subtitle="সাদিয়া'স আইইএলটিস ইস্যুকৃত সার্টিফিকেট যাচাই করুন। যেকোনো নিয়োগকর্তা বা প্রতিষ্ঠান এখান থেকে নিশ্চিত হতে পারবেন।"
        crumbs={[{ label: "Verify" }]}
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 lg:px-8">
          {/* Search form */}
          <Reveal y={12}>
            <Card className="border-border bg-card">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} noValidate>
                  <Label
                    htmlFor="certificate-id"
                    className="text-sm font-medium text-foreground"
                  >
                    Certificate ID
                  </Label>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <Input
                      id="certificate-id"
                      name="certificate-id"
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="SIE-CERT-2417"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      disabled={loading}
                      aria-describedby="certificate-id-hint"
                      className="h-11 flex-1 bg-muted font-mono uppercase tracking-wider placeholder:tracking-normal placeholder:text-muted-foreground/60"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 rounded-full bg-ink px-6 font-semibold text-white shadow-[0_8px_30px_rgba(30,27,20,0.18)] hover:opacity-85"
                    >
                      {loading ? (
                        <>
                          <Loader2
                            className="mr-2 h-4 w-4 animate-spin"
                            aria-hidden
                          />
                          Verifying…
                        </>
                      ) : (
                        <>
                          <SearchCheck className="mr-2 h-4 w-4" aria-hidden />
                          Verify Certificate
                        </>
                      )}
                    </Button>
                  </div>
                  <p
                    id="certificate-id-hint"
                    className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                    সার্টিফিকেটের গায়ে থাকা ID হুবহু লিখুন, স্পেস বা ড্যাশ হলেও সমস্যা নেই।
                  </p>
                </form>
              </CardContent>
            </Card>
          </Reveal>

          {/* Result / error — announced politely to screen readers */}
          <div aria-live="polite">
            {error ? (
              <Alert variant="destructive" className="mt-8 border-destructive/40">
                <AlertCircle className="h-4 w-4" aria-hidden />
                <AlertTitle>যাচাই ব্যর্থ হয়েছে / Verification failed</AlertTitle>
                <AlertDescription>
                  <p>{error}</p>
                  <p className="font-mono text-xs">
                    ID গুলো এই ফরম্যাটে: SIE-CERT-2417
                  </p>
                </AlertDescription>
              </Alert>
            ) : null}

            {result ? (
              <div className="mt-10">
                {/* Double-border certificate frame */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-[#c8a04a] bg-gradient-to-b from-[#121009] via-[#121009] to-[#0f0d08] p-2 shadow-[0_20px_60px_rgba(169,127,42,0.14)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-radial-glow blur-2xl"
                  />
                  <div className="relative rounded-xl border border-[#c8a04a] px-6 py-10 text-center md:px-10">
                    <div className="flex justify-center">
                      <Image
                        src="/sadia-logo.png"
                        alt="Sadia's IELTS logo"
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-full ring-1 ring-white/20"
                      />
                    </div>
                    <p className="mt-3 font-display text-lg font-bold tracking-wide">
                      <span className="text-[#d9b75c]">
                        Sadia&apos;s IELTS
                      </span>
                    </p>
                    <p className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d9b75c]">
                      <Award className="h-3.5 w-3.5" aria-hidden />
                      Certificate of Achievement
                    </p>
                    <p className="mt-2 font-mono text-[11px] tracking-wider text-[#c6b995]">
                      ID: {result.id}
                    </p>

                    <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-[#f6ecd4]">
                      {result.name}
                    </h2>
                    <p className="mt-2 text-sm italic text-[#c6b995]">
                      has successfully completed
                    </p>
                    <p className="mt-3 font-semibold text-[#f6ecd4]">
                      {result.course}
                    </p>
                    <p className="mt-1 text-sm text-[#c6b995]">
                      {result.batch}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                      <Badge className="border-transparent bg-brand-gradient px-3 py-1 text-xs font-bold text-white">
                        Overall Band {result.band}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-[#e4d5ae]"
                      >
                        Issued {result.issued}
                      </Badge>
                    </div>

                    {/* Verified strip */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-4 text-[#d9b75c] sm:flex-row sm:gap-4">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <BadgeCheck className="h-5 w-5 shrink-0" aria-hidden />
                        ✓ Verified, এই সার্টিফিকেটটি আমাদের রেকর্ডে সঠিক পাওয়া
                        গেছে
                      </p>
                      <p className="text-xs text-[#c6b995]">
                        Verified on {verifiedOn}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="border-white/20 bg-transparent text-[#f6ecd4] hover:bg-white/10 hover:text-white"
                      >
                        {copied ? (
                          <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                        )}
                        {copied ? "Copied" : "Copy ID"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Demo IDs — lets anyone try the widget instantly */}
          <Reveal delay={0.08}>
            <div className="mt-10 text-center">
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 text-primary" aria-hidden />
                Try a demo ID
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {certificateSeeds.map((seed) => (
                  <button
                    key={seed.id}
                    type="button"
                    title={`${seed.name}, Band ${seed.band}`}
                    onClick={() => void runVerify(seed.id)}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {seed.id}
                  </button>
                ))}
              </div>
              <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                প্রতিটি সার্টিফিকেট সরাসরি আমাদের অফিসিয়াল রেকর্ড থেকে যাচাই হয়,
                এডিট বা নকল করা সম্ভব নয়।
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
