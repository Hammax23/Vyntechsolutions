"use client";

import { statusColors } from "@/lib/seopanel/client";

export function Badge({ status, label }: { status: string; label?: string }) {
  const cls = statusColors[status] || "bg-slate-500/20 text-slate-300 border-slate-500/30";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${cls}`}>
      {label || status.replace(/_/g, " ")}
    </span>
  );
}

export function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-[#12182b] border border-[#1e2a45] rounded-xl p-5 hover:border-[#0d9488]/40 transition-colors">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold ${accent || "text-white"}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export function PanelCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-[#12182b] border border-[#1e2a45] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2a45]">
        <h3 className="text-white font-semibold">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", disabled, className = "" }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
}) {
  const variants = {
    primary: "bg-gradient-to-r from-[#0d9488] to-[#0055FF] text-white hover:opacity-90",
    secondary: "bg-[#1e2a45] text-slate-200 hover:bg-[#253352]",
    danger: "bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30",
    ghost: "text-slate-400 hover:text-white hover:bg-[#1e2a45]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
      <input
        {...props}
        className={`w-full bg-[#0a0f1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0d9488] ${props.className || ""}`}
      />
    </div>
  );
}

export function Textarea({ label, ...props }: { label?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
      <textarea
        {...props}
        className={`w-full bg-[#0a0f1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0d9488] resize-y min-h-[80px] ${props.className || ""}`}
      />
    </div>
  );
}

export function Select({ label, options, ...props }: { label?: string; options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
      <select
        {...props}
        className={`w-full bg-[#0a0f1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0d9488] ${props.className || ""}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12182b] border border-[#1e2a45] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a45]">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-slate-500 text-sm text-center py-8">{message}</p>;
}
