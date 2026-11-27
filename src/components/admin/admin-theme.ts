"use client";

import { useEffect } from "react";

const KEY = "vyntech-admin-theme";

/** Admin panel is light-only — clears any legacy dark preference. */
export function useAdminTheme() {
  useEffect(() => {
    try {
      localStorage.setItem(KEY, "light");
    } catch {
      /* ignore */
    }
  }, []);
}
