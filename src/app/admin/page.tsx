"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import VynTechLogo from "@/components/VynTechLogo";
import { useAdminTheme } from "@/components/admin/admin-theme";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";

const OfferLetterSection = dynamic(() => import("@/components/admin/OfferLetterSection"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-white/40 text-sm">Loading offer letter generator...</div>
  ),
});

const InvoiceSection = dynamic(() => import("@/components/admin/InvoiceSection"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-white/40 text-sm">Loading company expenses...</div>
  ),
});

const ClientInvoiceSection = dynamic(() => import("@/components/admin/ClientInvoiceSection"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-white/40 text-sm">Loading client invoices...</div>
  ),
});

const TeamProgressSection = dynamic(() => import("@/components/admin/TeamProgressSection"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-white/40 text-sm">Loading team progress...</div>
  ),
});

const ProjectManagerSection = dynamic(() => import("@/components/admin/ProjectManagerSection"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-white/40 text-sm">Loading project manager...</div>
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

export default function AdminPage() {
  const { theme, toggle, isDark } = useAdminTheme();
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
  const [activeSection, setActiveSection] = useState<"quotes" | "projects" | "workflow" | "careers" | "offer_letters" | "invoices" | "client_invoices">("workflow");
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);
  const [showConvertModal, setShowConvertModal] = useState(false);
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
      setProjectsRefreshKey((k) => k + 1);
      loadJobPositions();
    }
    setIsLoading(false);
  }, []);

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
        updateStatus(submission.id, "in_progress");
        setShowConvertModal(false);
        setConvertData({ projectName: "", budget: "", deadline: "", startDate: "" });
        setProjectsRefreshKey((k) => k + 1);
        setActiveSection("projects");
      }
    } catch (error) {
      console.error("Error creating project:", error);
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
        setProjectsRefreshKey((k) => k + 1);
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

  if (isLoading) {
    return (
      <div data-admin-theme={theme} className="min-h-screen bg-[#030014] flex items-center justify-center">
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
      <div data-admin-theme={theme} className="min-h-screen bg-[#030014] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-20">
          <AdminThemeToggle isDark={isDark} onToggle={toggle} />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#0055FF]/20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#00B4FF]/15 rounded-full blur-[150px] animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-6">
            <VynTechLogo className="scale-110 cursor-default" darkText={!isDark} />
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
    <div data-admin-theme={theme} className="h-screen bg-[#030014] flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#0a0a1a]/80 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 fixed h-full z-40`}>
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center">
            <VynTechLogo className={`cursor-default ${sidebarOpen ? "scale-90 -ml-2" : "scale-75 -ml-4"}`} darkText={!isDark} />
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <button onClick={() => { setActiveSection("workflow"); setSelectedSubmission(null);  setSelectedPosition(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "workflow" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            <svg className={`w-5 h-5 ${activeSection === "workflow" ? "text-[#00B4FF]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Team Progress</span>}
          </button>
          <button onClick={() => { setActiveSection("quotes");  }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "quotes" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
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
          <button onClick={() => { setActiveSection("careers"); setSelectedSubmission(null);  }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "careers" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            <svg className={`w-5 h-5 ${activeSection === "careers" ? "text-[#00B4FF]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Careers</span>}
          </button>
          <button onClick={() => { setActiveSection("offer_letters"); setSelectedSubmission(null);  setSelectedPosition(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "offer_letters" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            <svg className={`w-5 h-5 ${activeSection === "offer_letters" ? "text-[#00B4FF]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Offer Letters</span>}
          </button>
          <button onClick={() => { setActiveSection("client_invoices"); setSelectedSubmission(null);  setSelectedPosition(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "client_invoices" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            <svg className={`w-5 h-5 ${activeSection === "client_invoices" ? "text-[#00B4FF]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Client Invoice</span>}
          </button>
          <button onClick={() => { setActiveSection("invoices"); setSelectedSubmission(null);  setSelectedPosition(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === "invoices" ? "bg-[#0055FF]/20 border-l-2 border-[#00B4FF] text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
            <svg className={`w-5 h-5 ${activeSection === "invoices" ? "text-[#00B4FF]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Company Expenses</span>}
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
      <main className={`flex-1 min-h-0 flex flex-col bg-[#030014] ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
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
                      : activeSection === "workflow"
                        ? "Team Progress"
                      : activeSection === "careers"
                        ? "Careers"
                        : activeSection === "offer_letters"
                          ? "Offer Letters"
                          : activeSection === "client_invoices"
                            ? "Client Invoice"
                            : "Company Expenses"}
                </h2>
                <p className="text-white/40 text-xs">
                  {activeSection === "quotes"
                    ? "Manage incoming leads"
                    : activeSection === "projects"
                      ? "SDLC workflow — discovery through digital marketing"
                      : activeSection === "workflow"
                        ? "All employees, daily completion at a glance"
                      : activeSection === "careers"
                        ? "Manage job openings"
                        : activeSection === "offer_letters"
                          ? "Generate client & internal quotation PDFs"
                          : activeSection === "client_invoices"
                            ? "Create and send professional client invoices"
                            : "Salary slips & internal expense vouchers"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AdminThemeToggle isDark={isDark} onToggle={toggle} />
              <button onClick={activeSection === "quotes" ? fetchSubmissions : activeSection === "projects" ? () => setProjectsRefreshKey((k) => k + 1) : loadJobPositions} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all" title="Refresh">
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            </div>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 min-h-[calc(100vh-260px)]">
            {/* List */}
            <div className="xl:col-span-1 bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-white font-semibold text-sm">Submissions</h3>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
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
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-12 text-center h-full min-h-[calc(100vh-280px)] flex flex-col items-center justify-center">
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
          <ProjectManagerSection refreshKey={projectsRefreshKey} />
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
          {activeSection === "workflow" && (
            <TeamProgressSection />
          )}
          {activeSection === "client_invoices" && (
            <ClientInvoiceSection sidebarOpen={sidebarOpen} />
          )}
          {activeSection === "invoices" && (
            <InvoiceSection sidebarOpen={sidebarOpen} />
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
