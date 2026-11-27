"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GATED_PHASES,
  PIPELINE_PHASES,
  hasPhaseGate,
  phaseLabel,
} from "@/lib/admin/project-workflow";
import { paymentInvoiceOverdue } from "./types";
import type { ProjectManagerApi } from "./useProjectManager";
import { fadeOnly } from "./pm-helpers";

type Props = { pm: ProjectManagerApi };

export default function PmWorkflowTab({ pm }: Props) {
  const {
    reduceMotion,
    motionDuration,
    selectedProject,
    currentPhase,
    gates,
    currentChecks,
    checkProg,
    signOffNote,
    setSignOffNote,
    toggleCheck,
    addChecklistItem,
    renameChecklistItem,
    deleteChecklistItem,
    signOffPhase,
    advanceToNextPhase,
    paymentPercentTotal,
    setEditingPaymentId,
    setPaymentForm,
    setShowAddPayment,
    showAddPayment,
    editingPaymentId,
    paymentForm,
    savePaymentMilestone,
    resetPaymentForm,
    paymentInvoices,
    jumpToClientInvoice,
    createInvoiceFromPayment,
    markPayment,
    startEditPayment,
    deletePayment,
  } = pm;

  const [showAddCheck, setShowAddCheck] = useState(false);
  const [newCheckLabel, setNewCheckLabel] = useState("");
  const [editingCheckId, setEditingCheckId] = useState<string | null>(null);
  const [editingCheckLabel, setEditingCheckLabel] = useState("");
  const [checkBusy, setCheckBusy] = useState(false);

  if (!selectedProject) return null;

  const submitNewCheck = async () => {
    setCheckBusy(true);
    const ok = await addChecklistItem(newCheckLabel);
    setCheckBusy(false);
    if (ok) {
      setNewCheckLabel("");
      setShowAddCheck(false);
    }
  };

  const submitRenameCheck = async () => {
    if (!editingCheckId) return;
    setCheckBusy(true);
    const ok = await renameChecklistItem(editingCheckId, editingCheckLabel);
    setCheckBusy(false);
    if (ok) {
      setEditingCheckId(null);
      setEditingCheckLabel("");
    }
  };

  return (
    <motion.div
      key="tab-workflow"
      variants={fadeOnly}
      initial="hidden"
      animate="show"
      exit="hidden"
      transition={{ duration: motionDuration }}
      className="space-y-3"
    >
      {GATED_PHASES.has(currentPhase) && !hasPhaseGate(gates, currentPhase) && (
        <div className="pm-gate-banner rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3 text-sm text-amber-950">
          <p className="font-semibold text-amber-950">
            Sign-off required before leaving this phase
          </p>
          <p className="mt-1 text-amber-900/90 leading-relaxed">
            {(currentChecks.filter((c) => !c.done).length || 0)} checklist item(s)
            incomplete · complete the checklist, then sign off below before advancing
            (force advance still available if needed).
          </p>
        </div>
      )}
      <div className="rounded border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-white/10">
          <div>
            <p className="pm-check-label text-xs font-semibold uppercase tracking-wider">
              {phaseLabel(currentPhase)} checklist
            </p>
            <p className="pm-check-num text-[11px] mt-0.5">
              Add, edit, or remove items for this phase
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className="pm-check-label text-sm font-semibold tabular-nums">
                {checkProg.percent}%
              </p>
              <p className="pm-check-num text-[11px] tabular-nums">
                {checkProg.done}/{checkProg.total}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddCheck(true);
                setEditingCheckId(null);
              }}
              className="text-xs px-2.5 py-1 rounded border border-white/20 bg-white/[0.06] text-white font-medium hover:bg-white/[0.1]"
            >
              Add item
            </button>
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

        {showAddCheck && (
          <div className="px-3 py-3 border-b border-white/10 bg-white/[0.02] space-y-2">
            <p className="pm-check-label text-xs font-medium">New checklist item</p>
            <input
              className="pm-field"
              placeholder="e.g. Client signed NDA"
              value={newCheckLabel}
              onChange={(e) => setNewCheckLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submitNewCheck();
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={checkBusy || !newCheckLabel.trim()}
                onClick={() => void submitNewCheck()}
                className="px-3 py-1.5 rounded border border-white/20 bg-white/[0.08] text-white text-xs font-medium disabled:opacity-50"
              >
                {checkBusy ? "Saving…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCheck(false);
                  setNewCheckLabel("");
                }}
                className="px-3 py-1.5 rounded border border-white/10 text-white/60 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {currentChecks.length === 0 ? (
          <p className="text-white/40 text-sm px-3 py-5 text-center">
            No items for {phaseLabel(currentPhase)}. Use <span className="text-white/70">Add item</span>{" "}
            to build this phase checklist.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {currentChecks.map((c, idx) => (
              <li key={c.id}>
                {editingCheckId === c.id ? (
                  <div className="px-3 py-2.5 space-y-2 bg-white/[0.02]">
                    <input
                      className="pm-field"
                      value={editingCheckLabel}
                      onChange={(e) => setEditingCheckLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void submitRenameCheck();
                        if (e.key === "Escape") {
                          setEditingCheckId(null);
                          setEditingCheckLabel("");
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={checkBusy || !editingCheckLabel.trim()}
                        onClick={() => void submitRenameCheck()}
                        className="px-3 py-1.5 rounded border border-white/20 bg-white/[0.08] text-white text-xs font-medium disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCheckId(null);
                          setEditingCheckLabel("");
                        }}
                        className="px-3 py-1.5 rounded border border-white/10 text-white/60 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`pm-check-row flex items-start gap-2.5 px-3 py-2.5 transition-colors ${
                      c.done ? "pm-check-row--done" : ""
                    }`}
                  >
                    <label className="flex items-start gap-2.5 min-w-0 flex-1 cursor-pointer">
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
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        className="pm-action-btn text-[10px]"
                        onClick={() => {
                          setEditingCheckId(c.id);
                          setEditingCheckLabel(c.label || "");
                          setShowAddCheck(false);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pm-action-btn pm-action-btn--danger text-[10px]"
                        onClick={() => void deleteChecklistItem(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
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
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-400 px-2 py-0.5 rounded">
                Pending sign-off
              </span>
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
          ) : (
            PIPELINE_PHASES.indexOf(currentPhase) >= 0 &&
            PIPELINE_PHASES.indexOf(currentPhase) < PIPELINE_PHASES.length - 1 && (
              <button
                type="button"
                onClick={() => void advanceToNextPhase()}
                className="px-3 py-1.5 border border-white/20 bg-white/[0.08] text-white text-xs font-medium rounded hover:bg-white/[0.12]"
              >
                Advance to{" "}
                {phaseLabel(
                  PIPELINE_PHASES[PIPELINE_PHASES.indexOf(currentPhase) + 1]
                )}
              </button>
            )
          )}
        </div>
      )}
    
      {PIPELINE_PHASES.includes(currentPhase) &&
        !GATED_PHASES.has(currentPhase) &&
        PIPELINE_PHASES.indexOf(currentPhase) < PIPELINE_PHASES.length - 1 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void advanceToNextPhase()}
              className="px-3 py-1.5 border border-white/20 bg-white/[0.06] text-white text-xs font-medium rounded hover:bg-white/[0.1]"
            >
              Advance to{" "}
              {phaseLabel(
                PIPELINE_PHASES[PIPELINE_PHASES.indexOf(currentPhase) + 1]
              )}
            </button>
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
            (selectedProject.payments || []).map((pay) => {
              const invMeta =
                pay.billingInvoice ||
                (paymentInvoices[pay.id]
                  ? {
                      id: paymentInvoices[pay.id].id,
                      invoiceNumber: paymentInvoices[pay.id].invoiceNumber,
                      status: paymentInvoices[pay.id].status,
                      paidAt: null as string | null,
                      dueDate: null as string | null,
                    }
                  : null);
              const payDueMs = pay.dueDate ? new Date(pay.dueDate).getTime() : NaN;
              const payOverdue =
                pay.status !== "paid" &&
                Number.isFinite(payDueMs) &&
                payDueMs < Date.now();
              const invOverdue =
                Boolean(invMeta) &&
                (invMeta!.status === "overdue" ||
                  paymentInvoiceOverdue({
                    status: invMeta!.status,
                    dueDate: invMeta!.dueDate,
                  }));
              const isOverdue = payOverdue || invOverdue;
              return (
              <div
                key={pay.id}
                className={`flex flex-col lg:flex-row lg:items-center justify-between gap-2 px-3 py-2.5 ${
                  isOverdue ? "bg-rose-500/[0.06]" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="pm-check-label text-sm font-medium">{pay.label}</p>
                  <p className="pm-check-num text-xs mt-0.5">
                    {pay.percent}% · ${Number(pay.amount).toLocaleString()}
                    {pay.paidAt
                      ? ` · paid ${new Date(pay.paidAt).toLocaleDateString()}`
                      : ""}
                    {isOverdue ? " · overdue" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <span
                    className={`pm-status-chip ${
                      pay.status === "paid"
                        ? "pm-status-chip--paid"
                        : isOverdue || pay.status === "due"
                          ? "pm-status-chip--due"
                          : "pm-status-chip--pending"
                    }`}
                  >
                    {payOverdue && pay.status !== "due" ? "overdue" : pay.status || "pending"}
                  </span>
                  {invMeta ? (
                    <>
                      <span
                        className={`pm-status-chip ${
                          invMeta.status === "paid"
                            ? "pm-status-chip--paid"
                            : invOverdue
                              ? "pm-status-chip--due"
                              : "pm-status-chip--pending"
                        }`}
                        title={`Invoice ${invMeta.invoiceNumber}${
                          invMeta.dueDate
                            ? ` · due ${new Date(invMeta.dueDate).toLocaleDateString()}`
                            : ""
                        }`}
                      >
                        inv{" "}
                        {invOverdue && invMeta.status !== "overdue"
                          ? "overdue"
                          : invMeta.status}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          jumpToClientInvoice(
                            invMeta.id,
                            `Opening ${invMeta.invoiceNumber}…`
                          )
                        }
                        className="pm-action-btn"
                        title={invMeta.invoiceNumber}
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
                      title={
                        invMeta?.status === "paid"
                          ? "Blocked while linked invoice is Paid"
                          : undefined
                      }
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
              );
            })
          )}
        </div>
      </div>
    
      <p className="text-white/30 text-[11px] leading-relaxed">
        Ground rules: no development before requirements are signed; change outside
        scope is quoted separately; both partners review before client delivery.
      </p>
    </motion.div>
  );
}
