"use client";

import type { ProjectManagerApi } from "./useProjectManager";

type Props = { pm: ProjectManagerApi };

export default function PmClientUpdateModal({ pm }: Props) {
  const {
    showClientUpdate,
    selectedProject,
    cuSending,
    setShowClientUpdate,
    setCuConfirmClient,
    cuLoadingPreview,
    cuPreflight,
    setCuPreflight,
    cuTo,
    setCuTo,
    cuSubject,
    setCuSubject,
    setCuSubjectTouched,
    clientUpdateTpl,
    cuDraft,
    patchCu,
    syncSubjectFromDraft,
    cuTestTo,
    cuLiveSnapshot,
    sendClientUpdate,
    cuConfirmClient,
    cuHistoryTotal,
    setProjectTab,
    cuHistory,
    openClientUpdateRecord,
    openClientUpdateModal,
    cuHtml,
    showCuView,
    setShowCuView,
    setCuViewRecord,
    cuViewRecord,
    cuViewLoading,
  } = pm;

  return (
    <>
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
                        placeholder={clientUpdateTpl.subjectHint}
                      />
                      <p className="text-white/30 text-[10px] mt-1">
                        Phase hint: {clientUpdateTpl.subjectHint}
                      </p>
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
                                  {
                                    label: "New milestone",
                                    status: "pending",
                                    amount: 0,
                                  },
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
                              <input
                                className="pm-field w-[110px]"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="Amount"
                                title="Payment amount (CAD)"
                                value={
                                  item.amount === undefined || item.amount === null
                                    ? ""
                                    : item.amount
                                }
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const amount =
                                    raw.trim() === ""
                                      ? undefined
                                      : Math.max(0, Number(raw) || 0);
                                  const payments = cuDraft.payments.map((row, i) =>
                                    i === idx ? { ...row, amount } : row
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
                              {clientUpdateTpl.noteChips.map((chip) => (
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
    </>
  );
}
