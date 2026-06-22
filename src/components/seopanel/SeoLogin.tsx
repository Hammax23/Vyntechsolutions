"use client";

import { useState } from "react";
import VynTechLogo from "@/components/VynTechLogo";

interface SeoLoginProps {
  onAuthenticated: (token: string) => void;
}

export default function SeoLogin({ onAuthenticated }: SeoLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seopanel/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, step: "login" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setStep("2fa");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seopanel/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, step: "verify", code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      sessionStorage.setItem("seoPanelAuth", "authenticated");
      sessionStorage.setItem("seoPanelToken", data.token);
      onAuthenticated(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0d9488]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0055FF]/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <VynTechLogo className="mx-auto mb-4 cursor-default" />
          <h1 className="text-2xl font-bold text-white">SEO Command Center</h1>
          <p className="text-slate-400 text-sm mt-2">VynTech Solutions Enterprise SEO Panel</p>
        </div>
        <div className="bg-[#12182b] border border-[#1e2a45] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#0d9488] animate-pulse" />
            <span className="text-xs font-semibold text-[#0d9488] uppercase tracking-widest">Secure Expert Access</span>
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>
          )}
          {step === "credentials" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-[#0a0f1a] border border-[#1e2a45] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#0d9488]" placeholder="seo@vyntechsolutions.ca" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full bg-[#0a0f1a] border border-[#1e2a45] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#0d9488] pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#0d9488] to-[#0055FF] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                {loading ? "Sending code..." : "Continue with 2FA"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-slate-400 text-sm">Enter the 6-digit code sent to your email.</p>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required maxLength={6}
                className="w-full bg-[#0a0f1a] border border-[#1e2a45] rounded-lg px-4 py-3 text-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-[#0d9488]" placeholder="000000" />
              <button type="submit" disabled={loading || code.length < 6}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#0d9488] to-[#0055FF] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50">
                {loading ? "Verifying..." : "Access SEO Panel"}
              </button>
              <button type="button" onClick={() => { setStep("credentials"); setCode(""); }} className="w-full text-slate-500 text-sm hover:text-slate-300">
                Back to login
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-slate-600 text-xs mt-6">Authorized SEO personnel only · All activity is logged</p>
      </div>
    </div>
  );
}
