"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Info, Megaphone, Phone, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { AdminSiteSettings } from "@/lib/admin-types";
import { SectionHeading } from "@/components/site/admin/admin-shared";
import { apiGet, apiSend } from "@/components/site/admin/admin-content-hooks";
import { useAdminStore } from "@/lib/admin-store";

const EMPTY: AdminSiteSettings = {
  tagline: "",
  subTagline: "",
  phone: "",
  phone2: "",
  whatsapp: "",
  email: "",
  email2: "",
  address: "",
  addressShort: "",
  facebook: "",
  website: "",
  promoMessage: "",
  promoCtaLabel: "",
  promoCtaHref: "",
  routineNoteTitle: "",
  routineNoteMessage: "",
};

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  textarea,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {textarea ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="rounded-xl border-border bg-muted/40"
        />
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 rounded-xl border-border bg-muted/40"
        />
      )}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Site Settings — brand taglines, contact info, promo bar, routine note. */
export function AdminSettings() {
  const token = useAdminStore((s) => s.token);
  const [settings, setSettings] = useState<AdminSiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) return;
      const res = await apiGet<{ settings: AdminSiteSettings | null }>(
        "/api/admin/settings",
        token
      );
      if (alive) {
        setSettings({ ...EMPTY, ...(res.data?.settings ?? {}) });
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  function set<K extends keyof AdminSiteSettings>(key: K, value: string) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!token || !settings) return;
    setBusy(true);
    const res = await apiSend<{ settings: AdminSiteSettings }>(
      "/api/admin/settings",
      token,
      "PUT",
      { settings }
    );
    setBusy(false);
    if (res.ok) {
      toast.success("সেটিংস সেভ হয়েছে, সাইটে সঙ্গে সঙ্গে দেখা যাবে।");
    } else {
      toast.error(res.error ?? "সেভ করা যায়নি।");
    }
  }

  if (loading || !settings) {
    return (
      <div className="space-y-3">
        <SectionHeading title="Site Settings: সেটিংস" sub="সাইটের যোগাযোগ ও ব্র্যান্ড তথ্য" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Site Settings: সেটিংস"
        sub="হেডার, ফুটার, যোগাযোগ ও প্রোমো বারের তথ্য, এখান থেকেই আপডেট হয়"
      >
        <Button
          type="button"
          onClick={save}
          disabled={busy}
          className="min-h-11 rounded-full bg-ink px-5 text-white hover:bg-ink/90"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {busy ? "সেভ হচ্ছে…" : "Save: সেভ করুন"}
        </Button>
      </SectionHeading>

      <p className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        খালি রাখলে সাইটের ডিফল্ট মান দেখা যাবে। ফোন নম্বর বদলালে হেডার/ফুটার/পেজের কল বাটনও
        অটো আপডেট হবে।
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Brand */}
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="space-y-3 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
              <Settings className="h-4 w-4 text-primary" aria-hidden />
              Brand · ব্র্যান্ড
            </h3>
            <Field
              id="st-tagline"
              label="Tagline"
              value={settings.tagline}
              onChange={(v) => set("tagline", v)}
            />
            <Field
              id="st-sub"
              label="Sub tagline"
              value={settings.subTagline}
              onChange={(v) => set("subTagline", v)}
            />
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="space-y-3 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
              <Phone className="h-4 w-4 text-primary" aria-hidden />
              Contact · যোগাযোগ
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                id="st-phone"
                label="প্রধান ফোন"
                value={settings.phone}
                onChange={(v) => set("phone", v)}
              />
              <Field
                id="st-phone2"
                label="দ্বিতীয় ফোন"
                value={settings.phone2}
                onChange={(v) => set("phone2", v)}
              />
            </div>
            <Field
              id="st-email"
              label="প্রধান ইমেইল"
              value={settings.email}
              onChange={(v) => set("email", v)}
            />
            <Field
              id="st-email2"
              label="দ্বিতীয় ইমেইল"
              value={settings.email2}
              onChange={(v) => set("email2", v)}
            />
            <Field
              id="st-whatsapp"
              label="WhatsApp লিংক"
              hint="সম্পূর্ণ wa.me লিংক দিন, যেমন https://wa.me/8801752716238?text=…"
              value={settings.whatsapp}
              onChange={(v) => set("whatsapp", v)}
            />
            <Field
              id="st-address"
              label="পূর্ণ ঠিকানা"
              value={settings.address}
              onChange={(v) => set("address", v)}
              textarea
            />
            <Field
              id="st-address-short"
              label="সংক্ষিপ্ত ঠিকানা"
              value={settings.addressShort}
              onChange={(v) => set("addressShort", v)}
            />
            <Field
              id="st-facebook"
              label="Facebook পেজ লিংক"
              value={settings.facebook}
              onChange={(v) => set("facebook", v)}
            />
            <Field
              id="st-website"
              label="Website"
              value={settings.website}
              onChange={(v) => set("website", v)}
            />
          </CardContent>
        </Card>

        {/* Promo bar */}
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="space-y-3 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
              <Megaphone className="h-4 w-4 text-primary" aria-hidden />
              Promo Bar · প্রোমো বার
            </h3>
            <Field
              id="st-promo-msg"
              label="মেসেজ"
              value={settings.promoMessage}
              onChange={(v) => set("promoMessage", v)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                id="st-promo-label"
                label="বাটন লেখা"
                value={settings.promoCtaLabel}
                onChange={(v) => set("promoCtaLabel", v)}
              />
              <Field
                id="st-promo-href"
                label="বাটন লিংক"
                value={settings.promoCtaHref}
                onChange={(v) => set("promoCtaHref", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Routine note */}
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="space-y-3 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
              Routine Note · রুটিন নোটিশ
            </h3>
            <Field
              id="st-note-title"
              label="শিরোনাম"
              value={settings.routineNoteTitle}
              onChange={(v) => set("routineNoteTitle", v)}
            />
            <Field
              id="st-note-msg"
              label="বিবরণ"
              value={settings.routineNoteMessage}
              onChange={(v) => set("routineNoteMessage", v)}
              textarea
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={save}
          disabled={busy}
          className="min-h-11 rounded-full bg-ink px-6 text-white hover:bg-ink/90"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {busy ? "সেভ হচ্ছে…" : "Save: সেভ করুন"}
        </Button>
      </div>
    </div>
  );
}
