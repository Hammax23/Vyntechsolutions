import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { BillingInvoiceData } from "./billing-invoice-types";
import { calculateBillingTotals, formatCad, lineAmount } from "./billing-invoice-types";
import { loadPrintLogoSrc } from "./pdf-logo";

const NAVY = "#0F2A5F";
const BLUE = "#1B4F9C";
const TEXT = "#1F2937";
const MUTED = "#64748B";
const LINE = "#E2E8F0";
const SOFT = "#F8FAFC";
const WHITE = "#FFFFFF";
const COMPANY_EMAIL = "info@vyntechsolutions.ca";
const COMPANY_WEB = "www.vyntechsolutions.ca";

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 42,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: TEXT,
    lineHeight: 1.4,
    backgroundColor: WHITE,
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 48, height: 48, marginRight: 10, objectFit: "contain" },
  brand: { fontSize: 16, fontFamily: "Helvetica", color: NAVY, letterSpacing: 0.4 },
  brandSub: { fontSize: 7.5, color: MUTED, marginTop: 2 },
  contact: { fontSize: 7.5, color: MUTED, textAlign: "right", marginBottom: 2 },
  watermark: {
    position: "absolute",
    top: 300,
    left: 170,
    width: 250,
    height: 250,
    opacity: 0.05,
    objectFit: "contain",
  },
  bar: { height: 2.5, backgroundColor: BLUE, marginBottom: 14 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 0.8 },
  status: { fontSize: 8, color: BLUE, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
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
  parties: { flexDirection: "row", marginBottom: 16 },
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
  project: { marginBottom: 12 },
  tableHead: {
    flexDirection: "row",
    backgroundColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: WHITE },
  row: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.6,
    borderBottomColor: LINE,
  },
  rowAlt: { backgroundColor: SOFT },
  td: { fontSize: 8 },
  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totals: { width: 230 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
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
  notes: { marginTop: 18 },
  noteHead: { fontSize: 8, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 4 },
  noteText: { fontSize: 8, color: TEXT, marginBottom: 3, lineHeight: 1.4 },
  verifyBox: {
    marginTop: 22,
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

export function BillingInvoicePdfDocument({
  data,
  verifyUrl,
  qrDataUrl,
}: {
  data: BillingInvoiceData;
  verifyUrl: string;
  qrDataUrl: string;
}) {
  const totals = calculateBillingTotals(data);
  const items = (data.lineItems || []).filter((i) => i.description?.trim());
  const logoSrc = loadPrintLogoSrc();

  return (
    <Document title={`Invoice ${data.invoiceNumber}`} author="VynTech Solutions Inc.">
      <Page size="A4" style={s.page}>
        <Image src={logoSrc} style={s.watermark} fixed />

        <View style={s.header}>
          <View style={s.brandRow}>
            <Image src={logoSrc} style={s.logo} />
            <View>
              <Text style={s.brand}>vyntech</Text>
              <Text style={s.brandSub}>VynTech Solutions Inc.</Text>
            </View>
          </View>
          <View>
            <Text style={s.contact}>{COMPANY_EMAIL}</Text>
            <Text style={s.contact}>{COMPANY_WEB}</Text>
          </View>
        </View>
        <View style={s.bar} />

        <View style={s.titleRow}>
          <View>
            <Text style={s.title}>INVOICE</Text>
            <Text style={s.status}>Status: {data.status}</Text>
          </View>
          <View style={s.metaBox}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Invoice #</Text>
              <Text style={s.metaValue}>{data.invoiceNumber}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Issue Date</Text>
              <Text style={s.metaValue}>{fmtDate(data.issueDate)}</Text>
            </View>
            <View style={[s.metaRow, { marginBottom: 0 }]}>
              <Text style={s.metaLabel}>Due Date</Text>
              <Text style={s.metaValue}>{fmtDate(data.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.partyLabel}>FROM</Text>
            <Text style={s.partyText}>VynTech Solutions Inc.</Text>
            <Text style={s.muted}>{COMPANY_EMAIL}</Text>
            <Text style={s.muted}>{COMPANY_WEB}</Text>
          </View>
          <View style={s.partyLast}>
            <Text style={s.partyLabel}>BILL TO</Text>
            <Text style={s.partyText}>{data.clientName}</Text>
            {data.companyName ? <Text style={s.partyText}>{data.companyName}</Text> : null}
            {data.clientEmail ? <Text style={s.muted}>{data.clientEmail}</Text> : null}
            {data.clientPhone ? <Text style={s.muted}>{data.clientPhone}</Text> : null}
            {data.clientAddress ? <Text style={s.muted}>{data.clientAddress}</Text> : null}
          </View>
        </View>

        {data.projectTitle ? (
          <View style={s.project}>
            <Text style={s.partyLabel}>PROJECT / SERVICE</Text>
            <Text style={s.partyText}>{data.projectTitle}</Text>
          </View>
        ) : null}

        <View style={s.tableHead}>
          <Text style={[s.th, { width: "46%" }]}>Description</Text>
          <Text style={[s.th, { width: "14%", textAlign: "right" }]}>Qty</Text>
          <Text style={[s.th, { width: "20%", textAlign: "right" }]}>Rate</Text>
          <Text style={[s.th, { width: "20%", textAlign: "right" }]}>Amount</Text>
        </View>
        {items.map((item, i) => (
          <View key={i} style={[s.row, i % 2 === 1 ? s.rowAlt : {}]}>
            <Text style={[s.td, { width: "46%" }]}>{item.description}</Text>
            <Text style={[s.td, { width: "14%", textAlign: "right" }]}>{item.quantity}</Text>
            <Text style={[s.td, { width: "20%", textAlign: "right" }]}>{formatCad(item.rate)}</Text>
            <Text style={[s.td, { width: "20%", textAlign: "right" }]}>{formatCad(lineAmount(item))}</Text>
          </View>
        ))}

        <View style={s.totalsWrap}>
          <View style={s.totals}>
            <View style={s.totalRow}>
              <Text style={s.muted}>Subtotal</Text>
              <Text>{formatCad(totals.subtotal)}</Text>
            </View>
            {totals.discount > 0 ? (
              <View style={s.totalRow}>
                <Text style={s.muted}>Discount ({data.discountPercent}%)</Text>
                <Text>-{formatCad(totals.discount)}</Text>
              </View>
            ) : null}
            <View style={s.totalRow}>
              <Text style={s.muted}>HST ({data.hstPercent}%)</Text>
              <Text>{formatCad(totals.hst)}</Text>
            </View>
            <View style={s.totalFinal}>
              <Text style={s.totalLabel}>Total Due</Text>
              <Text style={s.totalValue}>{formatCad(totals.total)}</Text>
            </View>
            {data.amountPaid > 0 ? (
              <>
                <View style={s.totalRow}>
                  <Text style={s.muted}>Amount Paid</Text>
                  <Text>{formatCad(data.amountPaid)}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Balance</Text>
                  <Text style={s.totalValue}>{formatCad(totals.balance)}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        <View style={s.notes}>
          {data.paymentMethod ? (
            <>
              <Text style={s.noteHead}>Payment Method</Text>
              <Text style={s.noteText}>{data.paymentMethod}</Text>
            </>
          ) : null}
          {data.paymentTerms ? (
            <>
              <Text style={s.noteHead}>Payment Terms</Text>
              <Text style={s.noteText}>{data.paymentTerms}</Text>
            </>
          ) : null}
          {data.notes ? (
            <>
              <Text style={s.noteHead}>Notes</Text>
              <Text style={s.noteText}>{data.notes}</Text>
            </>
          ) : null}
        </View>

        <View style={s.verifyBox}>
          <Image src={qrDataUrl} style={s.qrImage} />
          <View>
            <Text style={s.verifyTitle}>Verify this invoice</Text>
            <Text style={s.verifyText}>
              Scan the QR code or visit the link below to confirm this document was issued by
              VynTech Solutions.
            </Text>
            <Text style={s.verifyUrl}>{verifyUrl}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Thank you for your business.</Text>
          <Text style={s.footerText}>
            {data.invoiceNumber} · Page 1
          </Text>
        </View>
      </Page>
    </Document>
  );
}
