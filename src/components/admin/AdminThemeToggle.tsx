"use client";

type Props = {
  isDark: boolean;
  onToggle: () => void;
};

export default function AdminThemeToggle({ isDark, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
