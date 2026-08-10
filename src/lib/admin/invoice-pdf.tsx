import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import type { InvoiceData } from "./invoice-types";
import { calculateInvoiceTotals, formatCad } from "./invoice-types";

const NAVY = "#0F2A5F";
const BLUE = "#1B4F9C";
const TEXT = "#1F2937";
const MUTED = "#64748B";
const LINE = "#E2E8F0";
const SOFT = "#F8FAFC";
const WHITE = "#FFFFFF";
const RED = "#B91C1C";
const COMPANY_EMAIL = "info@vyntechsolutions.ca";
const COMPANY_WEB = "www.vyntechsolutions.ca";

function loadLogoSrc(): string {
  const logoPath = path.join(process.cwd(), "public", "logo-print.png");
  const base64 = fs.readFileSync(logoPath).toString("base64");
  return `data:image/png;base64,${base64}`;
}

const logoSrc = loadLogoSrc();

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 42,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: TEXT,
    lineHeight: 1.4,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 42, height: 42, marginRight: 10 },
  brand: { fontSize: 14, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 0.6 },
  contact: { fontSize: 7.5, color: MUTED, textAlign: "right", marginBottom: 2 },
  watermark: {
    position: "absolute",
    top: 280,
    left: 147,
    width: 300,
    height: 300,
    opacity: 0.06,
  },
  bar: { height: 2.5, backgroundColor: BLUE, marginBottom: 14 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 0.6 },
  metaBox: {
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    padding: 10,
    width: 200,
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  metaLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 },
  metaValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  parties: { flexDirection: "row", marginBottom: 14 },
  party: { width: "48%", marginRight: "4%" },
  partyLast: { width: "48%", marginRight: 0 },
  partyLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  partyText: { fontSize: 8.5, marginBottom: 2 },
  muted: { fontSize: 8, color: MUTED },
  sectionHead: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.3,
    marginBottom: 6,
    marginTop: 8,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: WHITE },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.6,
    borderBottomColor: LINE,
  },
  rowAlt: { backgroundColor: SOFT },
  td: { fontSize: 8 },
  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  totals: { width: 220 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: NAVY,
  },
  totalLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY },
  totalValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY },
  notes: { marginTop: 16 },
  noteText: { fontSize: 8, color: TEXT, marginBottom: 3, lineHeight: 1.4 },
  verifyBox: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    padding: 10,
    backgroundColor: SOFT,
  },
  qrImage: { width: 72, height: 72, marginRight: 12 },
  verifyTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 3 },
  verifyText: { fontSize: 7, color: MUTED, marginBottom: 2, lineHeight: 1.35 },
  verifyUrl: { fontSize: 6.5, color: BLUE },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.6,
    borderTopColor: LINE,
    paddingTop: 6,
  },
  footerText: { fontSize: 6.5, color: MUTED },
});

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function LineTable({
  title,
  items,
  amountColor,
}: {
  title: string;
  items: { description: string; amount: number }[];
  amountColor?: string;
}) {
  if (!items.length) return null;
  return (
    <View>
      <Text style={s.sectionHead}>{title}</Text>
      <View style={s.tableHead}>
        <Text style={[s.th, { width: "70%" }]}>Description</Text>
        <Text style={[s.th, { width: "30%", textAlign: "right" }]}>Amount</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={[s.row, i % 2 === 1 ? s.rowAlt : {}]}>
          <Text style={[s.td, { width: "70%" }]}>{item.description}</Text>
          <Text style={[s.td, { width: "30%", textAlign: "right", color: amountColor || TEXT }]}>
            {formatCad(item.amount)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function InvoicePdfDocument({
  data,
  verifyUrl,
  qrDataUrl,
}: {
  data: InvoiceData;
  verifyUrl: string;
  qrDataUrl: string;
}) {
  const totals = calculateInvoiceTotals(data);
  const isSalary = data.expenseType === "salary";
  const title = isSalary ? "SALARY SLIP" : "EXPENSE VOUCHER";
  const earnings = data.lineItems.filter((i) => i.kind === "earning" && i.description.trim());
  const deductions = data.lineItems.filter((i) => i.kind === "deduction" && i.description.trim());
  const expenses = data.lineItems.filter((i) => i.kind === "expense" && i.description.trim());

  return (
    <Document title={`${title} ${data.documentNumber}`} author="VynTech Solutions Inc.">
      <Page size="A4" style={s.page}>
        <Image src={logoSrc} style={s.watermark} fixed />
        <View style={s.header}>
          <View style={s.brandRow}>
            <Image src={logoSrc} style={s.logo} />
            <View>
              <Text style={s.brand}>VYNTECH SOLUTIONS</Text>
            </View>
          </View>
          <View>
            <Text style={s.contact}>VynTech Solutions Inc.</Text>
            <Text style={s.contact}>{COMPANY_EMAIL}</Text>
            <Text style={s.contact}>{COMPANY_WEB}</Text>
          </View>
        </View>
        <View style={s.bar} />

        <View style={s.titleRow}>
          <View>
            <Text style={s.title}>{title}</Text>
            {isSalary && data.periodLabel ? (
              <Text style={s.muted}>Pay Period: {data.periodLabel}</Text>
            ) : data.category ? (
              <Text style={s.muted}>Category: {data.category}</Text>
            ) : null}
          </View>
          <View style={s.metaBox}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Document #</Text>
              <Text style={s.metaValue}>{data.documentNumber}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Issue Date</Text>
              <Text style={s.metaValue}>{fmtDate(data.issueDate)}</Text>
            </View>
            <View style={[s.metaRow, { marginBottom: 0 }]}>
              <Text style={s.metaLabel}>Payment</Text>
              <Text style={s.metaValue}>{data.paymentMethod || "—"}</Text>
            </View>
          </View>
        </View>

        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.partyLabel}>{isSalary ? "EMPLOYEE" : "PAYEE"}</Text>
            <Text style={s.partyText}>{data.payeeName || "—"}</Text>
            {data.payeeRole ? <Text style={s.partyText}>{data.payeeRole}</Text> : null}
            {data.payeeEmail ? <Text style={s.muted}>{data.payeeEmail}</Text> : null}
          </View>
          <View style={s.partyLast}>
            <Text style={s.partyLabel}>PAID BY</Text>
            <Text style={s.partyText}>VynTech Solutions Inc.</Text>
          </View>
        </View>

        {isSalary ? (
          <>
            <LineTable title="EARNINGS" items={earnings} />
            <LineTable title="DEDUCTIONS" items={deductions} amountColor={RED} />
            <View style={s.totalsWrap}>
              <View style={s.totals}>
                <View style={s.totalRow}>
                  <Text>Gross Earnings</Text>
                  <Text>{formatCad(totals.earnings)}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text>Total Deductions</Text>
                  <Text style={{ color: RED }}>-{formatCad(totals.deductions)}</Text>
                </View>
                <View style={s.totalFinal}>
                  <Text style={s.totalLabel}>Net Pay (CAD)</Text>
                  <Text style={s.totalValue}>{formatCad(totals.netPay)}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <LineTable title="EXPENSE ITEMS" items={expenses} />
            <View style={s.totalsWrap}>
              <View style={s.totals}>
                <View style={s.totalFinal}>
                  <Text style={s.totalLabel}>Total (CAD)</Text>
                  <Text style={s.totalValue}>{formatCad(totals.total)}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {data.notes ? (
          <View style={s.notes}>
            <Text style={s.sectionHead}>NOTES</Text>
            <Text style={s.noteText}>{data.notes}</Text>
          </View>
        ) : null}

        <View style={s.verifyBox}>
          <Image src={qrDataUrl} style={s.qrImage} />
          <View style={{ flex: 1 }}>
            <Text style={s.verifyTitle}>AUTHENTICITY CHECK</Text>
            <Text style={s.verifyText}>
              Scan the QR code or open the link below to verify this document was issued by VynTech Admin.
            </Text>
            <Text style={s.verifyText}>Issued by: VynTech Admin</Text>
            <Text style={s.verifyUrl}>{verifyUrl}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>VynTech Solutions Inc. · Confidential Internal Document</Text>
          <Text style={s.footerText}>{data.documentNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
