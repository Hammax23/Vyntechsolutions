import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
/* eslint-disable jsx-a11y/alt-text -- @react-pdf Image is not an HTML <img> */
import {
  formatReportDate,
  priorityLabel,
  statusLabel,
  type ProgressReportData,
} from "./workflow-progress-report-types";
import { loadPrintLogoSrc } from "./pdf-logo";
import { COMPANY_EMAIL, COMPANY_PHONE_DISPLAY, SITE_URL } from "@/lib/company";

const NAVY = "#0F2A5F";
const BLUE = "#1B4F9C";
const TEXT = "#1F2937";
const MUTED = "#64748B";
const LINE = "#E2E8F0";
const SOFT = "#F8FAFC";
const WHITE = "#FFFFFF";
const EMERALD = "#047857";
const AMBER = "#B45309";
const RED = "#B91C1C";
const SKY = "#0369A1";

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: TEXT,
    lineHeight: 1.4,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 44, height: 44, marginRight: 10, objectFit: "contain" },
  brand: { fontSize: 15, color: NAVY, letterSpacing: 0.3 },
  brandSub: { fontSize: 7.5, color: MUTED, marginTop: 2 },
  contact: { fontSize: 7.5, color: MUTED, textAlign: "right", marginBottom: 2 },
  bar: { height: 2.5, backgroundColor: BLUE, marginBottom: 14 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 0.5 },
  titleSub: { fontSize: 8, color: MUTED, marginTop: 3 },
  metaBox: {
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    padding: 9,
    width: 190,
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  metaLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.35 },
  metaValue: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  partyBox: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    backgroundColor: SOFT,
  },
  partyLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 2 },
  partyText: { fontSize: 8, color: MUTED, marginBottom: 1 },
  kpiRow: { flexDirection: "row", marginBottom: 14 },
  kpi: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: WHITE,
    marginRight: 5,
  },
  kpiLast: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: WHITE,
    marginRight: 0,
  },
  kpiValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY, textAlign: "center" },
  kpiLabel: {
    fontSize: 6.5,
    color: MUTED,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  sectionHead: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.3,
    marginBottom: 6,
    marginTop: 4,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  th: { fontSize: 7, fontFamily: "Helvetica-Bold", color: WHITE },
  row: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.6,
    borderBottomColor: LINE,
  },
  rowAlt: { backgroundColor: SOFT },
  td: { fontSize: 7.5 },
  dayBlock: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    overflow: "hidden",
  },
  dayHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: SOFT,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.6,
    borderBottomColor: LINE,
  },
  dayTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: NAVY },
  dayMeta: { fontSize: 7.5, color: MUTED },
  taskRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  taskMain: { flex: 1, paddingRight: 8 },
  taskTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 1 },
  taskDesc: { fontSize: 7, color: MUTED, marginBottom: 2 },
  taskMeta: { fontSize: 6.5, color: MUTED },
  badges: { width: 88, alignItems: "flex-end" },
  badge: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    marginBottom: 3,
    overflow: "hidden",
  },
  empty: {
    padding: 16,
    textAlign: "center",
    color: MUTED,
    fontSize: 9,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    backgroundColor: SOFT,
  },
  note: { fontSize: 7.5, color: MUTED, marginTop: 10, lineHeight: 1.45 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.6,
    borderTopColor: LINE,
    paddingTop: 6,
  },
  footerText: { fontSize: 6.5, color: MUTED },
  watermark: {
    position: "absolute",
    top: 320,
    left: 160,
    width: 240,
    height: 240,
    opacity: 0.04,
    objectFit: "contain",
  },
});

function statusColor(status: string) {
  if (status === "done") return EMERALD;
  if (status === "in_progress") return SKY;
  if (status === "blocked") return AMBER;
  return MUTED;
}

function statusBg(status: string) {
  if (status === "done") return "#ECFDF5";
  if (status === "in_progress") return "#E0F2FE";
  if (status === "blocked") return "#FFFBEB";
  return "#F1F5F9";
}

function priorityColor(priority: string) {
  const p = (priority || "medium").toLowerCase();
  if (p === "high") return RED;
  if (p === "low") return MUTED;
  return AMBER;
}

function Footer({ reportId, page }: { reportId: string; page: number }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>VynTech Solutions, Confidential, {reportId}</Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber || page} of ${totalPages || "?"}`}
      />
    </View>
  );
}

export function WorkflowProgressPdfDocument({ data }: { data: ProgressReportData }) {
  const logo = loadPrintLogoSrc();
  const generatedLabel = new Date(data.generatedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Document
      title={`Progress Report, ${data.employee.name}`}
      author="VynTech Solutions"
      subject={`Employee progress report (${data.periodLabel})`}
      creator="VynTech Admin"
    >
      <Page size="A4" style={s.page} wrap>
        <Image src={logo} style={s.watermark} fixed />
        <View style={s.header}>
          <View style={s.brandRow}>
            <Image src={logo} style={s.logo} />
            <View>
              <Text style={s.brand}>VynTech Solutions</Text>
              <Text style={s.brandSub}>Daily Progress, Workforce Operations</Text>
            </View>
          </View>
          <View>
            <Text style={s.contact}>{COMPANY_EMAIL}</Text>
            <Text style={s.contact}>{COMPANY_PHONE_DISPLAY}</Text>
            <Text style={s.contact}>{SITE_URL.replace(/^https?:\/\//, "")}</Text>
          </View>
        </View>
        <View style={s.bar} />

        <View style={s.titleRow}>
          <View>
            <Text style={s.title}>EMPLOYEE PROGRESS REPORT</Text>
            <Text style={s.titleSub}>{data.periodLabel}</Text>
          </View>
          <View style={s.metaBox}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Report ID</Text>
              <Text style={s.metaValue}>{data.reportId}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Generated</Text>
              <Text style={s.metaValue}>{generatedLabel}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Scope</Text>
              <Text style={s.metaValue}>
                {data.mode === "day" ? "Single day" : data.mode === "month" ? "Full month" : "Date range"}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.partyBox}>
          <Text style={s.partyLabel}>EMPLOYEE</Text>
          <Text style={s.partyName}>{data.employee.name}</Text>
          <Text style={s.partyText}>{data.employee.email}</Text>
          <Text style={s.partyText}>
            Role: {data.employee.role}, Period: {formatReportDate(data.periodFrom)}
            {data.periodFrom !== data.periodTo ? ` to ${formatReportDate(data.periodTo)}` : ""}
          </Text>
        </View>

        <Text style={s.sectionHead}>Executive summary</Text>
        <View style={s.kpiRow}>
          {(
            [
              { value: String(data.summary.totalTasks), label: "Total tasks", color: NAVY },
              { value: String(data.summary.done), label: "Completed", color: EMERALD },
              { value: String(data.summary.inProgress), label: "In progress", color: SKY },
              { value: String(data.summary.blocked), label: "Blocked", color: AMBER },
              {
                value: data.summary.percent == null ? "N/A" : `${data.summary.percent}%`,
                label: "Completion",
                color: NAVY,
              },
              {
                value: `${data.summary.activeDays}/${data.summary.daysInPeriod}`,
                label: "Active days",
                color: NAVY,
              },
            ] as const
          ).map((kpi, i, arr) => (
            <View key={kpi.label} style={i === arr.length - 1 ? s.kpiLast : s.kpi}>
              <Text style={[s.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {data.days.length > 0 ? (
          <>
            <Text style={s.sectionHead}>Daily completion</Text>
            <View style={s.tableHead}>
              <Text style={[s.th, { width: "22%" }]}>Date</Text>
              <Text style={[s.th, { width: "12%", textAlign: "center" }]}>Tasks</Text>
              <Text style={[s.th, { width: "12%", textAlign: "center" }]}>Done</Text>
              <Text style={[s.th, { width: "12%", textAlign: "center" }]}>Active</Text>
              <Text style={[s.th, { width: "12%", textAlign: "center" }]}>Blocked</Text>
              <Text style={[s.th, { width: "14%", textAlign: "center" }]}>Rate</Text>
              <Text style={[s.th, { width: "16%", textAlign: "right" }]}>To do</Text>
            </View>
            {data.days.map((day, i) => (
              <View key={day.date} style={[s.row, i % 2 === 1 ? s.rowAlt : {}]} wrap={false}>
                <Text style={[s.td, { width: "22%" }]}>{formatReportDate(day.date)}</Text>
                <Text style={[s.td, { width: "12%", textAlign: "center" }]}>{day.total}</Text>
                <Text style={[s.td, { width: "12%", textAlign: "center", color: EMERALD }]}>{day.done}</Text>
                <Text style={[s.td, { width: "12%", textAlign: "center", color: SKY }]}>{day.inProgress}</Text>
                <Text style={[s.td, { width: "12%", textAlign: "center", color: AMBER }]}>{day.blocked}</Text>
                <Text style={[s.td, { width: "14%", textAlign: "center", fontFamily: "Helvetica-Bold" }]}>
                  {day.percent == null ? "N/A" : `${day.percent}%`}
                </Text>
                <Text style={[s.td, { width: "16%", textAlign: "right" }]}>{day.todo}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={s.empty}>
            <Text>No tasks recorded for this employee in the selected period.</Text>
          </View>
        )}

        <Text style={s.note}>
          Completion rate = completed tasks ÷ total assigned tasks in period. Active days count calendar
          days with at least one assigned task. This report is generated for internal operations use.
        </Text>

        <Footer reportId={data.reportId} page={1} />
      </Page>

      {data.days.some((d) => d.tasks.length > 0) ? (
        <Page size="A4" style={s.page} wrap>
          <Image src={logo} style={s.watermark} fixed />
          <View style={s.header}>
            <View style={s.brandRow}>
              <Image src={logo} style={s.logo} />
              <View>
                <Text style={s.brand}>VynTech Solutions</Text>
                <Text style={s.brandSub}>Task detail, {data.employee.name}</Text>
              </View>
            </View>
            <View>
              <Text style={s.contact}>{data.periodLabel}</Text>
              <Text style={s.contact}>{data.reportId}</Text>
            </View>
          </View>
          <View style={s.bar} />
          <Text style={s.sectionHead}>Task register</Text>

          {data.days.map((day) =>
            day.tasks.length ? (
              <View key={day.date} style={s.dayBlock}>
                <View style={s.dayHead} wrap={false}>
                  <Text style={s.dayTitle}>{formatReportDate(day.date)}</Text>
                  <Text style={s.dayMeta}>
                    {day.done}/{day.total} done
                    {day.percent != null ? `, ${day.percent}%` : ""}
                  </Text>
                </View>
                {day.tasks.map((t) => (
                  <View key={t.id} style={s.taskRow} wrap={false}>
                    <View style={s.taskMain}>
                      <Text style={s.taskTitle}>{t.title}</Text>
                      {t.description ? <Text style={s.taskDesc}>{t.description}</Text> : null}
                      <Text style={s.taskMeta}>Assigned by {t.createdByName}</Text>
                    </View>
                    <View style={s.badges}>
                      <Text
                        style={[
                          s.badge,
                          { color: statusColor(t.status), backgroundColor: statusBg(t.status) },
                        ]}
                      >
                        {statusLabel(t.status).toUpperCase()}
                      </Text>
                      <Text
                        style={[
                          s.badge,
                          { color: priorityColor(t.priority), backgroundColor: "#F8FAFC" },
                        ]}
                      >
                        {priorityLabel(t.priority).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null
          )}

          <Footer reportId={data.reportId} page={2} />
        </Page>
      ) : null}
    </Document>
  );
}
