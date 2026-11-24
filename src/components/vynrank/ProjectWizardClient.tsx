"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VynRankShell from "@/components/vynrank/VynRankShell";
import { useVynRankAuth } from "@/components/vynrank/VynRankAuthContext";

type Pkg = { id: string; name: string; priceCad: number; description: string | null };
type Member = { id: string; name: string; role: string };

const STEPS = ["Basics", "Package", "Team", "Goals", "Review"] as const;

export default function ProjectWizardClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useVynRankAuth();
  const [step, setStep] = useState(0);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [packageId, setPackageId] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (user?.role === "client") {
      router.replace("/vynrank/projects");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.role === "client") return;
    Promise.all([
      fetch("/api/vynrank/packages", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { packages: [] }
      ),
      fetch("/api/vynrank/team", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { members: [] }
      ),
    ])
      .then(([pkgRes, teamRes]) => {
        setPackages(pkgRes.packages || []);
        setMembers((teamRes.members || []).filter((m: Member) => m.role === "seo_team"));
      })
      .catch(() => {});
  }, [user?.role]);

  function toggleAssignee(id: string) {
    setAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      if (step === 0 && (!name.trim() || !clientName.trim())) {
        setError("Project name and client name are required.");
        return;
      }
      setError("");
      setStep((s) => s + 1);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/vynrank/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          clientName,
          packageId: packageId || null,
          assigneeIds,
          goal,
          monthlyRevenue: Number(monthlyRevenue) || 0,
          status: "onboarding",
          phase: "onboarding",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Create failed");
      router.push(`/vynrank/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  const selectedPkg = packages.find((p) => p.id === packageId);

  return (
    <VynRankShell>
      <div className="vr-cc-head">
        <div>
          <h1 className="vr-cc-title">New project</h1>
          <p className="vr-cc-sub">
            Five short steps. Work cannot start until the onboarding gate is met.
          </p>
        </div>
      </div>
      <div className="vr-panel" style={{ padding: 24, maxWidth: 720 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {STEPS.map((label, i) => (
            <div
              key={label}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: i === step ? "var(--vr-accent-soft)" : "var(--vr-surface-muted)",
                color: i === step ? "var(--vr-accent)" : "var(--vr-muted)",
              }}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {step === 0 ? (
            <>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Project name</span>
                <input
                  className="vynrank-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme — Local SEO"
                  required
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Client name</span>
                <input
                  className="vynrank-input"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Acme Dental"
                  required
                />
              </label>
            </>
          ) : null}

          {step === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setPackageId(pkg.id)}
                  style={{
                    textAlign: "left",
                    padding: 14,
                    borderRadius: 12,
                    border:
                      packageId === pkg.id
                        ? "2px solid var(--vr-accent)"
                        : "1px solid var(--vr-border)",
                    background: packageId === pkg.id ? "var(--vr-accent-soft)" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{pkg.name}</div>
                  <div style={{ fontSize: 13, color: "var(--vr-muted)", marginTop: 4 }}>
                    ${pkg.priceCad.toLocaleString("en-CA")}/mo CAD
                    {pkg.description ? ` · ${pkg.description}` : ""}
                  </div>
                </button>
              ))}
              {packages.length === 0 ? (
                <div style={{ color: "var(--vr-muted)" }}>No packages seeded yet.</div>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {members.map((m) => (
                <label
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 12,
                    border: "1px solid var(--vr-border)",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={assigneeIds.includes(m.id)}
                    onChange={() => toggleAssignee(m.id)}
                  />
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                </label>
              ))}
              {members.length === 0 ? (
                <div style={{ color: "var(--vr-muted)" }}>
                  No SEO Team members found. You can assign later.
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Primary goal</span>
                <textarea
                  className="vynrank-input"
                  style={{ height: 100, paddingTop: 12, resize: "vertical" }}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Grow organic leads 30% in 6 months…"
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Monthly revenue (CAD)</span>
                <input
                  className="vynrank-input"
                  type="number"
                  min={0}
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(e.target.value)}
                  placeholder={selectedPkg ? String(selectedPkg.priceCad) : "2500"}
                />
              </label>
            </>
          ) : null}

          {step === 4 ? (
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "var(--vr-surface-muted)",
                border: "1px solid var(--vr-border)",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              <div>
                <strong>Project:</strong> {name}
              </div>
              <div>
                <strong>Client:</strong> {clientName}
              </div>
              <div>
                <strong>Package:</strong> {selectedPkg?.name || "—"}
              </div>
              <div>
                <strong>Team:</strong>{" "}
                {assigneeIds
                  .map((id) => members.find((m) => m.id === id)?.name)
                  .filter(Boolean)
                  .join(", ") || "—"}
              </div>
              <div>
                <strong>Goal:</strong> {goal || "—"}
              </div>
              <div>
                <strong>MRR:</strong> ${Number(monthlyRevenue || 0).toLocaleString("en-CA")}
              </div>
            </div>
          ) : null}

          {error ? (
            <div style={{ color: "var(--vr-danger)", fontWeight: 600, fontSize: 13 }}>{error}</div>
          ) : null}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {step > 0 ? (
              <button
                type="button"
                className="vynrank-btn vynrank-btn-secondary"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </button>
            ) : (
              <Link href="/vynrank/projects" className="vynrank-btn vynrank-btn-secondary">
                Cancel
              </Link>
            )}
            <button
              type="submit"
              className="vynrank-btn vynrank-btn-primary"
              disabled={saving}
              style={{ marginLeft: "auto" }}
            >
              {step < STEPS.length - 1 ? "Continue" : saving ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </VynRankShell>
  );
}
