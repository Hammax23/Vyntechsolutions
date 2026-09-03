"use client";

import { useEffect, useState } from "react";

export type AdminTheme = "dark" | "light";

const KEY = "vyntech-admin-theme";

export function useAdminTheme() {
  const [theme, setTheme] = useState<AdminTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
    setReady(true);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(KEY, next);
      return next;
    });
  };

  return { theme, toggle, ready, isDark: theme === "dark" };
}
