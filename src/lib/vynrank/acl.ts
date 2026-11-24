import type { VynRankRole } from "@/lib/vynrank/session";

export type VynRankNavKey =
  | "command_center"
  | "projects"
  | "paid_ads"
  | "tasks"
  | "team"
  | "packages"
  | "reports"
  | "billing"
  | "integrations"
  | "settings"
  | "my_day"
  | "owner_summary"
  | "workload"
  | "ai_visibility";

const CEO_NAV: VynRankNavKey[] = [
  "command_center",
  "projects",
  "paid_ads",
  "tasks",
  "team",
  "packages",
  "reports",
  "billing",
  "integrations",
  "settings",
  "my_day",
  "owner_summary",
  "workload",
  "ai_visibility",
];

const SEO_TEAM_NAV: VynRankNavKey[] = [
  "command_center",
  "projects",
  "paid_ads",
  "tasks",
  "team",
  "packages",
  "reports",
  "my_day",
  "workload",
  "ai_visibility",
  // no billing / integrations / settings / owner_summary
];

/** Client portal subset — no internal ops */
const CLIENT_NAV: VynRankNavKey[] = ["projects", "reports", "paid_ads"];

export function navKeysForRole(role: VynRankRole): VynRankNavKey[] {
  if (role === "ceo") return [...CEO_NAV];
  if (role === "seo_team") return [...SEO_TEAM_NAV];
  return [...CLIENT_NAV];
}

export function canAccessNav(role: VynRankRole, key: VynRankNavKey): boolean {
  return navKeysForRole(role).includes(key);
}

/** Map pathname (under /vynrank) to nav key for ACL */
export function navKeyFromPath(pathname: string): VynRankNavKey | null {
  const p = pathname.replace(/\/+$/, "") || "/vynrank";
  if (p === "/vynrank" || p === "/vynrank/") return "command_center";
  if (p.startsWith("/vynrank/projects")) return "projects";
  if (p.startsWith("/vynrank/paid-ads")) return "paid_ads";
  if (p.startsWith("/vynrank/tasks")) return "tasks";
  if (p.startsWith("/vynrank/team")) return "team";
  if (p.startsWith("/vynrank/packages")) return "packages";
  if (p.startsWith("/vynrank/reports")) return "reports";
  if (p.startsWith("/vynrank/billing")) return "billing";
  if (p.startsWith("/vynrank/integrations")) return "integrations";
  if (p.startsWith("/vynrank/settings")) return "settings";
  if (p.startsWith("/vynrank/my-day")) return "my_day";
  if (p.startsWith("/vynrank/owner-summary")) return "owner_summary";
  if (p.startsWith("/vynrank/workload")) return "workload";
  if (p.startsWith("/vynrank/ai-visibility")) return "ai_visibility";
  return null;
}

export function canAccessVynRankPath(role: VynRankRole, pathname: string): boolean {
  if (pathname.startsWith("/vynrank/login")) return true;
  const key = navKeyFromPath(pathname);
  if (!key) {
    // Unknown nested path — CEO only by default
    return role === "ceo";
  }
  // Clients use projects as portal home; block command center
  if (role === "client" && key === "command_center") return false;
  return canAccessNav(role, key);
}

export function defaultPathForRole(role: VynRankRole): string {
  if (role === "client") return "/vynrank/projects";
  if (role === "ceo") return "/vynrank/owner-summary";
  return "/vynrank";
}

export function roleLabel(role: VynRankRole): string {
  if (role === "ceo") return "CEO";
  if (role === "seo_team") return "SEO Team";
  return "Client";
}
