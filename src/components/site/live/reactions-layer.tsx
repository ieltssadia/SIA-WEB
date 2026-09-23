"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Floating-emoji reactions layer for the stage. The hook owns the rising-
 * emoji state: it is fed by `room.lastReaction` (whose `id` changes on every
 * incoming reaction) and exposes `pop()` for optimistic local sends. A short
 * same-emoji dedupe window keeps the sender from seeing their own reaction
 * twice (the socket broadcast echoes back to the sender).
 */

export type FloatingReaction = { id: string; emoji: string; x: number };

const LIFETIME_MS = 2700;
const MAX_FLOATING = 24;
const ECHO_DEDUPE_MS = 1200;

export function useFloatingReactions(incoming: { id: string; emoji: string; by: string } | null) {
  const [items, setItems] = useState<FloatingReaction[]>([]);
  const seenIdRef = useRef<string | null>(null);
  const sentRef = useRef<{ emoji: string; at: number } | null>(null);

  const pop = useCallback((emoji: string) => {
    const id = Math.random().toString(36).slice(2);
    const x = 8 + Math.random() * 74; // 8–82% across the stage
    setItems((prev) => [...prev.slice(-(MAX_FLOATING - 1)), { id, emoji, x }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((r) => r.id !== id));
    }, LIFETIME_MS);
  }, []);

  useEffect(() => {
    if (!incoming?.id || seenIdRef.current === incoming.id) return;
    seenIdRef.current = incoming.id;
    const sent = sentRef.current;
    const isMyEcho = !!sent && sent.emoji === incoming.emoji && Date.now() - sent.at < ECHO_DEDUPE_MS;
    if (isMyEcho) return;
    // Defer the state update off the effect body (subscription-style) so a
    // burst of incoming reactions never cascades renders synchronously.
    const t = window.setTimeout(() => pop(incoming.emoji), 0);
    return () => window.clearTimeout(t);
  }, [incoming, pop]);

  /** Optimistic local pop — also arms the echo dedupe for the sender. */
  const popLocal = useCallback(
    (emoji: string) => {
      sentRef.current = { emoji, at: Date.now() };
      pop(emoji);
    },
    [pop]
  );

  return { items, popLocal };
}

/** Pure render layer — pointer-events-none so the stage stays interactive. */
export function ReactionsLayer({ items }: { items: FloatingReaction[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {items.map((r) => (
        <span key={r.id} className="live-reaction absolute bottom-2 text-3xl drop-shadow-lg" style={{ left: `${r.x}%` }}>
          {r.emoji}
        </span>
      ))}
    </div>
  );
}
