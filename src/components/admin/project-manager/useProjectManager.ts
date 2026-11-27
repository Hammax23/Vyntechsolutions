"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  PIPELINE_PHASES,
  normalizeProjectStatus,
  parsePhaseGates,
  phaseCheckProgress,
  phaseLabel,
  type ProjectPhase,
} from "@/lib/admin/project-workflow";
import {
  buildClientUpdateHtml,
  buildClientUpdateSubject,
  type ClientUpdateSnapshot,
} from "@/lib/admin/project-client-update-email";
import { getClientUpdateTemplate } from "@/lib/admin/project-client-update-templates";
import { todayKey } from "@/lib/workflow-progress";
import { computePmBoardStats } from "./PmPipelineBoard";
import {
  WORKFLOW_PROJECT_STORAGE_KEY,
  type AdminProject,
  type ClientUpdateHistoryItem,
  type ClientUpdateViewRecord,
  type LinkedWorkflowTask,
  type ListViewMode,
  type Payment,
  type ProjectTab,
  type StaffOption,
  type Task,
} from "./types";
import { formatProject } from "./pm-helpers";

export type UseProjectManagerProps = {
  refreshKey?: number;
  onLoaded?: (count: number) => void;
  onOpenClientInvoice?: (invoiceId: string) => void;
  onOpenTeamProgress?: (projectId: string) => void;
};

export function useProjectManager({
  refreshKey = 0,
  onLoaded,
  onOpenClientInvoice,
  onOpenTeamProgress,
}: UseProjectManagerProps) {
  const reduceMotion = useReducedMotion();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listViewMode, setListViewMode] = useState<ListViewMode>("list");
  const [stuckOnly, setStuckOnly] = useState(false);
  const [mobilePane, setMobilePane] = useState<"list" | "detail">("list");
  const [projectTab, setProjectTab] = useState<ProjectTab>("workflow");
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
      const phase = normalizeProjectStatus(selectedProject.status);
      const incomplete = (selectedProject.phaseChecks || []).filter(
        (c) => c.phase === phase && !c.done
      ).length;
      const checklistHint =
        incomplete > 0
          ? `\n\n${incomplete} checklist item${incomplete === 1 ? "" : "s"} still incomplete for ${phaseLabel(phase)}.`
          : "";
      const ok = window.confirm(
        `${data.error}${checklistHint}\n\nForce advance anyway? This skips gate and checklist rules.`
      );
      if (ok) return patchProject(body, { force: true });
    }
    setMessage(data.error || "Update failed");
    return false;
  }
  if (data.project) applyProject(formatProject(data.project));
  return true;
  };

  const [pendingPhaseChange, setPendingPhaseChange] = useState<ProjectPhase | null>(null);
  const [confirmingPhase, setConfirmingPhase] = useState(false);

  /** UI entry point — never applies phase instantly; opens confirm modal. */
  const requestStatusChange = (status: ProjectPhase) => {
    if (!selectedProject) return;
    const next = normalizeProjectStatus(status);
    const current = normalizeProjectStatus(selectedProject.status);
    if (next === current) return;
    setPendingPhaseChange(next);
  };

  const cancelPendingStatusChange = () => {
    if (confirmingPhase) return;
    setPendingPhaseChange(null);
  };

  const confirmPendingStatusChange = async () => {
    if (!pendingPhaseChange) return;
    setConfirmingPhase(true);
    const ok = await patchProject({ status: pendingPhaseChange });
    setConfirmingPhase(false);
    if (ok) {
      setPendingPhaseChange(null);
      setMessage(`Phase set to ${phaseLabel(pendingPhaseChange)}`);
    }
  };

  /** Direct apply — Workflow “advance” / internal only. Prefer requestStatusChange in UI. */
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
  setPendingPhaseChange(null);
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
  const tpl = getClientUpdateTemplate(normalizeProjectStatus(selectedProject.status));
  setShowClientUpdate(true);
  setCuConfirmClient(false);
  setCuSubjectTouched(Boolean(prefill?.subject));
  setCuSubject(prefill?.subject ?? tpl.subjectHint);
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

const addChecklistItem = async (label: string) => {
  if (!selectedProject) return false;
  const trimmed = label.trim();
  if (!trimmed) {
    setMessage("Checklist label required");
    return false;
  }
  const res = await fetch("/api/admin/projects/phase-checks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: selectedProject.id,
      phase: selectedProject.status,
      label: trimmed,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    setMessage(data.error || "Failed to add checklist item");
    return false;
  }
  if (data.project) applyProject(formatProject(data.project));
  setMessage("Checklist item added");
  return true;
};

const renameChecklistItem = async (checkId: string, label: string) => {
  const trimmed = label.trim();
  if (!trimmed) {
    setMessage("Label cannot be empty");
    return false;
  }
  const res = await fetch("/api/admin/projects/phase-checks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: checkId, label: trimmed }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    setMessage(data.error || "Failed to rename item");
    return false;
  }
  if (data.project) applyProject(formatProject(data.project));
  return true;
};

const deleteChecklistItem = async (checkId: string) => {
  if (!window.confirm("Remove this checklist item?")) return false;
  const res = await fetch(`/api/admin/projects/phase-checks?id=${checkId}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    setMessage(data.error || "Failed to delete item");
    return false;
  }
  if (data.project) applyProject(formatProject(data.project));
  setMessage("Checklist item removed");
  return true;
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

const advanceToNextPhase = async () => {
  if (!selectedProject) return;
  const idx = PIPELINE_PHASES.indexOf(selectedProject.status);
  if (idx < 0 || idx >= PIPELINE_PHASES.length - 1) return;
  const next = PIPELINE_PHASES[idx + 1];
  const incomplete = (selectedProject.phaseChecks || []).filter(
    (c) => c.phase === selectedProject.status && !c.done
  ).length;
  if (
    incomplete > 0 &&
    !window.confirm(
      `${incomplete} checklist item(s) still open on ${phaseLabel(
        selectedProject.status
      )}. Advance to ${phaseLabel(next)} anyway?`
    )
  ) {
    return;
  }
  const ok = await patchProject({ status: next });
  if (ok) setMessage(`Advanced to ${phaseLabel(next)}`);
};

const syncSpentFromPayments = async () => {
  if (!selectedProject) return;
  const paidSum = (selectedProject.payments || [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const ok = await patchProject({ spent: Math.round(paidSum * 100) / 100 });
  if (ok) setMessage(`Spent synced to $${paidSum.toLocaleString()} (paid milestones)`);
};

const openInTeamProgress = () => {
  if (!selectedId) return;
  try {
    sessionStorage.setItem(WORKFLOW_PROJECT_STORAGE_KEY, selectedId);
  } catch {
    /* ignore */
  }
  onOpenTeamProgress?.(selectedId);
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
}, [selectedId, projectTab, loadPaymentInvoices, refreshKey]);

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
  const pay = selectedProject?.payments?.find((p) => p.id === paymentId);
  const inv =
    pay?.billingInvoice ||
    (paymentInvoices[paymentId]
      ? {
          id: paymentInvoices[paymentId].id,
          invoiceNumber: paymentInvoices[paymentId].invoiceNumber,
          status: paymentInvoices[paymentId].status,
          paidAt: null,
          dueDate: null,
        }
      : null);
  if (status !== "paid" && inv?.status === "paid") {
    window.alert(
      `Cannot undo paid while invoice ${inv.invoiceNumber} is Paid. Adjust the invoice first.`
    );
    return;
  }
  const res = await fetch("/api/admin/projects/payments", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: paymentId, status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    setMessage(data.error || "Could not update payment");
    return;
  }
  if (data.project) applyProject(formatProject(data.project));
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

const deleteNote = async (noteId: string) => {
  if (!window.confirm("Delete this note?")) return;
  const res = await fetch(`/api/admin/projects/notes?id=${encodeURIComponent(noteId)}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    setMessage(data.error || "Could not delete note");
    return;
  }
  if (selectedProject) {
    applyProject({
      ...selectedProject,
      notes: selectedProject.notes.filter((n) => n.id !== noteId),
    });
  }
  setMessage("Note deleted");
};

const gates = parsePhaseGates(selectedProject?.phaseGates);
const currentPhase = selectedProject
  ? normalizeProjectStatus(selectedProject.status)
  : "discovery";
const phaseChecks = selectedProject?.phaseChecks || [];
const currentChecks = phaseChecks.filter((c) => c.phase === currentPhase);
const checkProg = phaseCheckProgress(phaseChecks, currentPhase);
const clientUpdateTpl = getClientUpdateTemplate(currentPhase);
const paidSumForProject = (selectedProject?.payments || [])
  .filter((p) => p.status === "paid")
  .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

const inProgressCount = projects.filter(
  (p) => !["completed", "on_hold"].includes(p.status)
).length;
const completedCount = projects.filter((p) => p.status === "completed").length;
const onHoldCount = projects.filter((p) => p.status === "on_hold").length;
const boardStats = useMemo(() => computePmBoardStats(projects), [projects]);

const stats = [
  { label: "Total", value: projects.length },
  { label: "In progress", value: inProgressCount },
  { label: "Completed", value: completedCount },
  { label: "On hold", value: onHoldCount },
  { label: "Stuck at gate", value: boardStats.stuck },
];

  return {
    reduceMotion,
    projects,
    setProjects,
    selectedId,
    setSelectedId,
    listViewMode,
    setListViewMode,
    stuckOnly,
    setStuckOnly,
    mobilePane,
    setMobilePane,
    projectTab,
    setProjectTab,
    loading,
    setLoading,
    message,
    setMessage,
    signOffNote,
    setSignOffNote,
    staffOptions,
    setStaffOptions,
    teamMemberIds,
    setTeamMemberIds,
    teamDraftIds,
    setTeamDraftIds,
    linkedWfTasks,
    setLinkedWfTasks,
    loadingTeam,
    setLoadingTeam,
    savingTeam,
    setSavingTeam,
    assigningWork,
    setAssigningWork,
    assignWork,
    setAssignWork,
    showClientUpdate,
    setShowClientUpdate,
    cuTo,
    setCuTo,
    cuSubject,
    setCuSubject,
    cuDraft,
    setCuDraft,
    cuSubjectTouched,
    setCuSubjectTouched,
    cuTestTo,
    setCuTestTo,
    cuPreflight,
    setCuPreflight,
    cuHistory,
    setCuHistory,
    cuHistoryTotal,
    setCuHistoryTotal,
    cuLoadingPreview,
    setCuLoadingPreview,
    cuSending,
    setCuSending,
    cuConfirmClient,
    setCuConfirmClient,
    showCuView,
    setShowCuView,
    cuViewLoading,
    setCuViewLoading,
    cuViewRecord,
    setCuViewRecord,
    showAddTask,
    setShowAddTask,
    showAddNote,
    setShowAddNote,
    showAddMilestone,
    setShowAddMilestone,
    showNewProject,
    setShowNewProject,
    creating,
    setCreating,
    showAddPayment,
    setShowAddPayment,
    editingPaymentId,
    setEditingPaymentId,
    paymentInvoices,
    setPaymentInvoices,
    motionDuration,
    stagger,
    selectProject,
    paymentForm,
    setPaymentForm,
    emptyNewProject,
    newProject,
    setNewProject,
    logoFile,
    setLogoFile,
    logoPreview,
    setLogoPreview,
    uploadingLogo,
    setUploadingLogo,
    editingDetails,
    setEditingDetails,
    savingDetails,
    setSavingDetails,
    editForm,
    setEditForm,
    newTask,
    setNewTask,
    newNote,
    setNewNote,
    newMilestone,
    setNewMilestone,
    clearLogoPick,
    pickLogoFile,
    selectedProject,
    applyProject,
    loadProjects,
    patchProject,
    updateStatus,
    requestStatusChange,
    pendingPhaseChange,
    confirmingPhase,
    cancelPendingStatusChange,
    confirmPendingStatusChange,
    updatePriority,
    startEditDetails,
    saveProjectDetails,
    loadStaffOptions,
    loadProjectTeamBundle,
    refreshLinkedWfTasks,
    saveProjectTeam,
    assignProjectWork,
    loadClientUpdateHistory,
    openClientUpdateRecord,
    loadClientUpdatePreview,
    patchCu,
    cuLiveSnapshot,
    cuHtml,
    openClientUpdateModal,
    syncSubjectFromDraft,
    sendClientUpdate,
    assignStaffChoices,
    createProject,
    updateCompanyLogo,
    deleteProject,
    toggleCheck,
    addChecklistItem,
    renameChecklistItem,
    deleteChecklistItem,
    signOffPhase,
    advanceToNextPhase,
    syncSpentFromPayments,
    openInTeamProgress,
    loadPaymentInvoices,
    jumpToClientInvoice,
    createInvoiceFromPayment,
    markPayment,
    resetPaymentForm,
    startEditPayment,
    savePaymentMilestone,
    deletePayment,
    paymentPercentTotal,
    addTask,
    updateTaskStatus,
    deleteTask,
    addMilestone,
    toggleMilestone,
    addNote,
    deleteNote,
    gates,
    currentPhase,
    phaseChecks,
    currentChecks,
    checkProg,
    clientUpdateTpl,
    paidSumForProject,
    inProgressCount,
    completedCount,
    onHoldCount,
    boardStats,
    stats,
    onOpenClientInvoice,
    onOpenTeamProgress,
  };
}

export type ProjectManagerApi = ReturnType<typeof useProjectManager>;
