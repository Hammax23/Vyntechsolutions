import type { AdminRole } from "@/lib/admin-session";

export type AdminSection =
  | "quotes"
  | "projects"
  | "workflow"
  | "careers"
  | "offer_letters"
  | "invoices"
  | "client_invoices"
  | "virtual_assistants";

const OWNER_SECTIONS: AdminSection[] = [
  "workflow",
  "quotes",
  "projects",
  "careers",
  "offer_letters",
  "client_invoices",
  "invoices",
  "virtual_assistants",
];

const VA_SECTIONS: AdminSection[] = ["quotes", "projects", "client_invoices"];

export function sectionsForRole(role: AdminRole): AdminSection[] {
  return role === "owner" ? [...OWNER_SECTIONS] : [...VA_SECTIONS];
}

export function defaultSectionForRole(role: AdminRole): AdminSection {
  return role === "owner" ? "workflow" : "quotes";
}

export function canAccessSection(role: AdminRole, section: string): boolean {
  return sectionsForRole(role).includes(section as AdminSection);
}

/**
 * Edge-safe path ACL for /api/admin/*
 * Public auth login/verify are handled by the caller before this runs.
 */
export function canAccessAdminApi(
  role: AdminRole,
  method: string,
  pathname: string
): boolean {
  if (role === "owner") return true;

  const path = pathname.replace(/\/+$/, "") || pathname;
  const m = method.toUpperCase();

  // Auth helpers for logged-in users
  if (path === "/api/admin/auth") {
    // login/verify are public; me/logout use POST/GET with body step — allow authenticated
    return true;
  }
  if (path === "/api/admin/presence") return m === "POST" || m === "GET";

  // Quote Requests
  if (path === "/api/admin/submissions" || path.startsWith("/api/admin/submissions/")) {
    return true;
  }

  // Project Manager + nested
  if (path === "/api/admin/projects" || path.startsWith("/api/admin/projects/")) {
    return true;
  }

  // Client invoices — VA can manage create/send; Owner-only for offline record-payment
  if (
    path === "/api/admin/billing-invoices" ||
    path.startsWith("/api/admin/billing-invoices/")
  ) {
    if (path === "/api/admin/billing-invoices/record-payment") {
      return false; // Owner only (middleware allows owner before this; VA denied)
    }
    return true;
  }

  // Staff list for PM team picker — read only
  if (path === "/api/admin/staff" || path.startsWith("/api/admin/staff/")) {
    return m === "GET";
  }

  // PM creates/updates workflow tasks from Project Manager
  if (path === "/api/admin/workflow/tasks" || path.startsWith("/api/admin/workflow/tasks/")) {
    return m === "GET" || m === "POST" || m === "PATCH" || m === "DELETE";
  }

  return false;
}
