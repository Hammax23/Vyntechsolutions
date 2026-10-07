"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  GATED_PHASES,
  PIPELINE_PHASES,
  PROJECT_PHASES,
  hasPhaseGate,
  normalizeProjectStatus,
  parsePhaseGates,
  phaseAbbrev,
  phaseCheckProgress,
  phaseLabel,
  type ProjectPhase,
} from "@/lib/admin/project-workflow";
import {
  buildClientUpdateHtml,
  buildClientUpdateSubject,
  type ClientUpdateSnapshot,
} from "@/lib/admin/project-client-update-email";
import { todayKey } from "@/lib/workflow-progress";

type StaffOption = {
  id: string;
  name: string;
  email: string;
  color: string;
  isActive: boolean;
};

type LinkedWorkflowTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  workDate: string;
  assignedTo?: { id: string; name: string; color: string } | null;
  project?: { id: string; name: string } | null;
};

type ClientUpdateHistoryItem = {
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

type ClientUpdateViewRecord = {
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

const CLIENT_UPDATE_NOTE_CHIPS = [
  "We are on track with the current phase.",
  "Waiting on your feedback to proceed.",
  "Ready for your review.",
];

const WF_STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "On hold",
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const fadeOnly = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  assignee: string;
  createdAt: string;
};

type Milestone = { id: string; title: string; dueDate: string; completed: boolean };
type ActivityLog = { id: string; action: string; timestamp: string; user: string };
type Note = { id: string; content: string; createdAt: string; author: string };
type PhaseCheck = {
  id: string;
  phase: string;
  label: string;
  done: boolean;
  sortOrder: number;
};
type Payment = {
  id: string;
  label: string;
  percent: number;
  amount: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  sortOrder: number;
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

function ProjectLogoMark({
  name,
  logo,
  size = "md",
}: {
  name: string;
  logo?: string | null;
  size?: "sm" | "md";
}) {
  const box =
    size === "sm"
      ? "h-7 w-7 text-[11px]"
      : "w-9 h-9 text-sm";
  if (logo) {
    return (
      <span
        className={`${box} shrink-0 rounded border border-white/15 bg-white overflow-hidden flex items-center justify-center`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" className="h-full w-full object-contain p-0.5" />
      </span>
    );
  }
  return (
    <span
      className={`${box} shrink-0 rounded border border-white/15 bg-white/[0.04] flex items-center justify-center font-semibold text-white/90`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

type Props = {
  refreshKey?: number;
  onLoaded?: (count: number) => void;
  /** Jump to Client Invoices and open this billing invoice */
  onOpenClientInvoice?: (invoiceId: string) => void;
};

function formatProject(p: Record<string, unknown>): AdminProject {
  return {
    ...(p as AdminProject),
    status: normalizeProjectStatus(String(p.status || "discovery")),
    startDate: p.startDate ? new Date(String(p.startDate)).toISOString().split("T")[0] : "",
    deadline: p.deadline ? new Date(String(p.deadline)).toISOString().split("T")[0] : "",
    tasks: (p.tasks as Task[]) || [],
    milestones: (p.milestones as Milestone[]) || [],
    notes: (p.notes as Note[]) || [],
    activityLog: ((p.activityLogs || p.activityLog) as ActivityLog[]) || [],
    phaseChecks: (p.phaseChecks as PhaseCheck[]) || [],
    payments: (p.payments as Payment[]) || [],
    phaseGates: p.phaseGates,
  };
}

function phaseChipClass(status: string) {
  const key = normalizeProjectStatus(status);
  if (key === "completed") return "pm-status-chip pm-status-chip--paid";
  if (key === "on_hold") return "pm-status-chip pm-status-chip--due";
  return "pm-status-chip pm-status-chip--pending";
}

function priorityStyle(priority: string) {
  const map: Record<string, string> = {
    low: "bg-transparent text-white/50 border-white/15",
    medium: "bg-transparent text-white/70 border-white/20",
    high: "bg-transparent text-slate-200 border-slate-400/40",
    critical: "bg-transparent text-white border-white/35",
  };
  return map[priority] || map.medium;
}

function taskStatusStyle(status: string) {
  if (status === "completed") return "bg-emerald-500/20 text-emerald-300";
  if (status === "in_progress") return "bg-amber-500/20 text-amber-300";
  return "bg-white/10 text-white/50";
}

export default function ProjectManagerSection({
  refreshKey = 0,
  onLoaded,
  onOpenClientInvoice,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<"list" | "detail">("list");
  const [projectTab, setProjectTab] = useState<
    | "workflow"
    | "team"
    | "overview"
    | "tasks"
    | "timeline"
    | "notes"
    | "activity"
    | "updates"
  >("workflow");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [signOffNote, setSignOffNote] = useState("");
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [teamDraftIds, setTeamDraftIds] = useState<string[]>([]);
  const [linkedWfTasks, setLinkedWfTasks] = useState<LinkedWorkflowTask[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [assigningWork, setAssigningWork] = useState(false);
  const [assignWork, setAssignWork] = useState({
    assignedToId: "",
    workDate: todayKey(),
    title: "",
    description: "",
    priority: "medium",
    workLink: "",
  });

  const [showClientUpdate, setShowClientUpdate] = useState(false);
  const [cuTo, setCuTo] = useState("");
  const [cuSubject, setCuSubject] = useState("");
  const [cuDraft, setCuDraft] = useState<ClientUpdateSnapshot | null>(null);
  const [cuSubjectTouched, setCuSubjectTouched] = useState(false);
  const [cuTestTo, setCuTestTo] = useState("");
  const [cuPreflight, setCuPreflight] = useState<{ ok: boolean; issues: string[] }>({
    ok: true,
    issues: [],
  });
  const [cuHistory, setCuHistory] = useState<ClientUpdateHistoryItem[]>([]);
  const [cuHistoryTotal, setCuHistoryTotal] = useState(0);
  const [cuLoadingPreview, setCuLoadingPreview] = useState(false);
  const [cuSending, setCuSending] = useState(false);
  const [cuConfirmClient, setCuConfirmClient] = useState(false);
  const [showCuView, setShowCuView] = useState(false);
  const [cuViewLoading, setCuViewLoading] = useState(false);
  const [cuViewRecord, setCuViewRecord] = useState<ClientUpdateViewRecord | null>(null);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentInvoices, setPaymentInvoices] = useState<
    Record<string, { id: string; invoiceNumber: string; status: string; checkoutUrl?: string }>
  >({});

  const motionDuration = reduceMotion ? 0 : 0.28;
  const stagger = reduceMotion ? 0 : 0.045;

  const selectProject = useCallback((id: string) => {
    setSelectedId(id);
    setProjectTab("workflow");
    setMobilePane("detail");
  }, []);
  const [paymentForm, setPaymentForm] = useState({
    label: "",
    percent: "",
    amount: "",
  });
  const emptyNewProject = {
    projectName: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    companyName: "",
    services: "",
    description: "",
    budget: "",
    startDate: "",
    deadline: "",
    priority: "medium" as AdminProject["priority"],
  };
  const [newProject, setNewProject] = useState(emptyNewProject);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [editForm, setEditForm] = useState({
    projectName: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    companyName: "",
    services: "",
    description: "",
    budget: "",
    spent: "",
    startDate: "",
    deadline: "",
    priority: "medium" as AdminProject["priority"],
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    dueDate: "",
    assignee: "",
  });
  const [newNote, setNewNote] = useState("");
  const [newMilestone, setNewMilestone] = useState({ title: "", dueDate: "" });

  const clearLogoPick = useCallback(() => {
    setLogoFile(null);
    setLogoPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const pickLogoFile = useCallback((file: File | null) => {
    setLogoPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setLogoFile(file);
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedId) || null,
    [projects, selectedId]
  );

  const applyProject = useCallback((project: AdminProject) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === project.id ? project : p));
      if (!next.some((p) => p.id === project.id)) return [project, ...next];
      return next;
    });
  }, []);

  const loadProjects = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const response = await fetch("/api/admin/projects", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const formatted = (data.projects || []).map((p: Record<string, unknown>) => formatProject(p));
        setProjects(formatted);
        onLoaded?.(formatted.length);
        setSelectedId((prev) => {
          if (prev && formatted.some((p: AdminProject) => p.id === prev)) return prev;
          return formatted[0]?.id || null;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [onLoaded]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects, refreshKey]);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(""), 4000);
    return () => window.clearTimeout(t);
  }, [message]);

  const patchProject = async (body: Record<string, unknown>, opts?: { force?: boolean }) => {
    if (!selectedProject) return false;
    const res = await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedProject.id, ...body, force: opts?.force }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (data.requiresForce && data.error) {
        const ok = window.confirm(`${data.error}\n\nForce advance anyway?`);
        if (ok) return patchProject(body, { force: true });
      }
      setMessage(data.error || "Update failed");
      return false;
    }
    if (data.project) applyProject(formatProject(data.project));
    return true;
  };

  const updateStatus = (status: ProjectPhase) => void patchProject({ status });
  const updatePriority = (priority: AdminProject["priority"]) => void patchProject({ priority });

  const startEditDetails = () => {
    if (!selectedProject) return;
    setEditForm({
      projectName: selectedProject.projectName || "",
      clientName: selectedProject.clientName || "",
      clientEmail: selectedProject.clientEmail || "",
      clientPhone: selectedProject.clientPhone || "",
      companyName: selectedProject.companyName || "",
      services: (selectedProject.services || []).join(", "),
      description: selectedProject.description || "",
      budget: String(selectedProject.budget ?? ""),
      spent: String(selectedProject.spent ?? ""),
      startDate: selectedProject.startDate || "",
      deadline: selectedProject.deadline || "",
      priority: selectedProject.priority || "medium",
    });
    setEditingDetails(true);
    setProjectTab("overview");
  };

  const saveProjectDetails = async () => {
    if (!selectedProject) return;
    if (!editForm.projectName.trim()) {
      setMessage("Project name is required");
      return;
    }
    if (!editForm.clientName.trim()) {
      setMessage("Client name is required");
      return;
    }
    if (!editForm.clientEmail.trim()) {
      setMessage("Client email is required");
      return;
    }
    if (!editForm.clientPhone.trim()) {
      setMessage("Client phone is required");
      return;
    }
    setSavingDetails(true);
    setMessage("");
    const ok = await patchProject({
      projectName: editForm.projectName.trim(),
      clientName: editForm.clientName.trim(),
      clientEmail: editForm.clientEmail.trim(),
      clientPhone: editForm.clientPhone.trim(),
      companyName: editForm.companyName.trim(),
      services: editForm.services,
      description: editForm.description.trim(),
      budget: parseFloat(editForm.budget) || 0,
      spent: parseFloat(editForm.spent) || 0,
      startDate: editForm.startDate || null,
      deadline: editForm.deadline || null,
      priority: editForm.priority,
    });
    setSavingDetails(false);
    if (ok) {
      setEditingDetails(false);
      setMessage("Project details updated");
    }
  };

  useEffect(() => {
    setEditingDetails(false);
  }, [selectedId]);

  const loadStaffOptions = useCallback(async () => {
    const res = await fetch("/api/admin/staff");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    const list = (data.staff || []) as StaffOption[];
    setStaffOptions(list.filter((s) => s.isActive !== false));
  }, []);

  const loadProjectTeamBundle = useCallback(async (projectId: string) => {
    setLoadingTeam(true);
    try {
      const [teamRes, tasksRes] = await Promise.all([
        fetch(`/api/admin/projects/team?projectId=${encodeURIComponent(projectId)}`, {
          cache: "no-store",
        }),
        fetch(
          `/api/admin/projects/workflow-tasks?projectId=${encodeURIComponent(projectId)}&limit=50`,
          { cache: "no-store" }
        ),
      ]);
      const teamData = await teamRes.json().catch(() => ({}));
      const tasksData = await tasksRes.json().catch(() => ({}));
      if (teamRes.ok) {
        const members = (teamData.members || []) as StaffOption[];
        const ids = members.map((m) => m.id);
        setTeamMemberIds(ids);
        setTeamDraftIds(ids);
      }
      if (tasksRes.ok) {
        setLinkedWfTasks((tasksData.tasks || []) as LinkedWorkflowTask[]);
      }
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  const refreshLinkedWfTasks = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(
        `/api/admin/projects/workflow-tasks?projectId=${encodeURIComponent(projectId)}&limit=50`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      setLinkedWfTasks((data.tasks || []) as LinkedWorkflowTask[]);
    } catch {
      /* keep current list */
    }
  }, []);

  useEffect(() => {
    void loadStaffOptions();
  }, [loadStaffOptions]);

  useEffect(() => {
    if (!selectedId || projectTab !== "team") return;
    void loadProjectTeamBundle(selectedId);
    const refresh = () => void refreshLinkedWfTasks(selectedId);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    const poll = window.setInterval(refresh, 5_000);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(poll);
    };
  }, [selectedId, projectTab, loadProjectTeamBundle, refreshLinkedWfTasks]);

  const saveProjectTeam = async () => {
    if (!selectedProject) return;
    setSavingTeam(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/projects/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          staffUserIds: teamDraftIds,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update team");
      const members = (data.members || []) as StaffOption[];
      const ids = members.map((m) => m.id);
      setTeamMemberIds(ids);
      setTeamDraftIds(ids);
      setMessage(`Team updated (${ids.length} members)`);
      await loadProjects();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not update team");
    } finally {
      setSavingTeam(false);
    }
  };

  const assignProjectWork = async () => {
    if (!selectedProject) return;
    if (!assignWork.title.trim()) {
      setMessage("Task title is required");
      return;
    }
    if (!assignWork.assignedToId) {
      setMessage("Select an employee");
      return;
    }
    setAssigningWork(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/workflow/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assignWork.title.trim(),
          description: assignWork.description.trim(),
          assignedToId: assignWork.assignedToId,
          workDate: assignWork.workDate || todayKey(),
          priority: assignWork.priority,
          workLink: assignWork.workLink.trim(),
          projectId: selectedProject.id,
          status: "todo",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not assign work");
      setAssignWork({
        assignedToId: assignWork.assignedToId,
        workDate: todayKey(),
        title: "",
        description: "",
        priority: "medium",
        workLink: "",
      });
      setMessage("Work assigned — visible in Team Progress and /workflow");
      await loadProjectTeamBundle(selectedProject.id);
      await loadProjects();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not assign work");
    } finally {
      setAssigningWork(false);
    }
  };

  const loadClientUpdateHistory = useCallback(async (projectId: string) => {
    const res = await fetch(
      `/api/admin/projects/client-update?projectId=${encodeURIComponent(projectId)}&history=1&limit=100`,
      { cache: "no-store" }
    );
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    setCuHistory((data.history || []) as ClientUpdateHistoryItem[]);
    setCuHistoryTotal(typeof data.total === "number" ? data.total : (data.history || []).length);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setCuHistory([]);
      setCuHistoryTotal(0);
      return;
    }
    void loadClientUpdateHistory(selectedId);
  }, [selectedId, loadClientUpdateHistory]);

  const openClientUpdateRecord = useCallback(
    async (recordId: string) => {
      if (!selectedId) return;
      setShowCuView(true);
      setCuViewLoading(true);
      setCuViewRecord(null);
      try {
        const qs = new URLSearchParams({ projectId: selectedId, id: recordId });
        const res = await fetch(`/api/admin/projects/client-update?${qs.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not load email");
        setCuViewRecord(data.record as ClientUpdateViewRecord);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Could not load email");
        setShowCuView(false);
      } finally {
        setCuViewLoading(false);
      }
    },
    [selectedId]
  );

  const loadClientUpdatePreview = useCallback(async (projectId: string, note: string) => {
    setCuLoadingPreview(true);
    try {
      const qs = new URLSearchParams({ projectId, note });
      const res = await fetch(`/api/admin/projects/client-update?${qs.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not load preview");

      const snap = data.snapshot as ClientUpdateSnapshot | undefined;
      if (snap) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const draft: ClientUpdateSnapshot = {
          ...snap,
          brandName: snap.brandName || "VynTech Solutions",
          eyebrow: snap.eyebrow || "Project status update",
          checklistHeading: snap.checklistHeading || "This phase",
          paymentsHeading: snap.paymentsHeading || "Payment milestones",
          noteHeading: snap.noteHeading || "Message from VynTech",
          note: note || snap.note || "",
          brandLogoUrl: origin
            ? `${origin}/logo-print.png`
            : snap.brandLogoUrl || "/logo-print.png",
        };
        setCuDraft(draft);
        if (!cuSubjectTouched) {
          setCuSubject(String(data.subject || buildClientUpdateSubject(draft)));
        }
      }

      setCuTo((prev) => (prev.trim() ? prev : String(data.to || "")));
      setCuTestTo(String(data.testTo || ""));
      setCuPreflight(
        data.preflight && typeof data.preflight === "object"
          ? {
              ok: Boolean(data.preflight.ok),
              issues: Array.isArray(data.preflight.issues)
                ? data.preflight.issues.map(String)
                : [],
            }
          : { ok: true, issues: [] }
      );
      if (typeof data.snapshot?.progress === "number") {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, progress: data.snapshot.progress } : p
          )
        );
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not load preview");
    } finally {
      setCuLoadingPreview(false);
    }
  }, [cuSubjectTouched]);

  const patchCu = useCallback(( partial: Partial<ClientUpdateSnapshot>) => {
    setCuDraft((prev) => (prev ? { ...prev, ...partial } : prev));
    setCuConfirmClient(false);
  }, []);

  const cuLiveSnapshot = useMemo((): ClientUpdateSnapshot | null => {
    if (!cuDraft) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
      ...cuDraft,
      brandLogoUrl: origin ? `${origin}/logo-print.png` : cuDraft.brandLogoUrl,
    };
  }, [cuDraft]);

  const cuHtml = useMemo(() => {
    if (!cuLiveSnapshot) return "";
    return buildClientUpdateHtml(cuLiveSnapshot);
  }, [cuLiveSnapshot]);

  const openClientUpdateModal = async (prefill?: {
    subject?: string;
    note?: string;
    to?: string;
  }) => {
    if (!selectedProject) return;
    setShowClientUpdate(true);
    setCuConfirmClient(false);
    setCuSubjectTouched(Boolean(prefill?.subject));
    setCuSubject(prefill?.subject ?? "");
    setCuTo(prefill?.to ?? selectedProject.clientEmail ?? "");
    setCuDraft(null);
    await Promise.all([
      loadClientUpdatePreview(selectedProject.id, prefill?.note ?? ""),
      loadClientUpdateHistory(selectedProject.id),
    ]);
  };

  const syncSubjectFromDraft = (draft: ClientUpdateSnapshot) => {
    if (cuSubjectTouched) return;
    setCuSubject(buildClientUpdateSubject(draft));
  };

  const sendClientUpdate = async (kind: "client" | "test") => {
    if (!selectedProject || !cuLiveSnapshot) return;
    if (kind === "client") {
      const issues = [...cuPreflight.issues];
      if (!cuTo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cuTo.trim())) {
        issues.push("Valid recipient email required");
      }
      if (issues.length > 0) {
        setCuPreflight({ ok: false, issues: [...new Set(issues)] });
        setMessage(issues[0]);
        return;
      }
      if (!cuConfirmClient) {
        setCuConfirmClient(true);
        return;
      }
    }

    setCuSending(true);
    setMessage("");
    const idempotencyKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `cu_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    try {
      const res = await fetch("/api/admin/projects/client-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          note: cuLiveSnapshot.note,
          subject: cuSubject,
          to: kind === "client" ? cuTo.trim() : undefined,
          snapshot: cuLiveSnapshot,
          kind,
          idempotencyKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send update");

      if (kind === "client" && data.clientEmail) {
        applyProject({
          ...selectedProject,
          clientEmail: String(data.clientEmail),
          progress:
            typeof data.progress === "number" ? data.progress : selectedProject.progress,
        });
      }
      setMessage(
        kind === "test"
          ? `Test update sent to ${data.sentTo || cuTestTo}`
          : `Client update emailed to ${data.sentTo || cuTo}`
      );
      setCuConfirmClient(false);
      await loadClientUpdateHistory(selectedProject.id);
      await loadProjects();
      if (kind === "client") setShowClientUpdate(false);
    } catch (e) {
      setCuConfirmClient(false);
      setMessage(e instanceof Error ? e.message : "Could not send update");
    } finally {
      setCuSending(false);
    }
  };

  const assignStaffChoices = useMemo(() => {
    if (teamMemberIds.length === 0) return staffOptions;
    const onTeam = staffOptions.filter((s) => teamMemberIds.includes(s.id));
    return onTeam.length > 0 ? onTeam : staffOptions;
  }, [staffOptions, teamMemberIds]);

  const createProject = async () => {
    if (!newProject.projectName.trim()) {
      setMessage("Project name is required");
      return;
    }
    if (!newProject.clientName.trim()) {
      setMessage("Client name is required");
      return;
    }
    if (!newProject.clientEmail.trim()) {
      setMessage("Client email is required");
      return;
    }
    if (!newProject.clientPhone.trim()) {
      setMessage("Client phone is required");
      return;
    }
    setCreating(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("projectName", newProject.projectName.trim());
      form.set("clientName", newProject.clientName.trim());
      form.set("clientEmail", newProject.clientEmail.trim());
      form.set("clientPhone", newProject.clientPhone.trim());
      form.set("companyName", newProject.companyName.trim());
      form.set("services", newProject.services);
      form.set("description", newProject.description.trim());
      form.set("budget", String(parseFloat(newProject.budget) || 0));
      if (newProject.startDate) form.set("startDate", newProject.startDate);
      if (newProject.deadline) form.set("deadline", newProject.deadline);
      form.set("priority", newProject.priority);
      form.set("status", "discovery");
      if (logoFile) form.set("logo", logoFile);

      const res = await fetch("/api/admin/projects", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create project");
      const created = formatProject(data.project);
      setProjects((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      setSelectedId(created.id);
      setProjectTab("workflow");
      setMobilePane("detail");
      setShowNewProject(false);
      setNewProject(emptyNewProject);
      clearLogoPick();
      setMessage(
        logoFile
          ? "Project created with company logo"
          : "Project created — SDLC workflow seeded"
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not create project");
    } finally {
      setCreating(false);
    }
  };

  const updateCompanyLogo = async (file: File) => {
    if (!selectedProject) return;
    setUploadingLogo(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("id", selectedProject.id);
      form.set("logo", file);
      const res = await fetch("/api/admin/projects", { method: "PATCH", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update logo");
      if (data.project) applyProject(formatProject(data.project));
      setMessage("Company logo updated");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not update logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm("Delete this project?")) return;
    const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setMobilePane("list");
      }
    }
  };

  const toggleCheck = async (checkId: string, done: boolean) => {
    const res = await fetch("/api/admin/projects/phase-checks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: checkId, done }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.project) applyProject(formatProject(data.project));
  };

  const signOffPhase = async (phase: ProjectPhase) => {
    const ok = await patchProject({
      phaseGate: { phase, note: signOffNote.trim() || undefined },
    });
    if (ok) {
      setSignOffNote("");
      setMessage(`${phaseLabel(phase)} signed off`);
    }
  };

  const loadPaymentInvoices = useCallback(async (projectId: string) => {
    try {
      const res = await fetch("/api/admin/billing-invoices", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      const map: Record<
        string,
        { id: string; invoiceNumber: string; status: string; checkoutUrl?: string }
      > = {};
      for (const inv of data.invoices || []) {
        if (inv.projectId === projectId && inv.projectPaymentId) {
          map[String(inv.projectPaymentId)] = {
            id: String(inv.id),
            invoiceNumber: String(inv.invoiceNumber),
            status: String(inv.status),
            checkoutUrl: inv.checkoutUrl ? String(inv.checkoutUrl) : "",
          };
        }
      }
      setPaymentInvoices(map);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!selectedId || projectTab !== "workflow") return;
    void loadPaymentInvoices(selectedId);
  }, [selectedId, projectTab, loadPaymentInvoices]);

  const jumpToClientInvoice = (invoiceId: string, note: string) => {
    try {
      sessionStorage.setItem("vyntech-open-billing-invoice", invoiceId);
    } catch {
      /* ignore */
    }
    setMessage(note);
    onOpenClientInvoice?.(invoiceId);
  };

  const createInvoiceFromPayment = async (paymentId: string) => {
    if (!selectedProject) return;
    setMessage("");
    try {
      const res = await fetch("/api/admin/billing-invoices/from-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject.id, paymentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create invoice");
      const inv = data.invoice as { id: string; invoiceNumber: string; status: string };
      setPaymentInvoices((prev) => ({
        ...prev,
        [paymentId]: {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
        },
      }));
      jumpToClientInvoice(
        inv.id,
        data.existing
          ? `Opening ${inv.invoiceNumber} in Client Invoices…`
          : `Created ${inv.invoiceNumber} — opening editor to send…`
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not create invoice");
    }
  };

  const markPayment = async (paymentId: string, status: string) => {
    const res = await fetch("/api/admin/projects/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: paymentId, status }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.project) applyProject(formatProject(data.project));
  };

  const resetPaymentForm = () => {
    setPaymentForm({ label: "", percent: "", amount: "" });
    setShowAddPayment(false);
    setEditingPaymentId(null);
  };

  const startEditPayment = (pay: Payment) => {
    setEditingPaymentId(pay.id);
    setShowAddPayment(false);
    setPaymentForm({
      label: pay.label,
      percent: String(pay.percent ?? ""),
      amount: String(pay.amount ?? ""),
    });
  };

  const savePaymentMilestone = async () => {
    if (!selectedProject) return;
    if (!paymentForm.label.trim()) {
      setMessage("Milestone name is required");
      return;
    }
    const percent = parseFloat(paymentForm.percent);
    const amount = parseFloat(paymentForm.amount);
    const body: Record<string, unknown> = {
      label: paymentForm.label.trim(),
    };
    if (Number.isFinite(percent)) body.percent = percent;
    if (Number.isFinite(amount)) body.amount = amount;

    const editing = Boolean(editingPaymentId);
    const res = await fetch("/api/admin/projects/payments", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editing
          ? { id: editingPaymentId, ...body }
          : { projectId: selectedProject.id, ...body }
      ),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || "Could not save payment milestone");
      return;
    }
    if (data.project) applyProject(formatProject(data.project));
    resetPaymentForm();
    setMessage(editing ? "Payment milestone updated" : "Payment milestone added");
  };

  const deletePayment = async (paymentId: string) => {
    if (!window.confirm("Delete this payment milestone?")) return;
    const res = await fetch(
      `/api/admin/projects/payments?id=${encodeURIComponent(paymentId)}`,
      { method: "DELETE" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || "Could not delete payment");
      return;
    }
    if (data.project) applyProject(formatProject(data.project));
    if (editingPaymentId === paymentId) resetPaymentForm();
    setMessage("Payment milestone removed");
  };

  const paymentPercentTotal = useMemo(() => {
    return (selectedProject?.payments || []).reduce(
      (sum, p) => sum + (Number(p.percent) || 0),
      0
    );
  }, [selectedProject?.payments]);

  const addTask = async () => {
    if (!selectedProject || !newTask.title) return;
    const res = await fetch("/api/admin/projects/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, projectId: selectedProject.id }),
    });
    if (res.ok) {
      setShowAddTask(false);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" });
      await loadProjects();
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    if (!selectedId || !selectedProject) return;
    const rollback = selectedProject.tasks;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedId
          ? {
              ...p,
              tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
            }
          : p
      )
    );
    const res = await fetch("/api/admin/projects/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status }),
    });
    if (!res.ok) {
      setProjects((prev) =>
        prev.map((p) => (p.id === selectedId ? { ...p, tasks: rollback } : p))
      );
      setMessage("Could not update task status");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!selectedId) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedId
          ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
          : p
      )
    );
    const res = await fetch(`/api/admin/projects/tasks?id=${taskId}`, { method: "DELETE" });
    if (!res.ok) {
      await loadProjects({ silent: true });
      setMessage("Could not delete task");
    }
  };

  const addMilestone = async () => {
    if (!selectedProject || !newMilestone.title) return;
    const res = await fetch("/api/admin/projects/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newMilestone, projectId: selectedProject.id }),
    });
    if (res.ok) {
      setShowAddMilestone(false);
      setNewMilestone({ title: "", dueDate: "" });
      await loadProjects();
    }
  };

  const toggleMilestone = async (milestoneId: string) => {
    const m = selectedProject?.milestones.find((x) => x.id === milestoneId);
    if (!m) return;
    await fetch("/api/admin/projects/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: milestoneId, completed: !m.completed }),
    });
    await loadProjects();
  };

  const addNote = async () => {
    if (!selectedProject || !newNote.trim()) return;
    const res = await fetch("/api/admin/projects/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedProject.id, content: newNote }),
    });
    if (res.ok) {
      setShowAddNote(false);
      setNewNote("");
      await loadProjects();
      setMessage("Note saved — count updated on the Notes tab");
    }
  };

  const gates = parsePhaseGates(selectedProject?.phaseGates);
  const currentPhase = selectedProject
    ? normalizeProjectStatus(selectedProject.status)
    : "discovery";
  const phaseChecks = selectedProject?.phaseChecks || [];
  const currentChecks = phaseChecks.filter((c) => c.phase === currentPhase);
  const checkProg = phaseCheckProgress(phaseChecks, currentPhase);

  const inProgressCount = projects.filter(
    (p) => !["completed", "on_hold"].includes(p.status)
  ).length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const onHoldCount = projects.filter((p) => p.status === "on_hold").length;

  const stats = [
    { label: "Total", value: projects.length },
    { label: "In progress", value: inProgressCount },
    { label: "Completed", value: completedCount },
    { label: "On hold", value: onHoldCount },
  ];

  if (loading && projects.length === 0) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-16 rounded border border-white/10 bg-white/[0.03]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-white/10 rounded overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/[0.03]" />
          ))}
        </div>
        <div className="h-72 rounded border border-white/10 bg-white/[0.03]" />
      </div>
    );
  }

  return (
    <motion.div
      className="pm-shell w-full min-w-0"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      <AnimatePresence>
        {message ? (
          <motion.div
            key="pm-message"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: motionDuration }}
            className="mb-3 overflow-hidden"
          >
            <div className="px-3 py-2 rounded border border-white/15 bg-white/[0.04] text-white/80 text-sm">
              {message}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Page header — enterprise toolbar */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: motionDuration }}
        className="pm-brand-hero mb-3 rounded border border-white/10 bg-white/[0.03]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="pm-brand-hero__title text-base font-semibold text-white tracking-tight">
                Project delivery
              </h2>
              <span className="pm-brand-hero__eyebrow text-[10px] font-medium uppercase tracking-wider text-white/40 border border-white/10 px-1.5 py-0.5 rounded">
                SDLC
              </span>
            </div>
            <p className="pm-brand-hero__sub text-white/45 text-xs mt-1 hidden sm:block">
              Discovery · Requirements · Design · Development · Testing · Deployment · Support ·
              SEO · Digital Marketing
            </p>
            <p className="pm-brand-hero__sub text-white/45 text-xs mt-1 sm:hidden">
              9-phase delivery pipeline · checklists · payments
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => setShowNewProject(true)}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded border border-white/20 bg-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.1] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New project
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        transition={{ duration: motionDuration }}
        className="pm-kpi-strip grid grid-cols-2 lg:grid-cols-4 gap-px mb-3 sm:mb-4 rounded border border-white/10 overflow-hidden bg-white/10"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="pm-stat-card px-3 sm:px-4 py-2.5 sm:py-3"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionDuration, delay: i * stagger }}
          >
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-lg sm:text-xl font-semibold text-white mt-1 tabular-nums tracking-tight">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence initial={false}>
        {showNewProject ? (
          <motion.div
            key="new-project-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: motionDuration }}
            className="mb-3 sm:mb-4 overflow-hidden"
          >
        <div className="rounded border border-white/15 bg-white/[0.03] p-3 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-white font-semibold text-sm">New project</h3>
              <p className="text-white/40 text-xs mt-0.5">
                Opens in Discovery with phase checklist and payment milestones
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowNewProject(false);
                setNewProject(emptyNewProject);
                clearLogoPick();
              }}
              className="text-white/40 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-white/40 text-[11px] mb-1">Project name *</label>
              <input
                className="pm-field"
                value={newProject.projectName}
                onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                placeholder="e.g. Acme Website Redesign"
              />
            </div>
            <div className="md:col-span-2 rounded border border-white/10 bg-white/[0.02] p-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="shrink-0">
                  {logoPreview ? (
                    <span className="flex h-14 w-14 items-center justify-center rounded border border-white/15 bg-white overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="" className="h-full w-full object-contain p-1" />
                    </span>
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded border border-dashed border-white/20 text-white/35 text-[10px] text-center px-1">
                      Logo
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-medium">Company logo</p>
                  <p className="text-white/40 text-[11px] mt-0.5">
                    PNG, JPG, WebP or SVG · max 2 MB · shown on project cards for both CEOs
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <label className="inline-flex cursor-pointer items-center px-2.5 py-1.5 rounded border border-white/20 bg-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.1]">
                      Upload logo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            setMessage("Logo must be 2 MB or smaller");
                            e.target.value = "";
                            return;
                          }
                          pickLogoFile(file);
                        }}
                      />
                    </label>
                    {logoFile ? (
                      <button
                        type="button"
                        onClick={clearLogoPick}
                        className="px-2.5 py-1.5 rounded border border-white/10 text-white/55 text-xs"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Client name *</label>
              <input
                className="pm-field"
                value={newProject.clientName}
                onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Company (optional)</label>
              <input
                className="pm-field"
                value={newProject.companyName}
                onChange={(e) => setNewProject({ ...newProject, companyName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Client email *</label>
              <input
                type="email"
                className="pm-field"
                value={newProject.clientEmail}
                onChange={(e) => setNewProject({ ...newProject, clientEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Client phone *</label>
              <input
                className="pm-field"
                value={newProject.clientPhone}
                onChange={(e) => setNewProject({ ...newProject, clientPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Budget (CAD)</label>
              <input
                type="number"
                className="pm-field"
                value={newProject.budget}
                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Priority</label>
              <select
                className="pm-field"
                value={newProject.priority}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    priority: e.target.value as AdminProject["priority"],
                  })
                }
              >
                <option value="low" className="bg-[#0a0a1a]">
                  Low
                </option>
                <option value="medium" className="bg-[#0a0a1a]">
                  Medium
                </option>
                <option value="high" className="bg-[#0a0a1a]">
                  High
                </option>
                <option value="critical" className="bg-[#0a0a1a]">
                  Critical
                </option>
              </select>
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Start date</label>
              <input
                type="date"
                className="pm-field"
                value={newProject.startDate}
                onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-white/40 text-[11px] mb-1">Deadline</label>
              <input
                type="date"
                className="pm-field"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/40 text-[11px] mb-1">
                Services <span className="text-white/25">(comma-separated)</span>
              </label>
              <input
                className="pm-field"
                value={newProject.services}
                onChange={(e) => setNewProject({ ...newProject, services: e.target.value })}
                placeholder="Web Development, SEO"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/40 text-[11px] mb-1">Description</label>
              <textarea
                className="pm-field pm-field--area"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Scope summary…"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <button
              type="button"
              disabled={creating}
              onClick={() => void createProject()}
              className="px-4 py-2.5 bg-[#0055FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF] disabled:opacity-50 w-full sm:w-auto"
            >
              {creating ? "Creating…" : "Create project"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewProject(false);
                setNewProject(emptyNewProject);
                clearLogoPick();
              }}
              className="px-4 py-2.5 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/15 w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        variants={fadeUp}
        transition={{ duration: motionDuration }}
        className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] gap-3 min-w-0 items-start"
      >
        <div
          className={`bg-white/[0.02] border border-white/10 rounded overflow-hidden flex flex-col w-full lg:sticky lg:top-3 ${
            selectedProject && mobilePane === "detail" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-white font-medium text-xs uppercase tracking-wider">Projects</h3>
              <p className="text-white/35 text-[11px] mt-0.5">{projects.length} records</p>
            </div>
          </div>
          <div className="max-h-[min(40vh,280px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto overscroll-contain">
            {projects.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-white/60 text-sm font-medium">No projects</p>
                <p className="text-white/35 text-xs mt-1 leading-relaxed">
                  Use New project to open a delivery record
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {projects.map((proj, i) => {
                  const active = selectedId === proj.id;
                  const phaseIdx = PIPELINE_PHASES.indexOf(
                    normalizeProjectStatus(proj.status) as (typeof PIPELINE_PHASES)[number]
                  );
                  return (
                    <motion.button
                      key={proj.id}
                      type="button"
                      initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: motionDuration, delay: i * stagger }}
                      whileHover={reduceMotion ? undefined : { x: 2 }}
                      onClick={() => selectProject(proj.id)}
                      className={`w-full text-left px-3 py-2.5 transition-colors border-l-2 ${
                        active
                          ? "bg-white/[0.06] border-l-white"
                          : "bg-transparent border-l-transparent hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5">
                          <ProjectLogoMark
                            name={proj.companyName || proj.projectName}
                            logo={proj.companyLogo}
                            size="sm"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className="pm-check-label font-semibold text-sm leading-snug line-clamp-2"
                              title={proj.projectName}
                            >
                              {proj.projectName}
                            </h4>
                            <span className="pm-check-num text-[10px] tabular-nums shrink-0 font-medium">
                              {proj.progress}%
                            </span>
                          </div>
                          <p className="pm-check-num text-xs truncate mt-0.5">{proj.clientName}</p>
                          <div className="flex items-center justify-between gap-2 mt-1.5">
                            <span className={phaseChipClass(proj.status)} title={phaseLabel(proj.status)}>
                              {phaseLabel(proj.status)}
                            </span>
                            <span className="pm-check-num text-[10px] tabular-nums font-medium">
                              Phase{" "}
                              {phaseIdx >= 0
                                ? `${phaseIdx + 1}/${PIPELINE_PHASES.length}`
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          className={`min-w-0 w-full ${
            !selectedProject || mobilePane === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <AnimatePresence mode="wait">
          {selectedProject ? (
            <motion.div
              key={selectedProject.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
              transition={{ duration: motionDuration }}
              className="bg-white/[0.02] border border-white/10 rounded overflow-hidden min-h-[320px] sm:min-h-[420px]"
            >
              <div className="px-3 sm:px-4 py-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setMobilePane("list")}
                  className="lg:hidden mb-2 inline-flex items-center gap-1 text-[11px] text-white/50 hover:text-white/80"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All projects
                </button>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <label
                      className={`relative shrink-0 cursor-pointer group ${
                        uploadingLogo ? "opacity-60 pointer-events-none" : ""
                      }`}
                      title="Upload company logo"
                    >
                      <ProjectLogoMark
                        name={selectedProject.companyName || selectedProject.projectName}
                        logo={selectedProject.companyLogo}
                        size="md"
                      />
                      <span className="pointer-events-none absolute inset-0 rounded bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-medium text-white transition-opacity">
                        {uploadingLogo ? "…" : "Logo"}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        className="sr-only"
                        disabled={uploadingLogo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            setMessage("Logo must be 2 MB or smaller");
                            return;
                          }
                          void updateCompanyLogo(file);
                        }}
                      />
                    </label>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-white truncate">
                        {selectedProject.projectName}
                      </h2>
                      <p className="text-white/45 text-xs truncate mt-0.5">
                        {selectedProject.clientName}
                        {selectedProject.companyName
                          ? ` · ${selectedProject.companyName}`
                          : ""}
                      </p>
                      <p className="text-white/30 text-[10px] mt-0.5 lg:hidden">
                        Tap logo to upload
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => void openClientUpdateModal()}
                      className="pm-action-btn text-xs"
                    >
                      Send client update
                    </button>
                    <button
                      type="button"
                      onClick={startEditDetails}
                      className="text-xs px-2.5 py-1.5 rounded border border-white/20 bg-white/[0.06] text-white font-medium hover:bg-white/[0.1]"
                    >
                      Edit
                    </button>
                    <select
                      value={selectedProject.priority}
                      onChange={(e) =>
                        updatePriority(e.target.value as AdminProject["priority"])
                      }
                      className={`flex-1 sm:flex-none text-xs px-2 py-1.5 rounded border cursor-pointer outline-none bg-transparent ${priorityStyle(selectedProject.priority)}`}
                    >
                      <option value="low" className="bg-[#0a0a1a]">
                        Low
                      </option>
                      <option value="medium" className="bg-[#0a0a1a]">
                        Medium
                      </option>
                      <option value="high" className="bg-[#0a0a1a]">
                        High
                      </option>
                      <option value="critical" className="bg-[#0a0a1a]">
                        Critical
                      </option>
                    </select>
                    <select
                      value={currentPhase}
                      onChange={(e) => updateStatus(e.target.value as ProjectPhase)}
                      className="flex-1 sm:flex-none bg-transparent border border-white/15 rounded px-2 py-1.5 text-white text-xs outline-none cursor-pointer"
                    >
                      {PROJECT_PHASES.map((p) => (
                        <option key={p.key} value={p.key} className="bg-[#0a0a1a]">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phase strip — horizontal scroll on small screens */}
                <div className="pm-phase-scroll -mx-3 sm:mx-0 px-3 sm:px-0 mb-3 overflow-x-auto overscroll-x-contain">
                  <div className="flex w-max min-w-full sm:w-full sm:flex-wrap border border-white/10 rounded overflow-hidden">
                  {PIPELINE_PHASES.map((phase, idx) => {
                    const curIdx = PIPELINE_PHASES.indexOf(currentPhase);
                    const active = currentPhase === phase;
                    const done =
                      (curIdx > idx && curIdx >= 0) ||
                      currentPhase === "completed" ||
                      (GATED_PHASES.has(phase) && hasPhaseGate(gates, phase));
                    return (
                      <button
                        key={phase}
                        type="button"
                        onClick={() => updateStatus(phase)}
                        className={`px-2.5 py-1.5 text-[10px] font-medium border-r border-white/10 last:border-r-0 transition-colors whitespace-nowrap ${
                          active
                            ? "bg-white/15 text-white"
                            : done
                              ? "bg-white/[0.04] text-white/70"
                              : "bg-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                        }`}
                        title={phaseLabel(phase)}
                      >
                        <span className="text-white/30 mr-1">{idx + 1}</span>
                        <span className="sm:hidden">{phaseAbbrev(phase)}</span>
                        <span className="hidden sm:inline">{phaseLabel(phase)}</span>
                      </button>
                    );
                  })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-white/70"
                      initial={false}
                      animate={{ width: `${selectedProject.progress}%` }}
                      transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-white/50 font-medium text-xs tabular-nums">
                    {selectedProject.progress}%
                  </span>
                </div>
              </div>

              <div className="flex border-b border-white/10 px-1 overflow-x-auto overscroll-x-contain scrollbar-thin">
                {(
                  [
                    { id: "workflow" as const, label: "Workflow", count: null as number | null },
                    {
                      id: "team" as const,
                      label: "Team",
                      count: teamMemberIds.length,
                    },
                    { id: "overview" as const, label: "Overview", count: null },
                    {
                      id: "updates" as const,
                      label: "Updates",
                      count: cuHistoryTotal,
                    },
                    {
                      id: "tasks" as const,
                      label: "Tasks",
                      count: selectedProject.tasks.length,
                    },
                    { id: "timeline" as const, label: "Timeline", count: null },
                    {
                      id: "notes" as const,
                      label: "Notes",
                      count: selectedProject.notes.length,
                    },
                    {
                      id: "activity" as const,
                      label: "Activity",
                      count: selectedProject.activityLog.length,
                    },
                  ]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setProjectTab(tab.id)}
                    className={`relative inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                      projectTab === tab.id
                        ? "text-white"
                        : "text-white/45 hover:text-white/75"
                    }`}
                  >
                    {tab.label}
                    {typeof tab.count === "number" ? (
                      <motion.span
                        key={`${tab.id}-${tab.count}`}
                        initial={reduceMotion ? false : { scale: 0.85, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`pm-tab-count min-w-[1.25rem] h-5 px-1.5 inline-flex items-center justify-center rounded text-[10px] font-semibold tabular-nums border ${
                          tab.count > 0
                            ? projectTab === tab.id
                              ? "bg-white/15 border-white/25 text-white"
                              : "bg-white/[0.06] border-white/15 text-white/70"
                            : "bg-transparent border-white/10 text-white/35"
                        }`}
                        title={`${tab.count} ${tab.label.toLowerCase()} saved`}
                      >
                        {tab.count}
                      </motion.span>
                    ) : null}
                    {projectTab === tab.id ? (
                      <motion.span
                        layoutId="pm-tab-underline"
                        className="absolute left-2 right-2 bottom-0 h-px bg-white"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="p-3 sm:p-4 max-h-[min(70vh,640px)] lg:max-h-[calc(100vh-480px)] overflow-y-auto overscroll-contain">
                <AnimatePresence mode="wait">
                {projectTab === "workflow" && (
                  <motion.div
                    key="tab-workflow"
                    variants={fadeOnly}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: motionDuration }}
                    className="space-y-3"
                  >
                    <div className="rounded border border-white/10 overflow-hidden">
                      <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-white/10">
                        <div>
                          <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
                            {phaseLabel(currentPhase)} checklist
                          </p>
                          <p className="pm-check-num text-[11px] mt-0.5">
                            Complete items before advancing
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="pm-check-label text-sm font-semibold tabular-nums">
                            {checkProg.percent}%
                          </p>
                          <p className="pm-check-num text-[11px] tabular-nums">
                            {checkProg.done}/{checkProg.total}
                          </p>
                        </div>
                      </div>
                      {checkProg.total > 0 ? (
                        <div className="h-0.5 bg-white/10">
                          <div
                            className="h-full bg-white/55 transition-all duration-300"
                            style={{ width: `${checkProg.percent}%` }}
                          />
                        </div>
                      ) : null}
                      {currentChecks.length === 0 ? (
                        <p className="text-white/40 text-sm px-3 py-5">
                          No checklist for this status. Select a pipeline phase above.
                        </p>
                      ) : (
                        <ul className="divide-y divide-white/5">
                          {currentChecks.map((c, idx) => (
                            <li key={c.id}>
                              <label
                                className={`pm-check-row flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${
                                  c.done ? "pm-check-row--done" : ""
                                }`}
                              >
                                <motion.span
                                  className={`pm-check-box mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                                    c.done ? "pm-check-box--on" : ""
                                  }`}
                                  aria-hidden
                                  animate={
                                    c.done && !reduceMotion
                                      ? { scale: [1, 1.15, 1] }
                                      : { scale: 1 }
                                  }
                                  transition={{ duration: 0.22 }}
                                >
                                  {c.done ? (
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : null}
                                </motion.span>
                                <input
                                  type="checkbox"
                                  checked={c.done}
                                  onChange={(e) => void toggleCheck(c.id, e.target.checked)}
                                  className="sr-only"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="pm-check-num text-[10px] font-medium tabular-nums mr-1.5">
                                    {String(idx + 1).padStart(2, "0")}
                                  </span>
                                  <span
                                    className={`pm-check-label text-sm font-medium leading-snug ${
                                      c.done ? "pm-check-label--done" : ""
                                    }`}
                                  >
                                    {c.label?.trim() || "(Untitled check item)"}
                                  </span>
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {GATED_PHASES.has(currentPhase) && (
                      <div className="border border-white/10 rounded p-3 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-white font-medium text-xs uppercase tracking-wider">
                            Sign-off · {phaseLabel(currentPhase)}
                          </p>
                          {hasPhaseGate(gates, currentPhase) ? (
                            <span className="text-[11px] text-white/60 font-medium">
                              Signed{" "}
                              {new Date(
                                gates.find((g) => g.phase === currentPhase)!.signedOffAt
                              ).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[11px] text-white/45">Pending sign-off</span>
                          )}
                        </div>
                        {!hasPhaseGate(gates, currentPhase) ? (
                          <>
                            <input
                              className="pm-field"
                              placeholder="Optional note (e.g. signed PDF received)"
                              value={signOffNote}
                              onChange={(e) => setSignOffNote(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => void signOffPhase(currentPhase)}
                              className="px-3 py-1.5 border border-white/20 bg-white/[0.06] text-white text-xs font-medium rounded hover:bg-white/[0.1]"
                            >
                              Mark signed off
                            </button>
                          </>
                        ) : null}
                      </div>
                    )}

                    <div className="rounded border border-white/10 overflow-hidden">
                      <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-white/10">
                        <div>
                          <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
                            Payment milestones
                          </p>
                          <p className="pm-check-num text-[11px] mt-0.5">
                            Allocated{" "}
                            <span
                              className={
                                Math.abs(paymentPercentTotal - 100) < 0.01
                                  ? "text-white font-medium"
                                  : "text-white/70 font-medium"
                              }
                            >
                              {paymentPercentTotal}%
                            </span>{" "}
                            of budget
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPaymentId(null);
                            setPaymentForm({ label: "", percent: "", amount: "" });
                            setShowAddPayment(true);
                          }}
                          className="text-xs px-2.5 py-1 rounded border border-white/20 bg-white/[0.06] text-white font-medium hover:bg-white/[0.1]"
                        >
                          Add milestone
                        </button>
                      </div>

                      {(showAddPayment || editingPaymentId) && (
                        <div className="px-3 py-3 border-b border-white/10 bg-white/[0.02] space-y-2.5">
                          <p className="pm-check-label text-xs font-medium">
                            {editingPaymentId ? "Edit milestone" : "New milestone"}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              className="pm-field sm:col-span-3"
                              placeholder="e.g. 50% on contract signing"
                              value={paymentForm.label}
                              onChange={(e) =>
                                setPaymentForm({ ...paymentForm, label: e.target.value })
                              }
                            />
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step="0.1"
                              className="pm-field"
                              placeholder="% of budget"
                              value={paymentForm.percent}
                              onChange={(e) => {
                                const percent = e.target.value;
                                const p = parseFloat(percent);
                                const autoAmount =
                                  Number.isFinite(p) && selectedProject.budget
                                    ? String(
                                        Math.round((selectedProject.budget * p) / 100 * 100) / 100
                                      )
                                    : paymentForm.amount;
                                setPaymentForm({
                                  ...paymentForm,
                                  percent,
                                  amount: Number.isFinite(p) ? autoAmount : paymentForm.amount,
                                });
                              }}
                            />
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="pm-field"
                              placeholder="Amount $"
                              value={paymentForm.amount}
                              onChange={(e) =>
                                setPaymentForm({ ...paymentForm, amount: e.target.value })
                              }
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => void savePaymentMilestone()}
                                className="flex-1 px-3 py-1.5 rounded border border-white/20 bg-white/[0.08] text-white text-xs font-medium"
                              >
                                {editingPaymentId ? "Save" : "Add"}
                              </button>
                              <button
                                type="button"
                                onClick={resetPaymentForm}
                                className="px-3 py-1.5 rounded border border-white/10 text-white/60 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="divide-y divide-white/5">
                        {(selectedProject.payments || []).length === 0 ? (
                          <p className="pm-check-num text-sm px-3 py-5 text-center">
                            No milestones. Add a custom payment schedule.
                          </p>
                        ) : (
                          (selectedProject.payments || []).map((pay) => (
                            <div
                              key={pay.id}
                              className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 px-3 py-2.5"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="pm-check-label text-sm font-medium">{pay.label}</p>
                                <p className="pm-check-num text-xs mt-0.5">
                                  {pay.percent}% · ${Number(pay.amount).toLocaleString()}
                                  {pay.paidAt
                                    ? ` · paid ${new Date(pay.paidAt).toLocaleDateString()}`
                                    : ""}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                <span
                                  className={`pm-status-chip ${
                                    pay.status === "paid"
                                      ? "pm-status-chip--paid"
                                      : pay.status === "due"
                                        ? "pm-status-chip--due"
                                        : "pm-status-chip--pending"
                                  }`}
                                >
                                  {pay.status || "pending"}
                                </span>
                                {paymentInvoices[pay.id] ? (
                                  <>
                                    <span
                                      className={`pm-status-chip ${
                                        paymentInvoices[pay.id].status === "paid"
                                          ? "pm-status-chip--paid"
                                          : paymentInvoices[pay.id].status === "overdue"
                                            ? "pm-status-chip--due"
                                            : "pm-status-chip--pending"
                                      }`}
                                      title={`Invoice ${paymentInvoices[pay.id].invoiceNumber}`}
                                    >
                                      inv {paymentInvoices[pay.id].status}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        jumpToClientInvoice(
                                          paymentInvoices[pay.id].id,
                                          `Opening ${paymentInvoices[pay.id].invoiceNumber}…`
                                        )
                                      }
                                      className="pm-action-btn"
                                      title={paymentInvoices[pay.id].invoiceNumber}
                                    >
                                      Open invoice
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => void createInvoiceFromPayment(pay.id)}
                                    className="pm-action-btn"
                                  >
                                    Create invoice
                                  </button>
                                )}
                                {pay.status !== "paid" ? (
                                  <button
                                    type="button"
                                    onClick={() => void markPayment(pay.id, "paid")}
                                    className="pm-action-btn"
                                  >
                                    Mark paid
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => void markPayment(pay.id, "pending")}
                                    className="pm-action-btn"
                                  >
                                    Undo
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => startEditPayment(pay)}
                                  className="pm-action-btn"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void deletePayment(pay.id)}
                                  className="pm-action-btn pm-action-btn--danger"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <p className="text-white/30 text-[11px] leading-relaxed">
                      Ground rules: no development before requirements are signed; change outside
                      scope is quoted separately; both partners review before client delivery.
                    </p>
                  </motion.div>
                )}

                {projectTab === "team" && (
                  <motion.div
                    key="tab-team"
                    variants={fadeOnly}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: motionDuration }}
                    className="space-y-4"
                  >
                    <div>
                      <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
                        Project team
                      </p>
                      <p className="pm-check-num text-[11px] mt-0.5">
                        Assign staff so both CEOs can hand off work into Team Progress /workflow
                      </p>
                    </div>

                    {loadingTeam ? (
                      <p className="pm-check-num text-sm">Loading team…</p>
                    ) : (
                      <>
                        <div className="rounded border border-white/15 overflow-hidden">
                          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
                            <p className="pm-check-label text-xs font-medium">
                              Members ({teamDraftIds.length})
                            </p>
                            <button
                              type="button"
                              disabled={savingTeam}
                              onClick={() => void saveProjectTeam()}
                              className="pm-action-btn text-xs disabled:opacity-50"
                            >
                              {savingTeam ? "Saving…" : "Save team"}
                            </button>
                          </div>
                          {staffOptions.length === 0 ? (
                            <p className="pm-check-num text-sm px-3 py-5 text-center">
                              No employees yet. Create accounts under Team Progress first.
                            </p>
                          ) : (
                            <ul className="divide-y divide-white/5 max-h-56 overflow-y-auto">
                              {staffOptions.map((s) => {
                                const checked = teamDraftIds.includes(s.id);
                                return (
                                  <li key={s.id}>
                                    <label className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-white/[0.03]">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                          setTeamDraftIds((prev) =>
                                            checked
                                              ? prev.filter((id) => id !== s.id)
                                              : [...prev, s.id]
                                          );
                                        }}
                                        className="rounded border-white/30"
                                      />
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ background: s.color || "#64748b" }}
                                      />
                                      <span className="pm-check-label text-sm min-w-0 truncate">
                                        {s.name}
                                      </span>
                                      <span className="pm-check-num text-[11px] truncate ml-auto">
                                        {s.email}
                                      </span>
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        {teamMemberIds.length === 0 ? (
                          <p className="pm-check-num text-xs">
                            Add team members so you can assign project work. Until then, assign
                            form lists all active staff.
                          </p>
                        ) : null}

                        <div className="rounded border border-white/15 p-3 sm:p-4 space-y-3">
                          <div>
                            <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
                              Assign work
                            </p>
                            <p className="pm-check-num text-[11px] mt-0.5">
                              Creates a Workflow task for the employee (calendar + /workflow)
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-white/40 text-[11px] mb-1">
                                Assignee *
                              </label>
                              <select
                                className="pm-field"
                                value={assignWork.assignedToId}
                                onChange={(e) =>
                                  setAssignWork({ ...assignWork, assignedToId: e.target.value })
                                }
                              >
                                <option value="" className="bg-[#0a0a1a]">
                                  Select employee
                                </option>
                                {assignStaffChoices.map((s) => (
                                  <option key={s.id} value={s.id} className="bg-[#0a0a1a]">
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-white/40 text-[11px] mb-1">
                                Work date *
                              </label>
                              <input
                                type="date"
                                className="pm-field"
                                value={assignWork.workDate}
                                onChange={(e) =>
                                  setAssignWork({ ...assignWork, workDate: e.target.value })
                                }
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-white/40 text-[11px] mb-1">
                                Title *
                              </label>
                              <input
                                className="pm-field"
                                value={assignWork.title}
                                onChange={(e) =>
                                  setAssignWork({ ...assignWork, title: e.target.value })
                                }
                                placeholder="e.g. SARJ homepage wireframes"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-white/40 text-[11px] mb-1">Notes</label>
                              <textarea
                                className="pm-field pm-field--area"
                                value={assignWork.description}
                                onChange={(e) =>
                                  setAssignWork({ ...assignWork, description: e.target.value })
                                }
                                placeholder="Context for the employee…"
                              />
                            </div>
                            <div>
                              <label className="block text-white/40 text-[11px] mb-1">
                                Priority
                              </label>
                              <select
                                className="pm-field"
                                value={assignWork.priority}
                                onChange={(e) =>
                                  setAssignWork({ ...assignWork, priority: e.target.value })
                                }
                              >
                                <option value="low" className="bg-[#0a0a1a]">
                                  Low
                                </option>
                                <option value="medium" className="bg-[#0a0a1a]">
                                  Medium
                                </option>
                                <option value="high" className="bg-[#0a0a1a]">
                                  High
                                </option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-white/40 text-[11px] mb-1">
                                Work link (optional)
                              </label>
                              <input
                                className="pm-field"
                                value={assignWork.workLink}
                                onChange={(e) =>
                                  setAssignWork({ ...assignWork, workLink: e.target.value })
                                }
                                placeholder="https://…"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={assigningWork}
                            onClick={() => void assignProjectWork()}
                            className="pm-action-btn text-xs disabled:opacity-50"
                          >
                            {assigningWork ? "Assigning…" : "Assign work"}
                          </button>
                        </div>

                        <div className="rounded border border-white/15 overflow-hidden">
                          <div className="px-3 py-2 border-b border-white/10">
                            <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
                              Linked workflow tasks
                            </p>
                            <p className="pm-check-num text-[11px] mt-0.5">
                              Recent work tagged to this project · open Team Progress for day detail
                            </p>
                          </div>
                          {linkedWfTasks.length === 0 ? (
                            <p className="pm-check-num text-sm px-3 py-5 text-center">
                              No workflow tasks linked yet.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="border-b border-white/10 text-left">
                                    <th className="pm-check-num font-medium px-3 py-2">Date</th>
                                    <th className="pm-check-num font-medium px-3 py-2">Title</th>
                                    <th className="pm-check-num font-medium px-3 py-2">Assignee</th>
                                    <th className="pm-check-num font-medium px-3 py-2">Status</th>
                                    <th className="pm-check-num font-medium px-3 py-2">Priority</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {linkedWfTasks.map((t) => (
                                    <tr key={t.id}>
                                      <td className="pm-check-num px-3 py-2 whitespace-nowrap tabular-nums">
                                        {t.workDate}
                                      </td>
                                      <td className="pm-check-label px-3 py-2 font-medium max-w-[200px] truncate">
                                        {t.title}
                                      </td>
                                      <td className="pm-check-num px-3 py-2 whitespace-nowrap">
                                        {t.assignedTo?.name || "—"}
                                      </td>
                                      <td className="px-3 py-2">
                                        <span
                                          className={`pm-status-chip ${
                                            t.status === "done"
                                              ? "pm-status-chip--paid"
                                              : t.status === "blocked"
                                                ? "pm-status-chip--due"
                                                : "pm-status-chip--pending"
                                          }`}
                                        >
                                          {WF_STATUS_LABEL[t.status] || t.status}
                                        </span>
                                      </td>
                                      <td className="pm-check-num px-3 py-2 capitalize">
                                        {t.priority}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {projectTab === "overview" && (
                  <motion.div
                    key="tab-overview"
                    variants={fadeOnly}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: motionDuration }}
                    className="space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
                          Project details
                        </p>
                        <p className="pm-check-num text-[11px] mt-0.5">
                          Edit client, budget, services, and description anytime
                        </p>
                      </div>
                      {!editingDetails ? (
                        <button
                          type="button"
                          onClick={startEditDetails}
                          className="shrink-0 px-2.5 py-1.5 rounded border border-white/20 bg-white/[0.06] text-white text-xs font-medium hover:bg-white/[0.1]"
                        >
                          Edit details
                        </button>
                      ) : null}
                    </div>

                    {editingDetails ? (
                      <div className="pm-edit-panel rounded border border-white/20 bg-white/[0.02] p-3 sm:p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-white/40 text-[11px] mb-1">
                              Project name *
                            </label>
                            <input
                              className="pm-field"
                              value={editForm.projectName}
                              onChange={(e) =>
                                setEditForm({ ...editForm, projectName: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">
                              Client name *
                            </label>
                            <input
                              className="pm-field"
                              value={editForm.clientName}
                              onChange={(e) =>
                                setEditForm({ ...editForm, clientName: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">Company</label>
                            <input
                              className="pm-field"
                              value={editForm.companyName}
                              onChange={(e) =>
                                setEditForm({ ...editForm, companyName: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">
                              Client email *
                            </label>
                            <input
                              type="email"
                              className="pm-field"
                              value={editForm.clientEmail}
                              onChange={(e) =>
                                setEditForm({ ...editForm, clientEmail: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">
                              Client phone *
                            </label>
                            <input
                              className="pm-field"
                              value={editForm.clientPhone}
                              onChange={(e) =>
                                setEditForm({ ...editForm, clientPhone: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">
                              Budget (CAD)
                            </label>
                            <input
                              type="number"
                              className="pm-field"
                              value={editForm.budget}
                              onChange={(e) =>
                                setEditForm({ ...editForm, budget: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">Spent (CAD)</label>
                            <input
                              type="number"
                              className="pm-field"
                              value={editForm.spent}
                              onChange={(e) =>
                                setEditForm({ ...editForm, spent: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">Start date</label>
                            <input
                              type="date"
                              className="pm-field"
                              value={editForm.startDate}
                              onChange={(e) =>
                                setEditForm({ ...editForm, startDate: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">Deadline</label>
                            <input
                              type="date"
                              className="pm-field"
                              value={editForm.deadline}
                              onChange={(e) =>
                                setEditForm({ ...editForm, deadline: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">Priority</label>
                            <select
                              className="pm-field"
                              value={editForm.priority}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  priority: e.target.value as AdminProject["priority"],
                                })
                              }
                            >
                              <option value="low" className="bg-[#0a0a1a]">
                                Low
                              </option>
                              <option value="medium" className="bg-[#0a0a1a]">
                                Medium
                              </option>
                              <option value="high" className="bg-[#0a0a1a]">
                                High
                              </option>
                              <option value="critical" className="bg-[#0a0a1a]">
                                Critical
                              </option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-white/40 text-[11px] mb-1">
                              Services (comma-separated)
                            </label>
                            <input
                              className="pm-field"
                              value={editForm.services}
                              onChange={(e) =>
                                setEditForm({ ...editForm, services: e.target.value })
                              }
                              placeholder="Web Development, SEO"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-white/40 text-[11px] mb-1">
                              Description
                            </label>
                            <textarea
                              className="pm-field pm-field--area"
                              value={editForm.description}
                              onChange={(e) =>
                                setEditForm({ ...editForm, description: e.target.value })
                              }
                              placeholder="Scope summary…"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                          <button
                            type="button"
                            disabled={savingDetails}
                            onClick={() => void saveProjectDetails()}
                            className="px-3 py-2 rounded border border-white/20 bg-white/[0.08] text-white text-xs font-medium disabled:opacity-50"
                          >
                            {savingDetails ? "Saving…" : "Save changes"}
                          </button>
                          <button
                            type="button"
                            disabled={savingDetails}
                            onClick={() => setEditingDetails(false)}
                            className="px-3 py-2 rounded border border-white/10 text-white/60 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          <a
                            href={`mailto:${selectedProject.clientEmail}`}
                            className="flex items-center gap-3 border border-white/10 rounded p-3"
                          >
                            <div className="min-w-0">
                              <p className="text-white/40 text-[10px]">Email</p>
                              <p className="pm-check-label text-xs font-medium truncate">
                                {selectedProject.clientEmail}
                              </p>
                            </div>
                          </a>
                          <a
                            href={`tel:${selectedProject.clientPhone}`}
                            className="flex items-center gap-3 border border-white/10 rounded p-3"
                          >
                            <div className="min-w-0">
                              <p className="text-white/40 text-[10px]">Phone</p>
                              <p className="pm-check-label text-xs font-medium">
                                {selectedProject.clientPhone}
                              </p>
                            </div>
                          </a>
                          <div className="flex items-center gap-3 border border-white/10 rounded p-3">
                            <div className="min-w-0">
                              <p className="text-white/40 text-[10px]">Deadline</p>
                              <p className="pm-check-label text-xs font-medium">
                                {selectedProject.deadline
                                  ? new Date(selectedProject.deadline).toLocaleDateString()
                                  : "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border border-white/10 rounded p-3 sm:p-4">
                          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">
                            Budget overview
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/40 text-[10px] mb-1">Total budget</p>
                              <p className="pm-check-label text-xl font-semibold tabular-nums">
                                ${Number(selectedProject.budget || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/40 text-[10px] mb-1">Spent</p>
                              <p className="pm-check-label text-xl font-semibold tabular-nums text-white/80">
                                ${Number(selectedProject.spent || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-2">
                            Services
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(selectedProject.services || []).length === 0 ? (
                              <p className="pm-check-num text-xs">No services listed</p>
                            ) : (
                              selectedProject.services.map((service, i) => (
                                <span
                                  key={i}
                                  className="border border-white/15 text-white/70 px-2.5 py-1 rounded text-xs font-medium"
                                >
                                  {service}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-2">
                            Project description
                          </p>
                          <div className="border border-white/10 rounded p-3">
                            <p className="pm-check-label text-sm whitespace-pre-wrap">
                              {selectedProject.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => void deleteProject(selectedProject.id)}
                        className="text-red-400 text-xs hover:text-red-300 transition-colors"
                      >
                        Delete project
                      </button>
                      {!editingDetails ? (
                        <button
                          type="button"
                          onClick={startEditDetails}
                          className="text-xs text-white/50 hover:text-white underline-offset-2 hover:underline"
                        >
                          Edit project details
                        </button>
                      ) : null}
                    </div>
                  </motion.div>
                )}

                {projectTab === "tasks" && (
                  <motion.div
                    key="tab-tasks"
                    variants={fadeOnly}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: motionDuration }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
                        {selectedProject.tasks.length} Tasks
                      </p>
                      <button
                        onClick={() => setShowAddTask(true)}
                        className="px-3 py-1.5 bg-[#0055FF] text-white text-xs font-medium rounded-lg"
                      >
                        Add Task
                      </button>
                    </div>
                    {showAddTask && (
                      <div className="bg-white/[0.05] border border-white/10 rounded-xl p-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Task title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="pm-field"
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          className="pm-field pm-field--area"
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <select
                            value={newTask.priority}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                priority: e.target.value as Task["priority"],
                              })
                            }
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                          >
                            <option value="low" className="bg-[#0a0a1a]">
                              Low
                            </option>
                            <option value="medium" className="bg-[#0a0a1a]">
                              Medium
                            </option>
                            <option value="high" className="bg-[#0a0a1a]">
                              High
                            </option>
                            <option value="critical" className="bg-[#0a0a1a]">
                              Critical
                            </option>
                          </select>
                          <input
                            type="date"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Assignee"
                            value={newTask.assignee}
                            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => void addTask()}
                            className="px-4 py-2 bg-[#0055FF] text-white text-sm rounded-lg"
                          >
                            Add Task
                          </button>
                          <button
                            onClick={() => setShowAddTask(false)}
                            className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {selectedProject.tasks.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-8">No tasks yet</p>
                      ) : (
                        selectedProject.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-white/[0.03] border border-white/10 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <button
                                  onClick={() =>
                                    void updateTaskStatus(
                                      task.id,
                                      task.status === "completed" ? "pending" : "completed"
                                    )
                                  }
                                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    task.status === "completed"
                                      ? "bg-emerald-500 border-emerald-500"
                                      : "border-white/30"
                                  }`}
                                >
                                  {task.status === "completed" ? (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : null}
                                </button>
                                <div className="min-w-0">
                                  <h4
                                    className={`text-sm font-medium ${
                                      task.status === "completed"
                                        ? "text-white/40 line-through"
                                        : "text-white"
                                    }`}
                                  >
                                    {task.title}
                                  </h4>
                                  {task.description ? (
                                    <p className="text-white/40 text-xs mt-1">{task.description}</p>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={task.status}
                                  onChange={(e) =>
                                    void updateTaskStatus(
                                      task.id,
                                      e.target.value as Task["status"]
                                    )
                                  }
                                  className={`text-[10px] px-2 py-1 rounded outline-none ${taskStatusStyle(task.status)}`}
                                >
                                  <option value="pending" className="bg-[#0a0a1a]">
                                    Pending
                                  </option>
                                  <option value="in_progress" className="bg-[#0a0a1a]">
                                    In Progress
                                  </option>
                                  <option value="completed" className="bg-[#0a0a1a]">
                                    Completed
                                  </option>
                                </select>
                                <button
                                  onClick={() => void deleteTask(task.id)}
                                  className="p-1 text-white/30 hover:text-red-400"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {projectTab === "timeline" && (
                  <motion.div
                    key="tab-timeline"
                    variants={fadeOnly}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: motionDuration }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white/40 text-xs uppercase tracking-wider font-medium">
                        Milestones
                      </p>
                      <button
                        onClick={() => setShowAddMilestone(true)}
                        className="px-3 py-1.5 bg-[#0055FF] text-white text-xs font-medium rounded-lg"
                      >
                        Add Milestone
                      </button>
                    </div>
                    {showAddMilestone && (
                      <div className="bg-white/[0.05] border border-white/10 rounded-xl p-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Milestone title"
                          value={newMilestone.title}
                          onChange={(e) =>
                            setNewMilestone({ ...newMilestone, title: e.target.value })
                          }
                          className="pm-field"
                        />
                        <input
                          type="date"
                          value={newMilestone.dueDate}
                          onChange={(e) =>
                            setNewMilestone({ ...newMilestone, dueDate: e.target.value })
                          }
                          className="pm-field"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => void addMilestone()}
                            className="px-4 py-2 bg-[#0055FF] text-white text-sm rounded-lg"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setShowAddMilestone(false)}
                            className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      {selectedProject.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-lg p-3"
                        >
                          <button
                            onClick={() => void toggleMilestone(milestone.id)}
                            className={`w-5 h-5 rounded-full border-2 ${
                              milestone.completed
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-white/30"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                milestone.completed
                                  ? "text-white/40 line-through"
                                  : "text-white"
                              }`}
                            >
                              {milestone.title}
                            </p>
                          </div>
                          <span className="text-white/30 text-xs">
                            {milestone.dueDate
                              ? new Date(milestone.dueDate).toLocaleDateString()
                              : "No date"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                        <p className="text-white/40 text-[10px]">Start Date</p>
                        <p className="text-white text-sm font-medium">
                          {selectedProject.startDate
                            ? new Date(selectedProject.startDate).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                        <p className="text-white/40 text-[10px]">Deadline</p>
                        <p className="text-white text-sm font-medium">
                          {selectedProject.deadline
                            ? new Date(selectedProject.deadline).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {projectTab === "notes" && (
                  <motion.div
                    key="tab-notes"
                    variants={fadeOnly}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: motionDuration }}
                    className="space-y-3"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
                          Shared notes{" "}
                          <span className="text-white/50 font-medium normal-case tracking-normal">
                            ({selectedProject.notes.length} saved)
                          </span>
                        </p>
                        <p className="pm-check-num text-[11px] mt-0.5">
                          Visible to both CEOs · author and timestamp on every entry
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddNote(true)}
                        className="shrink-0 px-2.5 py-1.5 border border-white/20 bg-white/[0.06] text-white text-xs font-medium rounded hover:bg-white/[0.1]"
                      >
                        Add note
                      </button>
                    </div>
                    {showAddNote && (
                      <div className="border border-white/15 rounded p-3 space-y-3 bg-white/[0.02]">
                        <textarea
                          placeholder="Write a note for the other CEO to see…"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="pm-field pm-field--area"
                        />
                        <div className="flex flex-col-reverse sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => void addNote()}
                            className="px-3 py-1.5 border border-white/20 bg-white/[0.08] text-white text-xs font-medium rounded"
                          >
                            Save note
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddNote(false)}
                            className="px-3 py-1.5 border border-white/10 text-white/60 text-xs rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="border border-white/10 rounded overflow-hidden divide-y divide-white/5">
                      {selectedProject.notes.length === 0 ? (
                        <p className="pm-check-num text-sm px-3 py-6 text-center">
                          No notes yet. Save the first one — count updates on the Notes tab.
                        </p>
                      ) : (
                        [...selectedProject.notes]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                          )
                          .map((note, idx) => (
                            <div key={note.id} className="px-3 py-3">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="pm-check-num text-[10px] font-medium tabular-nums">
                                  #{selectedProject.notes.length - idx}
                                </span>
                                <span className="pm-check-num text-[10px] truncate">
                                  {note.author || "Admin"} ·{" "}
                                  {new Date(note.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="pm-check-label text-sm whitespace-pre-wrap leading-relaxed">
                                {note.content}
                              </p>
                            </div>
                          ))
                      )}
                    </div>
                  </motion.div>
                )}

                {projectTab === "activity" && (
                  <motion.div
                    key="tab-activity"
                    variants={fadeOnly}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: motionDuration }}
                    className="space-y-2"
                  >
                    {selectedProject.activityLog
                      .slice()
                      .reverse()
                      .map((activity) => (
                        <div
                          key={activity.id}
                          className="bg-white/[0.02] border border-white/5 rounded-lg p-3"
                        >
                          <p className="text-white/70 text-sm">{activity.action}</p>
                          <p className="text-white/30 text-xs mt-1">
                            {activity.user} · {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </motion.div>
                )}

                {projectTab === "updates" && (
                  <motion.div
                    key="tab-updates"
                    variants={fadeOnly}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{ duration: motionDuration }}
                    className="space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Client update emails</p>
                        <p className="text-white/40 text-xs mt-0.5">
                          Full send record for this project
                          {cuHistoryTotal > 0 ? ` · ${cuHistoryTotal} total` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void openClientUpdateModal()}
                        className="pm-action-btn text-xs shrink-0"
                      >
                        Compose update
                      </button>
                    </div>

                    {cuHistory.length === 0 ? (
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 text-center">
                        <p className="text-white/45 text-sm">No client emails sent yet.</p>
                        <p className="text-white/30 text-xs mt-1">
                          Send an update from Compose — every send is logged here.
                        </p>
                      </div>
                    ) : (
                      <div className="border border-white/10 rounded-lg overflow-hidden">
                        <div className="hidden sm:grid grid-cols-[1fr_140px_90px_90px_72px] gap-2 px-3 py-2 border-b border-white/10 text-[10px] uppercase tracking-wide text-white/35">
                          <span>Subject / recipient</span>
                          <span>When</span>
                          <span>Kind</span>
                          <span>Status</span>
                          <span />
                        </div>
                        <ul className="divide-y divide-white/5">
                          {cuHistory.map((row) => (
                            <li
                              key={row.id}
                              className="px-3 py-3 sm:grid sm:grid-cols-[1fr_140px_90px_90px_72px] sm:gap-2 sm:items-center"
                            >
                              <div className="min-w-0">
                                <p className="text-white/80 text-sm truncate">{row.subject}</p>
                                <p className="text-white/35 text-[11px] mt-0.5 truncate">
                                  To {row.sentTo}
                                  {row.bccTo ? ` · BCC ${row.bccTo}` : ""}
                                  {row.sentBy ? ` · ${row.sentBy}` : ""}
                                </p>
                                {row.errorMessage ? (
                                  <p className="text-red-300/70 text-[10px] mt-1 truncate">
                                    {row.errorMessage}
                                  </p>
                                ) : null}
                              </div>
                              <p className="text-white/40 text-[11px] mt-1.5 sm:mt-0">
                                {new Date(row.createdAt).toLocaleString()}
                              </p>
                              <p className="text-white/45 text-[11px] mt-1 sm:mt-0 capitalize">
                                {row.kind === "test" ? "Test" : "Client"}
                              </p>
                              <p
                                className={`text-[11px] mt-1 sm:mt-0 ${
                                  row.status === "failed"
                                    ? "text-red-300/80"
                                    : "text-emerald-300/70"
                                }`}
                              >
                                {row.status === "failed" ? "Failed" : "Sent"}
                              </p>
                              <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:justify-end">
                                <button
                                  type="button"
                                  onClick={() => void openClientUpdateRecord(row.id)}
                                  className="text-[11px] text-white/70 hover:text-white"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void openClientUpdateModal({
                                      subject: row.subject,
                                      note: row.messageNote || "",
                                      to: row.kind === "client" ? row.sentTo : undefined,
                                    })
                                  }
                                  className="text-[11px] text-white/40 hover:text-white/70"
                                >
                                  Reuse
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        {cuHistoryTotal > cuHistory.length ? (
                          <p className="px-3 py-2 text-[10px] text-white/30 border-t border-white/5">
                            Showing latest {cuHistory.length} of {cuHistoryTotal}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pm-empty-detail"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/[0.02] border border-white/10 rounded min-h-[280px] sm:min-h-[420px] flex items-center justify-center p-6 sm:p-8"
            >
              <div className="text-center max-w-sm">
                <p className="text-white font-medium text-sm">No project selected</p>
                <p className="text-white/40 text-xs mt-1.5 leading-relaxed">
                  Choose a record from the list, or create a new project.
                </p>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.div>

      {showClientUpdate && selectedProject ? (
        <div
          className="pm-client-update-overlay fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget && !cuSending) {
              setShowClientUpdate(false);
              setCuConfirmClient(false);
            }
          }}
        >
          <div
            className="pm-client-update w-full sm:max-w-4xl max-h-[94vh] overflow-hidden flex flex-col rounded-t border-t sm:rounded sm:border border-white/15 bg-[#0a0a1a]"
            role="dialog"
            aria-modal="true"
            aria-label="Send client update"
          >
            <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-white/10 shrink-0">
              <div className="min-w-0">
                <h3 className="text-white font-semibold text-sm">Send client update</h3>
                <p className="text-white/40 text-xs mt-0.5 truncate">
                  {selectedProject.projectName}
                  {cuLoadingPreview ? " · refreshing preview" : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={cuSending}
                onClick={() => {
                  setShowClientUpdate(false);
                  setCuConfirmClient(false);
                }}
                className="text-white/40 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5 shrink-0"
              >
                Cancel
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[420px]">
                <div className="p-4 sm:p-5 space-y-3.5 border-b lg:border-b-0 lg:border-r border-white/10">
                  {!cuPreflight.ok ? (
                    <p className="pm-client-update__warn text-xs leading-relaxed">
                      {cuPreflight.issues.join(" · ") || "Fix the recipient email before sending."}
                    </p>
                  ) : null}

                  <div className="space-y-3">
                    <p className="text-white/40 text-[11px]">Delivery</p>
                    <div>
                      <label className="block text-white/40 text-[11px] mb-1">To</label>
                      <input
                        className="pm-field"
                        type="email"
                        value={cuTo}
                        onChange={(e) => {
                          const v = e.target.value;
                          setCuTo(v);
                          const ok = Boolean(
                            v.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
                          );
                          setCuPreflight({
                            ok,
                            issues: ok ? [] : ["Client email looks invalid"],
                          });
                          setCuConfirmClient(false);
                        }}
                        placeholder="client@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 text-[11px] mb-1">Subject</label>
                      <input
                        className="pm-field"
                        value={cuSubject}
                        onChange={(e) => {
                          setCuSubjectTouched(true);
                          setCuSubject(e.target.value);
                          setCuConfirmClient(false);
                        }}
                      />
                    </div>
                  </div>

                  {cuDraft ? (
                    <>
                      <div className="pt-1 border-t border-white/10 space-y-3">
                        <p className="text-white/40 text-[11px]">Header</p>
                        <div>
                          <label className="block text-white/40 text-[11px] mb-1">
                            Brand name
                          </label>
                          <input
                            className="pm-field"
                            value={cuDraft.brandName}
                            onChange={(e) => patchCu({ brandName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-white/40 text-[11px] mb-1">
                            Header subtitle
                          </label>
                          <input
                            className="pm-field"
                            value={cuDraft.eyebrow}
                            onChange={(e) => patchCu({ eyebrow: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="pt-1 border-t border-white/10 space-y-3">
                        <p className="text-white/40 text-[11px]">Greeting & project</p>
                        <div>
                          <label className="block text-white/40 text-[11px] mb-1">
                            Greeting name
                          </label>
                          <input
                            className="pm-field"
                            value={cuDraft.clientName}
                            onChange={(e) => patchCu({ clientName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-white/40 text-[11px] mb-1">
                            Project title
                          </label>
                          <input
                            className="pm-field"
                            value={cuDraft.projectName}
                            onChange={(e) => {
                              const projectName = e.target.value;
                              const next = { ...cuDraft, projectName };
                              patchCu({ projectName });
                              syncSubjectFromDraft(next);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-white/40 text-[11px] mb-1">
                            Company line
                          </label>
                          <input
                            className="pm-field"
                            value={cuDraft.companyName}
                            onChange={(e) => patchCu({ companyName: e.target.value })}
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div className="pt-1 border-t border-white/10 space-y-3">
                        <p className="text-white/40 text-[11px]">Status strip</p>
                        <div>
                          <label className="block text-white/40 text-[11px] mb-1">
                            Phase label
                          </label>
                          <input
                            className="pm-field"
                            value={cuDraft.phaseLabel}
                            onChange={(e) => {
                              const phaseLabel = e.target.value;
                              const next = { ...cuDraft, phaseLabel };
                              patchCu({ phaseLabel });
                              syncSubjectFromDraft(next);
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">
                              Phase #
                            </label>
                            <input
                              className="pm-field"
                              type="number"
                              min={1}
                              value={cuDraft.phaseIndex}
                              onChange={(e) =>
                                patchCu({
                                  phaseIndex: Math.max(1, Number(e.target.value) || 1),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">
                              Of total
                            </label>
                            <input
                              className="pm-field"
                              type="number"
                              min={1}
                              value={cuDraft.phaseTotal}
                              onChange={(e) =>
                                patchCu({
                                  phaseTotal: Math.max(1, Number(e.target.value) || 1),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-white/40 text-[11px] mb-1">
                              Progress %
                            </label>
                            <input
                              className="pm-field"
                              type="number"
                              min={0}
                              max={100}
                              value={cuDraft.progress}
                              onChange={(e) => {
                                const progress = Math.max(
                                  0,
                                  Math.min(100, Number(e.target.value) || 0)
                                );
                                const next = { ...cuDraft, progress };
                                patchCu({ progress });
                                syncSubjectFromDraft(next);
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/40 text-[11px] mb-1">
                            As of date
                          </label>
                          <input
                            className="pm-field"
                            value={cuDraft.asOf}
                            onChange={(e) => patchCu({ asOf: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="pt-1 border-t border-white/10 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <label className="block text-white/40 text-[11px] mb-1">
                              Checklist heading
                            </label>
                            <input
                              className="pm-field"
                              value={cuDraft.checklistHeading}
                              onChange={(e) =>
                                patchCu({ checklistHeading: e.target.value })
                              }
                            />
                          </div>
                          <button
                            type="button"
                            className="pm-action-btn text-[11px] mt-5 shrink-0"
                            onClick={() =>
                              patchCu({
                                checklist: [
                                  ...cuDraft.checklist,
                                  { label: "New checklist item", done: false },
                                ],
                              })
                            }
                          >
                            Add item
                          </button>
                        </div>
                        <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
                          {cuDraft.checklist.map((item, idx) => (
                            <li
                              key={`check-${idx}`}
                              className="flex items-start gap-2 border border-white/10 rounded px-2 py-1.5"
                            >
                              <input
                                type="checkbox"
                                className="mt-2"
                                checked={item.done}
                                onChange={(e) => {
                                  const checklist = cuDraft.checklist.map((row, i) =>
                                    i === idx ? { ...row, done: e.target.checked } : row
                                  );
                                  patchCu({ checklist });
                                }}
                              />
                              <input
                                className="pm-field flex-1"
                                value={item.label}
                                onChange={(e) => {
                                  const checklist = cuDraft.checklist.map((row, i) =>
                                    i === idx ? { ...row, label: e.target.value } : row
                                  );
                                  patchCu({ checklist });
                                }}
                              />
                              <button
                                type="button"
                                className="text-[11px] text-white/40 hover:text-white mt-2"
                                onClick={() =>
                                  patchCu({
                                    checklist: cuDraft.checklist.filter((_, i) => i !== idx),
                                  })
                                }
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-1 border-t border-white/10 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <label className="block text-white/40 text-[11px] mb-1">
                              Payments heading
                            </label>
                            <input
                              className="pm-field"
                              value={cuDraft.paymentsHeading}
                              onChange={(e) =>
                                patchCu({ paymentsHeading: e.target.value })
                              }
                            />
                          </div>
                          <button
                            type="button"
                            className="pm-action-btn text-[11px] mt-5 shrink-0"
                            onClick={() =>
                              patchCu({
                                payments: [
                                  ...cuDraft.payments,
                                  { label: "New milestone", status: "pending" },
                                ],
                              })
                            }
                          >
                            Add
                          </button>
                        </div>
                        <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
                          {cuDraft.payments.map((item, idx) => (
                            <li
                              key={`pay-${idx}`}
                              className="flex flex-wrap items-center gap-2 border border-white/10 rounded px-2 py-1.5"
                            >
                              <input
                                className="pm-field flex-1 min-w-[140px]"
                                value={item.label}
                                onChange={(e) => {
                                  const payments = cuDraft.payments.map((row, i) =>
                                    i === idx ? { ...row, label: e.target.value } : row
                                  );
                                  patchCu({ payments });
                                }}
                              />
                              <select
                                className="pm-field w-auto"
                                value={item.status}
                                onChange={(e) => {
                                  const status = e.target.value as
                                    | "paid"
                                    | "pending"
                                    | "due";
                                  const payments = cuDraft.payments.map((row, i) =>
                                    i === idx ? { ...row, status } : row
                                  );
                                  patchCu({ payments });
                                }}
                              >
                                <option value="pending" className="bg-[#0a0a1a]">
                                  Pending
                                </option>
                                <option value="due" className="bg-[#0a0a1a]">
                                  Due
                                </option>
                                <option value="paid" className="bg-[#0a0a1a]">
                                  Paid
                                </option>
                              </select>
                              <button
                                type="button"
                                className="text-[11px] text-white/40 hover:text-white"
                                onClick={() =>
                                  patchCu({
                                    payments: cuDraft.payments.filter((_, i) => i !== idx),
                                  })
                                }
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-1 border-t border-white/10 space-y-3">
                        <p className="text-white/40 text-[11px]">Message block</p>
                        <div>
                          <label className="block text-white/40 text-[11px] mb-1">
                            Message heading
                          </label>
                          <input
                            className="pm-field"
                            value={cuDraft.noteHeading}
                            onChange={(e) => patchCu({ noteHeading: e.target.value })}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <label className="block text-white/40 text-[11px]">
                              Message body
                            </label>
                            <select
                              className="bg-transparent border-0 text-[11px] text-white/45 outline-none cursor-pointer max-w-[160px]"
                              value=""
                              onChange={(e) => {
                                const v = e.target.value;
                                if (!v) return;
                                patchCu({ note: v });
                                e.target.value = "";
                              }}
                            >
                              <option value="" className="bg-[#0a0a1a]">
                                Insert note…
                              </option>
                              {CLIENT_UPDATE_NOTE_CHIPS.map((chip) => (
                                <option key={chip} value={chip} className="bg-[#0a0a1a]">
                                  {chip}
                                </option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            className="pm-field pm-field--area"
                            rows={4}
                            value={cuDraft.note}
                            onChange={(e) => patchCu({ note: e.target.value })}
                            placeholder="Short note for the client…"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-white/35 text-xs">Loading email fields…</p>
                  )}

                  <div className="pt-1 space-y-2">
                    <p className="text-white/30 text-[11px]">
                      From info@vyntechsolutions.ca · test → {cuTestTo || "admin mailbox"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={cuSending || cuLoadingPreview || !cuLiveSnapshot}
                        onClick={() => void sendClientUpdate("test")}
                        className="pm-action-btn text-xs disabled:opacity-50"
                      >
                        {cuSending ? "Sending…" : "Send test to me"}
                      </button>
                      <button
                        type="button"
                        disabled={
                          cuSending || cuLoadingPreview || !cuPreflight.ok || !cuLiveSnapshot
                        }
                        onClick={() => void sendClientUpdate("client")}
                        className="pm-action-btn text-xs disabled:opacity-50"
                      >
                        {cuSending
                          ? "Sending…"
                          : cuConfirmClient
                            ? `Confirm → ${cuTo.trim() || "client"}`
                            : "Send to client"}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-white/40 text-[11px]">Recent sends</p>
                      {cuHistoryTotal > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowClientUpdate(false);
                            setProjectTab("updates");
                          }}
                          className="text-[10px] text-white/40 hover:text-white/70"
                        >
                          Full record ({cuHistoryTotal})
                        </button>
                      ) : null}
                    </div>
                    {cuHistory.length === 0 ? (
                      <p className="text-white/30 text-xs">None sent yet for this project.</p>
                    ) : (
                      <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {cuHistory.slice(0, 8).map((row) => (
                          <li
                            key={row.id}
                            className="flex items-start justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="text-white/75 truncate">{row.subject}</p>
                              <p className="text-white/30 text-[10px] mt-0.5 truncate">
                                {new Date(row.createdAt).toLocaleString()} · {row.sentTo}
                                {row.status === "failed" ? " · failed" : ""}
                                {row.kind === "test" ? " · test" : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => void openClientUpdateRecord(row.id)}
                                className="text-[11px] text-white/60 hover:text-white"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                disabled={cuSending}
                                onClick={() =>
                                  void openClientUpdateModal({
                                    subject: row.subject,
                                    note: row.messageNote || "",
                                    to: row.kind === "client" ? row.sentTo : cuTo,
                                  })
                                }
                                className="text-[11px] text-white/45 hover:text-white"
                              >
                                Reuse
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="pm-client-update__preview-pane p-4 sm:p-5 flex flex-col min-h-[280px] bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
                    <p className="text-white/40 text-[11px]">Email preview</p>
                    <p className="text-white/30 text-[10px]">
                      {cuLoadingPreview ? "Loading…" : "Live"}
                    </p>
                  </div>
                  <div className="pm-client-update__preview flex-1 border border-white/10 overflow-hidden min-h-[260px]">
                    {cuHtml ? (
                      <iframe
                        title="Client update preview"
                        className="w-full h-full min-h-[320px] border-0 bg-white"
                        sandbox=""
                        srcDoc={cuHtml}
                      />
                    ) : (
                      <div className="h-full min-h-[260px] flex items-center justify-center text-white/40 text-sm">
                        {cuLoadingPreview ? "Loading…" : "Preview will appear here"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showCuView ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-black/70"
          onClick={() => {
            setShowCuView(false);
            setCuViewRecord(null);
          }}
        >
          <div
            className="pm-client-update w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col rounded-lg border border-white/10 bg-[#0a0a1a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/10 shrink-0">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {cuViewRecord?.subject || (cuViewLoading ? "Loading…" : "Sent email")}
                </p>
                {cuViewRecord ? (
                  <p className="text-white/40 text-[11px] mt-1 truncate">
                    {new Date(cuViewRecord.createdAt).toLocaleString()} · To {cuViewRecord.sentTo}
                    {cuViewRecord.kind === "test" ? " · test" : " · client"}
                    {cuViewRecord.status === "failed" ? " · failed" : " · sent"}
                    {cuViewRecord.sentBy ? ` · ${cuViewRecord.sentBy}` : ""}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCuView(false);
                  setCuViewRecord(null);
                }}
                className="text-white/40 hover:text-white text-lg leading-none px-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-3 sm:p-4">
              {cuViewLoading ? (
                <div className="h-[360px] flex items-center justify-center text-white/40 text-sm">
                  Loading email…
                </div>
              ) : cuViewRecord?.html ? (
                <iframe
                  title="Sent client update"
                  className="w-full min-h-[420px] h-[60vh] border border-white/10 bg-white rounded"
                  sandbox=""
                  srcDoc={cuViewRecord.html}
                />
              ) : (
                <div className="h-[280px] flex items-center justify-center text-white/40 text-sm">
                  Could not load this email.
                </div>
              )}
            </div>
            {cuViewRecord ? (
              <div className="px-4 sm:px-5 py-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <p className="text-white/30 text-[10px] truncate max-w-[60%]">
                  {cuViewRecord.bccTo ? `BCC ${cuViewRecord.bccTo}` : "No BCC"}
                  {cuViewRecord.errorMessage ? ` · ${cuViewRecord.errorMessage}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const note = cuViewRecord.messageNote || "";
                    const subject = cuViewRecord.subject;
                    const to =
                      cuViewRecord.kind === "client" ? cuViewRecord.sentTo : undefined;
                    setShowCuView(false);
                    setCuViewRecord(null);
                    void openClientUpdateModal({ subject, note, to });
                  }}
                  className="text-[11px] text-white/60 hover:text-white"
                >
                  Reuse as draft
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
