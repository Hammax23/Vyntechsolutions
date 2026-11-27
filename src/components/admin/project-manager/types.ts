import type { ProjectPhase } from "@/lib/admin/project-workflow";

export type StaffOption = {
  id: string;
  name: string;
  email: string;
  color: string;
  isActive: boolean;
};

export type LinkedWorkflowTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  workDate: string;
  assignedTo?: { id: string; name: string; color: string } | null;
  project?: { id: string; name: string } | null;
};

export type ClientUpdateHistoryItem = {
  id: string;
  sentTo: string;
  subject: string;
  messageNote: string | null;
  kind: string;
  status: string;
  errorMessage: string | null;
  bccTo?: string | null;
  sentBy?: string | null;
  createdAt: string;
};

export type ClientUpdateViewRecord = {
  id: string;
  sentTo: string;
  subject: string;
  messageNote: string | null;
  kind: string;
  status: string;
  errorMessage: string | null;
  bccTo: string | null;
  sentBy: string | null;
  createdAt: string;
  html: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  assignee: string;
  createdAt: string;
};

export type Milestone = { id: string; title: string; dueDate: string; completed: boolean };
export type ActivityLog = { id: string; action: string; timestamp: string; user: string };
export type Note = { id: string; content: string; createdAt: string; author: string };

export type PhaseCheck = {
  id: string;
  phase: string;
  label: string;
  done: boolean;
  sortOrder: number;
};

export type PaymentBillingInvoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  paidAt: string | null;
  dueDate: string | null;
};

export type Payment = {
  id: string;
  label: string;
  percent: number;
  amount: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  sortOrder: number;
  billingInvoice?: PaymentBillingInvoice | null;
};

export type AdminProject = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string;
  companyLogo?: string | null;
  projectName: string;
  description: string;
  services: string[];
  status: ProjectPhase;
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  deadline: string;
  tasks: Task[];
  milestones: Milestone[];
  activityLog: ActivityLog[];
  notes: Note[];
  teamMembers: string[];
  phaseGates?: unknown;
  phaseChecks?: PhaseCheck[];
  payments?: Payment[];
  createdAt: string;
};

export type ProjectTab =
  | "workflow"
  | "team"
  | "overview"
  | "updates"
  | "tasks"
  | "timeline"
  | "notes"
  | "activity";

export type ListViewMode = "list" | "pipeline";

export const WORKFLOW_PROJECT_STORAGE_KEY = "vyntech-open-workflow-project";

export function paymentInvoiceOverdue(
  inv: Pick<PaymentBillingInvoice, "status" | "dueDate"> | null | undefined
): boolean {
  if (!inv || inv.status === "paid") return false;
  if (!inv.dueDate) return false;
  const t = new Date(inv.dueDate).getTime();
  return Number.isFinite(t) && t < Date.now();
}
