"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminStore } from "@/lib/admin-store";

/**
 * Shared plumbing for the editable-content admin sections (tips, faqs,
 * site-team, routine, gallery, suggestions, media, settings) — one generic
 * /api/admin/content/<entity> contract, one loader hook, thin JSON helpers.
 */

type ApiResult<T> = { ok: boolean; data?: T; error?: string };

async function parse<T>(res: Response): Promise<ApiResult<T>> {
  const body = (await res.json().catch(() => null)) as
    | (Record<string, unknown> & { ok?: boolean; error?: string })
    | null;
  if (res.ok && body?.ok) return { ok: true, data: body as unknown as T };
  return { ok: false, error: body?.error ?? "কাজটি হয়নি, আবার চেষ্টা করুন।" };
}

/** GET an admin JSON endpoint with the session token. */
export async function apiGet<T>(url: string, token: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { headers: { "x-admin-key": token } });
    return await parse<T>(res);
  } catch {
    return { ok: false, error: "নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।" };
  }
}

/** POST / PATCH / DELETE an admin JSON endpoint with the session token. */
export async function apiSend<T>(
  url: string,
  token: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": token,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return await parse<T>(res);
  } catch {
    return { ok: false, error: "নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন।" };
  }
}

export type ContentEntityKey =
  | "tips"
  | "faqs"
  | "site-team"
  | "routine"
  | "gallery"
  | "suggestions";

/** Load + reload one content collection (GET /api/admin/content/<entity>). */
export function useContentRows<T>(entity: ContentEntityKey) {
  const token = useAdminStore((s) => s.token);
  const [rows, setRows] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const res = await apiGet<{ rows: T[] }>(`/api/admin/content/${entity}`, token);
    if (res.ok && res.data?.rows) {
      setRows(res.data.rows);
    } else {
      setError(res.error ?? "লোড করা যায়নি।");
    }
    setLoading(false);
  }, [token, entity]);

  useEffect(() => {
    // Defer the first fetch to a timer so no setState happens synchronously
    // inside the effect body (react-hooks/set-state-in-effect).
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  return { token, rows, setRows, loading, error, reload: load };
}

/** Split a comma-separated input into a clean string[]. */
export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Parse "value | label" lines into stats pairs. */
export function parseStats(
  value: string
): { value: string; label: string }[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.indexOf("|");
      if (sep === -1) return { value: line, label: "" };
      return {
        value: line.slice(0, sep).trim(),
        label: line.slice(sep + 1).trim(),
      };
    })
    .filter((s) => s.value && s.label);
}

/** Serialize stats pairs back to the "value | label" textarea lines. */
export function statsToLines(stats: { value: string; label: string }[]): string {
  return stats.map((s) => `${s.value} | ${s.label}`).join("\n");
}
