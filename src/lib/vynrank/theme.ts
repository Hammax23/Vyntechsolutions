/** VynRank SEO Desk design tokens (from Figma) */

export const vynrankTheme = {
  colors: {
    bg: "#f4f6fb",
    surface: "#FFFFFF",
    surfaceMuted: "#F8F9FB",
    border: "#E6E8EC",
    borderStrong: "#D0D5DD",
    text: "#0e1630",
    textSecondary: "#4B5563",
    textMuted: "#8c97b5",
    navy: "#0e1630",
    navySoft: "#1a2440",
    accent: "#4f46e5",
    accentSoft: "#EEF2FF",
    success: "#10B981",
    successSoft: "#ECFDF5",
    warning: "#F59E0B",
    warningSoft: "#FFFBEB",
    danger: "#EF4444",
    dangerSoft: "#FEF2F2",
    purple: "#8B5CF6",
    purpleSoft: "#F5F3FF",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
  },
  shadow: {
    card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
    elevated: "0 8px 24px rgba(15, 23, 42, 0.08)",
  },
  sidebarWidth: 248,
  topbarHeight: 64,
} as const;

export type HealthTone = "healthy" | "attention" | "at_risk";

export function healthColors(health: HealthTone) {
  if (health === "healthy") {
    return { bg: vynrankTheme.colors.successSoft, fg: vynrankTheme.colors.success, label: "Healthy" };
  }
  if (health === "attention") {
    return { bg: vynrankTheme.colors.warningSoft, fg: vynrankTheme.colors.warning, label: "Needs attention" };
  }
  return { bg: vynrankTheme.colors.dangerSoft, fg: vynrankTheme.colors.danger, label: "At risk" };
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    onboarding: "Onboarding",
    active: "Active",
    at_risk: "At risk",
    paused: "Paused",
    completed: "Completed",
    todo: "To do",
    in_progress: "In progress",
    submitted: "Submitted",
    qa: "QA",
    done: "Done",
  };
  return map[status] || status;
}
