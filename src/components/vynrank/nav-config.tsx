import type { VynRankNavKey } from "@/lib/vynrank/acl";

export type NavItem = {
  key: VynRankNavKey;
  label: string;
  href: string;
  icon: string;
  section: "workspace" | "setup" | "ceo";
  badge?: "count" | "alert";
  badgeKey?: "projects" | "ads" | "tasks";
};

/** Figma Sidebar + CEO-only Owner summary */
export const VYNRANK_NAV_ITEMS: NavItem[] = [
  {
    key: "owner_summary",
    label: "CEO Summary",
    href: "/vynrank/owner-summary",
    icon: "/vynrank/icons/nav-reports.svg",
    section: "ceo",
  },
  {
    key: "command_center",
    label: "Command Center",
    href: "/vynrank",
    icon: "/vynrank/icons/nav-command.svg",
    section: "workspace",
  },
  {
    key: "projects",
    label: "Projects",
    href: "/vynrank/projects",
    icon: "/vynrank/icons/nav-projects.svg",
    section: "workspace",
    badge: "count",
    badgeKey: "projects",
  },
  {
    key: "paid_ads",
    label: "Paid Ads",
    href: "/vynrank/paid-ads",
    icon: "/vynrank/icons/nav-ads.svg",
    section: "workspace",
    badge: "alert",
    badgeKey: "ads",
  },
  {
    key: "tasks",
    label: "Tasks & QA",
    href: "/vynrank/tasks",
    icon: "/vynrank/icons/nav-tasks.svg",
    section: "workspace",
    badge: "alert",
    badgeKey: "tasks",
  },
  {
    key: "team",
    label: "Team",
    href: "/vynrank/team",
    icon: "/vynrank/icons/nav-team.svg",
    section: "workspace",
  },
  {
    key: "packages",
    label: "Packages",
    href: "/vynrank/packages",
    icon: "/vynrank/icons/nav-packages.svg",
    section: "setup",
  },
  {
    key: "reports",
    label: "Client Reports",
    href: "/vynrank/reports",
    icon: "/vynrank/icons/nav-reports.svg",
    section: "setup",
  },
  {
    key: "billing",
    label: "Billing",
    href: "/vynrank/billing",
    icon: "/vynrank/icons/nav-billing.svg",
    section: "setup",
  },
  {
    key: "integrations",
    label: "Integrations",
    href: "/vynrank/integrations",
    icon: "/vynrank/icons/nav-integrations.svg",
    section: "setup",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/vynrank/settings",
    icon: "/vynrank/icons/nav-settings.svg",
    section: "setup",
  },
];
