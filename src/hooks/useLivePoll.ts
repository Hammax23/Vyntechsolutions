"use client";

import { useEffect, useRef } from "react";

type Options = {
  /** Poll while tab is visible. Default 3500ms. */
  intervalMs?: number;
  enabled?: boolean;
};

/**
 * Runs `tick` on an interval while the document is visible,
 * plus immediately on focus / visibility regain.
 */
export function useLivePoll(tick: () => void | Promise<void>, options: Options = {}) {
  const { intervalMs = 3500, enabled = true } = options;
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: number | undefined;
    let inFlight = false;

    const run = async () => {
      if (cancelled || inFlight) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        await tickRef.current();
      } finally {
        inFlight = false;
      }
    };

    const schedule = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => {
        void run();
      }, intervalMs);
    };

    void run();
    schedule();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void run();
        schedule();
      } else {
        window.clearInterval(timer);
      }
    };

    const onFocus = () => {
      void run();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, intervalMs]);
}
