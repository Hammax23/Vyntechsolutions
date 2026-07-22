"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import VynTechLogo from "@/components/VynTechLogo";

const OfferLetterSection = dynamic(() => import("@/components/admin/OfferLetterSection"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-white/40 text-sm">Loading offer letter generator...</div>
  ),
});

interface QuoteSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyUrl: string;
  services: string[];
  projectDetails: string;
  hearAbout: string;
  submittedAt: string;
  status: "new" | "contacted" | "in_progress" | "completed" | "cancelled";
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  assignee: string;
  createdAt: string;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: string;
}

interface Project {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string;
  projectName: string;
  description: string;
  services: string[];
  status: "discovery" | "design" | "development" | "testing" | "launch" | "completed" | "on_hold";
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
  createdAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loginStep, setLoginStep] = useState<"credentials" | "2fa">("credentials");
  const [twoFACode, setTwoFACode] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [submissions, setSubmissions] = useState<QuoteSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<QuoteSubmission | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "new" | "in_progress" | "completed">("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<"quotes" | "projects" | "careers" | "offer_letters">("quotes");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTab, setProjectTab] = useState<"overview" | "tasks" | "timeline" | "notes" | "activity">("overview");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as Task["priority"], dueDate: "", assignee: "" });
  const [newNote, setNewNote] = useState("");
  const [newMilestone, setNewMilestone] = useState({ title: "", dueDate: "" });
  const [convertData, setConvertData] = useState({ projectName: "", budget: "", deadline: "", startDate: "" });
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    experience: "",
    salary: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    const authToken = sessionStorage.getItem("adminAuth");
    if (authToken === "authenticated") {
      setIsAuthenticated(true);
      fetchSubmissions();
      loadProjects();
      loadJobPositions();
    }
    setIsLoading(false);
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects");
      if (response.ok) {
        const data = await response.json();
        const formattedProjects = (data.projects || []).map((p: any) => ({
          ...p,
          startDate: p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "",
          deadline: p.deadline ? new Date(p.deadline).toISOString().split("T")[0] : "",
          tasks: p.tasks || [],
          milestones: p.milestones || [],
          notes: p.notes || [],
          activityLog: p.activityLogs || [],
        }));
        setProjects(formattedProjects);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadJobPositions = async () => {
    try {
      const response = await fetch("/api/admin/careers");
      if (response.ok) {
        const data = await response.json();
        setJobPositions(data.positions || []);
      }
    } catch (error) {
      console.error("Error loading job positions:", error);
    }
  };

  const addJobPosition = async () => {
    if (!newPosition.title || !newPosition.department || !newPosition.location || !newPosition.experience || !newPosition.description) return;
    try {
      const response = await fetch("/api/admin/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPosition),
      });
      if (response.ok) {
        loadJobPositions();
        setShowAddPosition(false);
        setNewPosition({ title: "", department: "", location: "", type: "Full-time", experience: "", salary: "", description: "", isActive: true });
      }
    } catch (error) {
      console.error("Error adding job position:", error);
    }
  };

  const updateJobPosition = async (id: string, data: Partial<JobPosition>) => {
    try {
      const response = await fetch("/api/admin/careers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (response.ok) {
        loadJobPositions();
        if (selectedPosition?.id === id) {
          setSelectedPosition({ ...selectedPosition, ...data });
        }
      }
    } catch (error) {
      console.error("Error updating job position:", error);
    }
  };

  const deleteJobPosition = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return;
    try {
      const response = await fetch(`/api/admin/careers?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        loadJobPositions();
        if (selectedPosition?.id === id) setSelectedPosition(null);
      }
    } catch (error) {
      console.error("Error deleting job position:", error);
    }
  };

  const convertToProject = async (submission: QuoteSubmission) => {
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: convertData.projectName || `${submission.companyName || submission.fullName} Project`,
          description: submission.projectDetails,
          clientName: submission.fullName,
          clientEmail: submission.email,
          clientPhone: submission.phone,
          companyName: submission.companyName,
          services: submission.services,
          budget: parseFloat(convertData.budget) || 0,
          startDate: convertData.startDate || null,
          deadline: convertData.deadline || null,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        updateStatus(submission.id, "in_progress");
        setShowConvertModal(false);
        setConvertData({ projectName: "", budget: "", deadline: "", startDate: "" });
        loadProjects();
        setActiveSection("projects");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const addTask = async () => {
    if (!selectedProject || !newTask.title) return;
    try {
      const response = await fetch("/api/admin/projects/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.dueDate || null,
          assignee: newTask.assignee,
        }),
      });
      if (response.ok) {
        loadProjects();
        setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" });
        setShowAddTask(false);
        // Reload selected project
        const projResponse = await fetch("/api/admin/projects");
        if (projResponse.ok) {
          const data = await projResponse.json();
          const updated = data.projects.find((p: any) => p.id === selectedProject.id);
          if (updated) {
            setSelectedProject({ ...updated, startDate: updated.startDate ? new Date(updated.startDate).toISOString().split("T")[0] : "", deadline: updated.deadline ? new Date(updated.deadline).toISOString().split("T")[0] : "", activityLog: updated.activityLogs || [] });
          }
        }
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    if (!selectedProject) return;
    try {
      const response = await fetch("/api/admin/projects/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status }),
      });
      if (response.ok) {
        loadProjects();
        const projResponse = await fetch("/api/admin/projects");
        if (projResponse.ok) {
          const data = await projResponse.json();
          const updated = data.projects.find((p: any) => p.id === selectedProject.id);
          if (updated) {
            setSelectedProject({ ...updated, startDate: updated.startDate ? new Date(updated.startDate).toISOString().split("T")[0] : "", deadline: updated.deadline ? new Date(updated.deadline).toISOString().split("T")[0] : "", activityLog: updated.activityLogs || [] });
          }
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!selectedProject) return;
    try {
      const response = await fetch(`/api/admin/projects/tasks?id=${taskId}`, { method: "DELETE" });
      if (response.ok) {
        loadProjects();
        const projResponse = await fetch("/api/admin/projects");
        if (projResponse.ok) {
          const data = await projResponse.json();
          const updated = data.projects.find((p: any) => p.id === selectedProject.id);
          if (updated) {
            setSelectedProject({ ...updated, startDate: updated.startDate ? new Date(updated.startDate).toISOString().split("T")[0] : "", deadline: updated.deadline ? new Date(updated.deadline).toISOString().split("T")[0] : "", activityLog: updated.activityLogs || [] });
          }
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const addMilestone = async () => {
    if (!selectedProject || !newMilestone.title) return;
    try {
      const response = await fetch("/api/admin/projects/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          title: newMilestone.title,
          dueDate: newMilestone.dueDate || null,
        }),
      });
      if (response.ok) {
        loadProjects();
        setNewMilestone({ title: "", dueDate: "" });
        setShowAddMilestone(false);
        const projResponse = await fetch("/api/admin/projects");
        if (projResponse.ok) {
          const data = await projResponse.json();
          const updated = data.projects.find((p: any) => p.id === selectedProject.id);
          if (updated) {
            setSelectedProject({ ...updated, startDate: updated.startDate ? new Date(updated.startDate).toISOString().split("T")[0] : "", deadline: updated.deadline ? new Date(updated.deadline).toISOString().split("T")[0] : "", activityLog: updated.activityLogs || [] });
          }
        }
      }
    } catch (error) {
      console.error("Error adding milestone:", error);
    }
  };

  const toggleMilestone = async (milestoneId: string) => {
    if (!selectedProject) return;
    const milestone = selectedProject.milestones.find((m) => m.id === milestoneId);
    try {
      const response = await fetch("/api/admin/projects/milestones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: milestoneId, completed: !milestone?.completed }),
      });
      if (response.ok) {
        loadProjects();
        const projResponse = await fetch("/api/admin/projects");
        if (projResponse.ok) {
          const data = await projResponse.json();
          const updated = data.projects.find((p: any) => p.id === selectedProject.id);
          if (updated) {
            setSelectedProject({ ...updated, startDate: updated.startDate ? new Date(updated.startDate).toISOString().split("T")[0] : "", deadline: updated.deadline ? new Date(updated.deadline).toISOString().split("T")[0] : "", activityLog: updated.activityLogs || [] });
          }
        }
      }
    } catch (error) {
      console.error("Error toggling milestone:", error);
    }
  };

  const addNote = async () => {
    if (!selectedProject || !newNote.trim()) return;
    try {
      const response = await fetch("/api/admin/projects/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject.id, content: newNote }),
      });
      if (response.ok) {
        loadProjects();
        setNewNote("");
        setShowAddNote(false);
        const projResponse = await fetch("/api/admin/projects");
        if (projResponse.ok) {
          const data = await projResponse.json();
          const updated = data.projects.find((p: any) => p.id === selectedProject.id);
          if (updated) {
            setSelectedProject({ ...updated, startDate: updated.startDate ? new Date(updated.startDate).toISOString().split("T")[0] : "", deadline: updated.deadline ? new Date(updated.deadline).toISOString().split("T")[0] : "", activityLog: updated.activityLogs || [] });
          }
        }
      }
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const updateProjectStatus = async (status: Project["status"]) => {
    if (!selectedProject) return;
    try {
      const response = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedProject.id, status }),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedProject({ ...data.project, startDate: data.project.startDate ? new Date(data.project.startDate).toISOString().split("T")[0] : "", deadline: data.project.deadline ? new Date(data.project.deadline).toISOString().split("T")[0] : "", activityLog: data.project.activityLogs || [] });
        loadProjects();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateProjectPriority = async (priority: Project["priority"]) => {
    if (!selectedProject) return;
    try {
      const response = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedProject.id, priority }),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedProject({ ...data.project, startDate: data.project.startDate ? new Date(data.project.startDate).toISOString().split("T")[0] : "", deadline: data.project.deadline ? new Date(data.project.deadline).toISOString().split("T")[0] : "", activityLog: data.project.activityLogs || [] });
        loadProjects();
      }
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  const updateProjectBudget = async (field: "budget" | "spent", value: number) => {
    if (!selectedProject) return;
    try {
      const response = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedProject.id, [field]: value }),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedProject({ ...data.project, startDate: data.project.startDate ? new Date(data.project.startDate).toISOString().split("T")[0] : "", deadline: data.project.deadline ? new Date(data.project.deadline).toISOString().split("T")[0] : "", activityLog: data.project.activityLogs || [] });
        loadProjects();
      }
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/admin/projects?id=${projectId}`, { method: "DELETE" });
      if (response.ok) {
        loadProjects();
        setSelectedProject(null);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/admin/submissions");
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      if (loginStep === "credentials") {
        const response = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, step: "login" }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Login failed");
          setIsLoggingIn(false);
          return;
        }

        if (data.devCode) {
          setError(`Dev mode: your 2FA code is ${data.devCode}`);
        }
        
        setLoginStep("2fa");
        setIsLoggingIn(false);
      } else {
        const response = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: twoFACode, step: "verify" }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Verification failed");
          setIsLoggingIn(false);
          return;
        }
        
        sessionStorage.setItem("adminAuth", "authenticated");
        setIsAuthenticated(true);
        fetchSubmissions();
        loadProjects();
        loadJobPositions();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    setTwoFACode("");
    setLoginStep("credentials");
  };

  const updateStatus = async (id: string, status: QuoteSubmission["status"]) => {
    try {
      const response = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        setSubmissions((prev) => prev.map((sub) => (sub.id === id ? { ...sub, status } : sub)));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status });
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeTab === "all") return true;
    if (activeTab === "new") return sub.status === "new";
    if (activeTab === "in_progress") return sub.status === "in_progress" || sub.status === "contacted";
    if (activeTab === "completed") return sub.status === "completed" || sub.status === "cancelled";
    return true;
  });

  const getStatusStyle = (status: QuoteSubmission["status"]) => {
    const styles: Record<string, string> = {
      new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      contacted: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      in_progress: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getProjectStatusStyle = (status: Project["status"]) => {
    const styles: Record<string, string> = {
      discovery: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      design: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      development: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      testing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      launch: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      on_hold: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getPriorityStyle = (priority: string) => {
    const styles: Record<string, string> = {
      low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      high: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      critical: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return styles[priority] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getTaskStatusStyle = (status: Task["status"]) => {
    const styles: Record<string, string> = {
      pending: "bg-slate-500/20 text-slate-400",
      in_progress: "bg-amber-500/20 text-amber-400",
      completed: "bg-emerald-500/20 text-emerald-400",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#0055FF]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#00B4FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#0055FF]/20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#00B4FF]/15 rounded-full blur-[150px] animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-6">
            <VynTechLogo className="scale-110 cursor-default" />
          </div>

          <div className="bg-[#0a0a1a]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {loginStep === "credentials" ? "Admin Login" : "Verify Identity"}
              </h2>
              <p className="text-white/40 text-sm mt-1">
                {loginStep === "credentials" 
                  ? "Enter your credentials" 
                  : "Check your email for the code"}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginStep === "credentials" ? (
                <>
                  <div>
                    <label className="block text-white/50 text-xs font-medium mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@vyntechsolutions.ca"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-white/25 focus:border-[#00B4FF]/50 focus:bg-white/[0.05] transition-all outline-none text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-medium mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-12 pr-12 py-3.5 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-white/25 focus:border-[#00B4FF]/50 focus:bg-white/[0.05] transition-all outline-none text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-2 text-center">Enter 6-Digit Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-white/25 focus:border-[#00B4FF]/50 focus:bg-white/[0.05] transition-all outline-none text-center text-2xl tracking-[0.5em] font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-white/30 text-xs mt-3 text-center">Sent to {email}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#0055FF] to-[#00B4FF] text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loginStep === "credentials" ? "Sending Code..." : "Verifying..."}
                  </span>
                ) : (
                  loginStep === "credentials" ? "Continue" : "Verify & Login"
                )}
              </button>

              {loginStep === "2fa" && (
                <button
                  type="button"
                  onClick={() => { setLoginStep("credentials"); setTwoFACode(""); setError(""); }}
                  className="w-full py-2 text-white/40 hover:text-white text-sm transition-colors"
                >
                  ← Back to login
                </button>
              )}
            </form>

            <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#00B4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-white/30 text-xs">2FA Protected</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-[#030014] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#0a0a1a]/80 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 fixed h-full z-40`}>
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center">
            <VynTechLogo className={`cursor-default ${sidebarOpen ? "scale-90 -ml-2" : "scale-75 -ml-4"}`} />
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button onClick={() => { setActiveSection("quotes"); setSelectedProject(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "quotes" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            <svg className={`w-5 h-5 ${activeSection === "quotes" ? "text-[#00B4FF]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Quote Requests</span>}
          </button>
          <button onClick={() => { setActiveSection("projects"); setSelectedSubmission(null); setSelectedPosition(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "projects" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            <svg className={`w-5 h-5 ${activeSection === "projects" ? "text-[#00B4FF]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Project Manager</span>}
          </button>
          <button onClick={() => { setActiveSection("careers"); setSelectedSubmission(null); setSelectedProject(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "careers" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            <svg className={`w-5 h-5 ${activeSection === "careers" ? "text-[#00B4FF]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Careers</span>}
          </button>
          <button onClick={() => { setActiveSection("offer_letters"); setSelectedSubmission(null); setSelectedProject(null); setSelectedPosition(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "offer_letters" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            <svg className={`w-5 h-5 ${activeSection === "offer_letters" ? "text-[#00B4FF]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Offer Letters</span>}
          </button>
        </nav>

        <div className="p-3 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#030014]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {activeSection === "quotes"
                    ? "Quote Requests"
                    : activeSection === "projects"
                      ? "Project Manager"
                      : activeSection === "careers"
                        ? "Careers"
                        : "Offer Letters"}
                </h2>
                <p className="text-white/40 text-xs">
                  {activeSection === "quotes"
                    ? "Manage incoming leads"
                    : activeSection === "projects"
                      ? "Enterprise project management"
                      : activeSection === "careers"
                        ? "Manage job openings"
                        : "Generate client & internal quotation PDFs"}
                </p>
              </div>
            </div>
            <button onClick={activeSection === "quotes" ? fetchSubmissions : activeSection === "projects" ? loadProjects : loadJobPositions} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all" title="Refresh">
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </header>

        <div className="p-6">
          {activeSection === "quotes" && (
          <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total", value: submissions.length, color: "blue", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "New", value: submissions.filter((s) => s.status === "new").length, color: "emerald", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
              { label: "In Progress", value: submissions.filter((s) => s.status === "in_progress" || s.status === "contacted").length, color: "amber", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Completed", value: submissions.filter((s) => s.status === "completed").length, color: "violet", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center mb-3`}>
                  <svg className={`w-5 h-5 text-${stat.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
                <p className="text-white/50 text-xs font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All" },
              { id: "new", label: "New" },
              { id: "in_progress", label: "In Progress" },
              { id: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? "bg-[#0055FF] text-white" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* List */}
            <div className="xl:col-span-1 bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-white font-semibold text-sm">Submissions</h3>
              </div>
              <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-white/40 text-sm">No submissions</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        className={`p-4 cursor-pointer transition-all hover:bg-white/[0.03] ${selectedSubmission?.id === sub.id ? "bg-[#0055FF]/10 border-l-2 border-[#00B4FF]" : ""}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#0055FF]/30 to-[#00B4FF]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-[#00B4FF] font-bold text-sm">{sub.fullName.charAt(0)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-medium text-sm truncate">{sub.fullName}</h4>
                            <p className="text-white/40 text-xs truncate">{sub.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusStyle(sub.status)}`}>
                            {sub.status.replace("_", " ")}
                          </span>
                          <span className="text-white/30 text-[10px]">
                            {new Date(sub.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Detail */}
            <div className="xl:col-span-2">
              {selectedSubmission ? (
                <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#0055FF]/10 to-transparent p-5 border-b border-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#0055FF] to-[#00B4FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#0055FF]/20">
                          <span className="text-2xl font-bold text-white">{selectedSubmission.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">{selectedSubmission.fullName}</h2>
                          <p className="text-white/50 text-sm">{selectedSubmission.companyName || "Individual"}</p>
                        </div>
                      </div>
                      <select
                        value={selectedSubmission.status}
                        onChange={(e) => updateStatus(selectedSubmission.id, e.target.value as QuoteSubmission["status"])}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#00B4FF]/50 outline-none cursor-pointer"
                      >
                        <option value="new" className="bg-[#0a0a1a]">New</option>
                        <option value="contacted" className="bg-[#0a0a1a]">Contacted</option>
                        <option value="in_progress" className="bg-[#0a0a1a]">In Progress</option>
                        <option value="completed" className="bg-[#0a0a1a]">Completed</option>
                        <option value="cancelled" className="bg-[#0a0a1a]">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <a href={`mailto:${selectedSubmission.email}`} className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg p-4 transition-all">
                        <div className="w-10 h-10 bg-[#0055FF]/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#00B4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white/40 text-xs">Email</p>
                          <p className="text-[#00B4FF] text-sm font-medium truncate">{selectedSubmission.email}</p>
                        </div>
                      </a>
                      <a href={`tel:${selectedSubmission.phone}`} className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg p-4 transition-all">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white/40 text-xs">Phone</p>
                          <p className="text-emerald-400 text-sm font-medium">{selectedSubmission.phone}</p>
                        </div>
                      </a>
                    </div>

                    {selectedSubmission.companyUrl && (
                      <a href={selectedSubmission.companyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-lg p-4">
                        <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white/40 text-xs">Website</p>
                          <p className="text-violet-400 text-sm font-medium truncate">{selectedSubmission.companyUrl}</p>
                        </div>
                      </a>
                    )}

                    {/* Services */}
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">Services</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSubmission.services.map((service, i) => (
                          <span key={i} className="bg-[#0055FF]/20 text-[#00B4FF] border border-[#0055FF]/30 px-3 py-1.5 rounded-lg text-xs font-medium">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">Project Details</p>
                      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4">
                        <p className="text-white/70 text-sm whitespace-pre-wrap">{selectedSubmission.projectDetails || "No details provided"}</p>
                      </div>
                    </div>

                    {selectedSubmission.hearAbout && (
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-2">How They Found Us</p>
                        <p className="text-white/60 text-sm">{selectedSubmission.hearAbout}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <p className="text-white/30 text-xs">
                        {new Date(selectedSubmission.submittedAt).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowConvertModal(true)} className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
                          Convert to Project
                        </button>
                        <a href={`mailto:${selectedSubmission.email}`} className="px-4 py-2 bg-[#0055FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF] transition-colors">
                          Email
                        </a>
                        <a href={`tel:${selectedSubmission.phone}`} className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors">
                          Call
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-white/40 font-medium">Select a submission</p>
                  <p className="text-white/25 text-sm mt-1">Click on a lead to view details</p>
                </div>
              )}
            </div>
          </div>
          </>
          )}

          {activeSection === "projects" && (
          <>
          {/* Project Manager Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Projects", value: projects.length, color: "blue", icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" },
              { label: "In Progress", value: projects.filter((p) => !["completed", "on_hold"].includes(p.status)).length, color: "amber", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Completed", value: projects.filter((p) => p.status === "completed").length, color: "emerald", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "On Hold", value: projects.filter((p) => p.status === "on_hold").length, color: "red", icon: "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center mb-3`}>
                  <svg className={`w-5 h-5 text-${stat.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
                <p className="text-white/50 text-xs font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Projects List */}
            <div className="xl:col-span-1 bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Projects</h3>
                <span className="text-white/40 text-xs">{projects.length} total</span>
              </div>
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
                {projects.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                      </svg>
                    </div>
                    <p className="text-white/40 text-sm">No projects yet</p>
                    <p className="text-white/25 text-xs mt-1">Convert a quote to start</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {projects.map((proj) => (
                      <div key={proj.id} onClick={() => { setSelectedProject(proj); setProjectTab("overview"); }} className={`p-4 cursor-pointer transition-all hover:bg-white/[0.03] ${selectedProject?.id === proj.id ? "bg-[#0055FF]/10 border-l-2 border-[#00B4FF]" : ""}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 bg-gradient-to-br from-violet-500/30 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-violet-400 font-bold text-sm">{proj.projectName.charAt(0)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-medium text-sm truncate">{proj.projectName}</h4>
                            <p className="text-white/40 text-xs truncate">{proj.clientName}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${getProjectStatusStyle(proj.status)}`}>{proj.status.replace("_", " ")}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#00B4FF] rounded-full" style={{ width: `${proj.progress}%` }}></div>
                            </div>
                            <span className="text-white/30 text-[10px]">{proj.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Project Detail */}
            <div className="xl:col-span-2">
              {selectedProject ? (
                <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                  {/* Project Header */}
                  <div className="bg-gradient-to-r from-violet-500/10 to-transparent p-5 border-b border-white/5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                          <span className="text-2xl font-bold text-white">{selectedProject.projectName.charAt(0)}</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">{selectedProject.projectName}</h2>
                          <p className="text-white/50 text-sm">{selectedProject.clientName} • {selectedProject.companyName || "Individual"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select value={selectedProject.priority} onChange={(e) => updateProjectPriority(e.target.value as Project["priority"])} className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer outline-none ${getPriorityStyle(selectedProject.priority)}`}>
                          <option value="low" className="bg-[#0a0a1a]">Low</option>
                          <option value="medium" className="bg-[#0a0a1a]">Medium</option>
                          <option value="high" className="bg-[#0a0a1a]">High</option>
                          <option value="critical" className="bg-[#0a0a1a]">Critical</option>
                        </select>
                        <select value={selectedProject.status} onChange={(e) => updateProjectStatus(e.target.value as Project["status"])} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:border-[#00B4FF]/50 outline-none cursor-pointer">
                          <option value="discovery" className="bg-[#0a0a1a]">Discovery</option>
                          <option value="design" className="bg-[#0a0a1a]">Design</option>
                          <option value="development" className="bg-[#0a0a1a]">Development</option>
                          <option value="testing" className="bg-[#0a0a1a]">Testing</option>
                          <option value="launch" className="bg-[#0a0a1a]">Launch</option>
                          <option value="completed" className="bg-[#0a0a1a]">Completed</option>
                          <option value="on_hold" className="bg-[#0a0a1a]">On Hold</option>
                        </select>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-[#00B4FF] rounded-full transition-all" style={{ width: `${selectedProject.progress}%` }}></div>
                      </div>
                      <span className="text-white font-bold text-sm">{selectedProject.progress}%</span>
                    </div>
                  </div>

                  {/* Project Tabs */}
                  <div className="flex border-b border-white/5 px-2">
                    {[
                      { id: "overview", label: "Overview", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                      { id: "tasks", label: "Tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                      { id: "timeline", label: "Timeline", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                      { id: "notes", label: "Notes", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
                      { id: "activity", label: "Activity", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                    ].map((tab) => (
                      <button key={tab.id} onClick={() => setProjectTab(tab.id as typeof projectTab)} className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${projectTab === tab.id ? "border-[#00B4FF] text-[#00B4FF]" : "border-transparent text-white/50 hover:text-white"}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} /></svg>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-5 max-h-[calc(100vh-480px)] overflow-y-auto">
                    {projectTab === "overview" && (
                      <div className="space-y-5">
                        {/* Client Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <a href={`mailto:${selectedProject.clientEmail}`} className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg p-3 transition-all">
                            <div className="w-9 h-9 bg-[#0055FF]/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-[#00B4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div className="min-w-0"><p className="text-white/40 text-[10px]">Email</p><p className="text-[#00B4FF] text-xs font-medium truncate">{selectedProject.clientEmail}</p></div>
                          </a>
                          <a href={`tel:${selectedProject.clientPhone}`} className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-lg p-3 transition-all">
                            <div className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <div className="min-w-0"><p className="text-white/40 text-[10px]">Phone</p><p className="text-emerald-400 text-xs font-medium">{selectedProject.clientPhone}</p></div>
                          </a>
                          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-lg p-3">
                            <div className="w-9 h-9 bg-violet-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <div className="min-w-0"><p className="text-white/40 text-[10px]">Deadline</p><p className="text-violet-400 text-xs font-medium">{selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : "Not set"}</p></div>
                          </div>
                        </div>

                        {/* Budget */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-white/40 text-xs uppercase tracking-wider font-medium">Budget Overview</p>
                            <span className={`text-xs font-medium ${selectedProject.spent > selectedProject.budget ? "text-red-400" : "text-emerald-400"}`}>
                              {selectedProject.budget > 0 ? `${Math.round((selectedProject.spent / selectedProject.budget) * 100)}% Used` : "No budget set"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/40 text-[10px] mb-1">Total Budget</p>
                              <div className="flex items-center gap-2">
                                <span className="text-white/30">$</span>
                                <input type="number" value={selectedProject.budget} onChange={(e) => updateProjectBudget("budget", parseFloat(e.target.value) || 0)} className="bg-transparent text-2xl font-bold text-white outline-none w-full" />
                              </div>
                            </div>
                            <div>
                              <p className="text-white/40 text-[10px] mb-1">Spent</p>
                              <div className="flex items-center gap-2">
                                <span className="text-white/30">$</span>
                                <input type="number" value={selectedProject.spent} onChange={(e) => updateProjectBudget("spent", parseFloat(e.target.value) || 0)} className="bg-transparent text-2xl font-bold text-amber-400 outline-none w-full" />
                              </div>
                            </div>
                          </div>
                          {selectedProject.budget > 0 && (
                            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${selectedProject.spent > selectedProject.budget ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.min((selectedProject.spent / selectedProject.budget) * 100, 100)}%` }}></div>
                            </div>
                          )}
                        </div>

                        {/* Services */}
                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">Services</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.services.map((service, i) => (
                              <span key={i} className="bg-violet-500/20 text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-lg text-xs font-medium">{service}</span>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">Project Description</p>
                          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4">
                            <p className="text-white/70 text-sm whitespace-pre-wrap">{selectedProject.description || "No description provided"}</p>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-white">{selectedProject.tasks.length}</p>
                            <p className="text-white/40 text-xs">Total Tasks</p>
                          </div>
                          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{selectedProject.tasks.filter(t => t.status === "completed").length}</p>
                            <p className="text-white/40 text-xs">Completed</p>
                          </div>
                          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-amber-400">{selectedProject.milestones.filter(m => m.completed).length}/{selectedProject.milestones.length}</p>
                            <p className="text-white/40 text-xs">Milestones</p>
                          </div>
                        </div>

                        {/* Delete Project */}
                        <div className="pt-4 border-t border-white/5">
                          <button onClick={() => { if(confirm("Are you sure you want to delete this project?")) deleteProject(selectedProject.id); }} className="text-red-400 text-xs hover:text-red-300 transition-colors">Delete Project</button>
                        </div>
                      </div>
                    )}

                    {projectTab === "tasks" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-white/40 text-xs uppercase tracking-wider font-medium">{selectedProject.tasks.length} Tasks</p>
                          <button onClick={() => setShowAddTask(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#0055FF] text-white text-xs font-medium rounded-lg hover:bg-[#0066FF] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add Task
                          </button>
                        </div>

                        {showAddTask && (
                          <div className="bg-white/[0.05] border border-white/10 rounded-xl p-4 space-y-3">
                            <input type="text" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-[#00B4FF]/50" />
                            <textarea placeholder="Description (optional)" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-[#00B4FF]/50 resize-none h-20" />
                            <div className="grid grid-cols-3 gap-3">
                              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
                                <option value="low" className="bg-[#0a0a1a]">Low Priority</option>
                                <option value="medium" className="bg-[#0a0a1a]">Medium Priority</option>
                                <option value="high" className="bg-[#0a0a1a]">High Priority</option>
                                <option value="critical" className="bg-[#0a0a1a]">Critical</option>
                              </select>
                              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                              <input type="text" placeholder="Assignee" value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={addTask} className="px-4 py-2 bg-[#0055FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF] transition-colors">Add Task</button>
                              <button onClick={() => setShowAddTask(false)} className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors">Cancel</button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          {selectedProject.tasks.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-white/40 text-sm">No tasks yet</p>
                              <p className="text-white/25 text-xs mt-1">Add your first task to get started</p>
                            </div>
                          ) : (
                            selectedProject.tasks.map((task) => (
                              <div key={task.id} className="bg-white/[0.03] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    <button onClick={() => updateTaskStatus(task.id, task.status === "completed" ? "pending" : "completed")} className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.status === "completed" ? "bg-emerald-500 border-emerald-500" : "border-white/30 hover:border-white/50"}`}>
                                      {task.status === "completed" && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`text-sm font-medium ${task.status === "completed" ? "text-white/40 line-through" : "text-white"}`}>{task.title}</h4>
                                      {task.description && <p className="text-white/40 text-xs mt-1">{task.description}</p>}
                                      <div className="flex items-center gap-3 mt-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                                        {task.dueDate && <span className="text-white/30 text-[10px]">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                                        {task.assignee && <span className="text-white/30 text-[10px]">@{task.assignee}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <select value={task.status} onChange={(e) => updateTaskStatus(task.id, e.target.value as Task["status"])} className={`text-[10px] px-2 py-1 rounded border-0 outline-none cursor-pointer ${getTaskStatusStyle(task.status)}`}>
                                      <option value="pending" className="bg-[#0a0a1a]">Pending</option>
                                      <option value="in_progress" className="bg-[#0a0a1a]">In Progress</option>
                                      <option value="completed" className="bg-[#0a0a1a]">Completed</option>
                                    </select>
                                    <button onClick={() => deleteTask(task.id)} className="p-1 text-white/30 hover:text-red-400 transition-colors">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {projectTab === "timeline" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-white/40 text-xs uppercase tracking-wider font-medium">Milestones</p>
                          <button onClick={() => setShowAddMilestone(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#0055FF] text-white text-xs font-medium rounded-lg hover:bg-[#0066FF] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add Milestone
                          </button>
                        </div>

                        {showAddMilestone && (
                          <div className="bg-white/[0.05] border border-white/10 rounded-xl p-4 space-y-3">
                            <input type="text" placeholder="Milestone title" value={newMilestone.title} onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-[#00B4FF]/50" />
                            <input type="date" value={newMilestone.dueDate} onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                            <div className="flex gap-2">
                              <button onClick={addMilestone} className="px-4 py-2 bg-[#0055FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF] transition-colors">Add Milestone</button>
                              <button onClick={() => setShowAddMilestone(false)} className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors">Cancel</button>
                            </div>
                          </div>
                        )}

                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10"></div>
                          <div className="space-y-4">
                            {selectedProject.milestones.map((milestone, i) => (
                              <div key={milestone.id} className="relative pl-10">
                                <button onClick={() => toggleMilestone(milestone.id)} className={`absolute left-2 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${milestone.completed ? "bg-emerald-500 border-emerald-500" : "bg-[#030014] border-white/30 hover:border-white/50"}`}>
                                  {milestone.completed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </button>
                                <div className={`bg-white/[0.03] border border-white/10 rounded-lg p-4 ${milestone.completed ? "opacity-60" : ""}`}>
                                  <div className="flex items-center justify-between">
                                    <h4 className={`text-sm font-medium ${milestone.completed ? "text-white/40 line-through" : "text-white"}`}>{milestone.title}</h4>
                                    <span className="text-white/30 text-xs">{milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : "No date"}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Project Dates */}
                        <div className="mt-6 pt-4 border-t border-white/5">
                          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-3">Project Timeline</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                              <p className="text-white/40 text-[10px]">Start Date</p>
                              <p className="text-white text-sm font-medium">{selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : "Not set"}</p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                              <p className="text-white/40 text-[10px]">Deadline</p>
                              <p className="text-white text-sm font-medium">{selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : "Not set"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {projectTab === "notes" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-white/40 text-xs uppercase tracking-wider font-medium">{selectedProject.notes.length} Notes</p>
                          <button onClick={() => setShowAddNote(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#0055FF] text-white text-xs font-medium rounded-lg hover:bg-[#0066FF] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add Note
                          </button>
                        </div>

                        {showAddNote && (
                          <div className="bg-white/[0.05] border border-white/10 rounded-xl p-4 space-y-3">
                            <textarea placeholder="Write your note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-[#00B4FF]/50 resize-none h-24" />
                            <div className="flex gap-2">
                              <button onClick={addNote} className="px-4 py-2 bg-[#0055FF] text-white text-sm font-medium rounded-lg hover:bg-[#0066FF] transition-colors">Add Note</button>
                              <button onClick={() => setShowAddNote(false)} className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors">Cancel</button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {selectedProject.notes.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-white/40 text-sm">No notes yet</p>
                              <p className="text-white/25 text-xs mt-1">Add notes to keep track of important information</p>
                            </div>
                          ) : (
                            selectedProject.notes.map((note) => (
                              <div key={note.id} className="bg-white/[0.03] border border-white/10 rounded-lg p-4">
                                <p className="text-white/70 text-sm whitespace-pre-wrap">{note.content}</p>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                  <span className="text-white/30 text-xs">{note.author}</span>
                                  <span className="text-white/20">•</span>
                                  <span className="text-white/30 text-xs">{new Date(note.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {projectTab === "activity" && (
                      <div className="space-y-4">
                        <p className="text-white/40 text-xs uppercase tracking-wider font-medium">Activity Log</p>
                        <div className="space-y-2">
                          {selectedProject.activityLog.slice().reverse().map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white/70 text-sm">{activity.action}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-white/30 text-xs">{activity.user}</span>
                                  <span className="text-white/20">•</span>
                                  <span className="text-white/30 text-xs">{new Date(activity.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                    </svg>
                  </div>
                  <p className="text-white/40 font-medium">Select a project</p>
                  <p className="text-white/25 text-sm mt-1">Or convert a quote to start a new project</p>
                </div>
              )}
            </div>
          </div>
          </>
          )}

          {/* Careers Section */}
          {activeSection === "careers" && (
          <>
            {/* Add Position Button */}
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowAddPosition(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0055FF] to-[#00B4FF] text-white font-medium rounded-lg hover:opacity-90 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Position
              </button>
            </div>

            {/* Positions Table */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
              {jobPositions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-white/40 font-medium">No job positions yet</p>
                  <p className="text-white/25 text-sm mt-1">Add your first position to get started</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3">Title</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3">Department</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3">Location</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3">Type</th>
                      <th className="text-left text-white/60 text-xs font-medium px-4 py-3">Status</th>
                      <th className="text-right text-white/60 text-xs font-medium px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobPositions.map((position) => (
                      <tr key={position.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white font-medium text-sm">{position.title}</td>
                        <td className="px-4 py-3 text-white/60 text-sm">{position.department}</td>
                        <td className="px-4 py-3 text-white/60 text-sm">{position.location}</td>
                        <td className="px-4 py-3 text-white/60 text-sm">{position.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${position.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                            {position.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => updateJobPosition(position.id, { isActive: !position.isActive })} className={`px-2 py-1 text-[10px] font-medium rounded ${position.isActive ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                              {position.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button onClick={() => deleteJobPosition(position.id)} className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-medium rounded">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
          )}

          {activeSection === "offer_letters" && (
            <OfferLetterSection sidebarOpen={sidebarOpen} />
          )}
        </div>
      </main>

      {/* Add Position Modal */}
      {showAddPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-white mb-1">Add New Position</h3>
            <p className="text-white/50 text-sm mb-6">Create a new job opening</p>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-2">Job Title *</label>
                  <input type="text" value={newPosition.title} onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })} placeholder="e.g. Senior React Developer" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#00B4FF]/50" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-2">Department *</label>
                  <input type="text" value={newPosition.department} onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })} placeholder="e.g. Engineering" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#00B4FF]/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-2">Location *</label>
                  <input type="text" value={newPosition.location} onChange={(e) => setNewPosition({ ...newPosition, location: e.target.value })} placeholder="e.g. Remote / New York" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#00B4FF]/50" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-2">Job Type</label>
                  <select value={newPosition.type} onChange={(e) => setNewPosition({ ...newPosition, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00B4FF]/50">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-2">Experience *</label>
                  <input type="text" value={newPosition.experience} onChange={(e) => setNewPosition({ ...newPosition, experience: e.target.value })} placeholder="e.g. 3-5 years" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#00B4FF]/50" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-2">Salary Range (Optional)</label>
                  <input type="text" value={newPosition.salary} onChange={(e) => setNewPosition({ ...newPosition, salary: e.target.value })} placeholder="e.g. $80k - $120k" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#00B4FF]/50" />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2">Description *</label>
                <textarea value={newPosition.description} onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })} placeholder="Describe the role and what the candidate will be doing..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#00B4FF]/50 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addJobPosition} className="flex-1 py-3 bg-gradient-to-r from-[#0055FF] to-[#00B4FF] text-white font-semibold rounded-xl hover:opacity-90 transition-all">Add Position</button>
              <button onClick={() => setShowAddPosition(false)} className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Project Modal */}
      {showConvertModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Convert to Project</h3>
            <p className="text-white/50 text-sm mb-6">Create a new project from this quote submission</p>
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2">Project Name</label>
                <input type="text" value={convertData.projectName} onChange={(e) => setConvertData({ ...convertData, projectName: e.target.value })} placeholder={`${selectedSubmission.companyName || selectedSubmission.fullName} Project`} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#00B4FF]/50" />
              </div>
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2">Budget ($)</label>
                <input type="number" value={convertData.budget} onChange={(e) => setConvertData({ ...convertData, budget: e.target.value })} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#00B4FF]/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-2">Start Date</label>
                  <input type="date" value={convertData.startDate} onChange={(e) => setConvertData({ ...convertData, startDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00B4FF]/50" />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-2">Deadline</label>
                  <input type="date" value={convertData.deadline} onChange={(e) => setConvertData({ ...convertData, deadline: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00B4FF]/50" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => convertToProject(selectedSubmission)} className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all">Create Project</button>
              <button onClick={() => setShowConvertModal(false)} className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
