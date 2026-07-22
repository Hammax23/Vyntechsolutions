import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import path from "path";
import type { QuotationData, ScopeSection } from "./quotation-types";
import { calculateQuotationTotals, formatCad } from "./quotation-types";
import { DEFAULT_SCOPE } from "./quotation-defaults";

const NAVY = "#0F2A5F";
const BLUE = "#1B4F9C";
const TEXT = "#1F2937";
const MUTED = "#64748B";
const LINE = "#E2E8F0";
const SOFT = "#F8FAFC";
const RED = "#B91C1C";
const WHITE = "#FFFFFF";

const logo = path.join(process.cwd(), "public", "logo.png");
const VALIDITY_DAYS = 15;

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 42,
    paddingHorizontal: 42,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: TEXT,
    lineHeight: 1.45,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  brandBlock: { flexDirection: "row", alignItems: "center" },
  logo: { width: 26, height: 26, marginRight: 8 },
  brandName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.8,
  },
  brandTag: { fontSize: 7, color: MUTED, marginTop: 2 },
  contact: { fontSize: 7.5, color: MUTED, textAlign: "right", marginBottom: 2 },
  accentBar: { height: 2.5, backgroundColor: BLUE, marginBottom: 14 },
  docTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  metaGrid: {
    flexDirection: "row",
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    marginBottom: 12,
  },
  metaCell: {
    width: "25%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: LINE,
  },
  metaCellLast: {
    width: "25%",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  metaLabel: {
    fontSize: 6.5,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: TEXT },
  intro: { fontSize: 8.5, color: TEXT, marginBottom: 12, lineHeight: 1.5 },
  greeting: { fontSize: 8.5, marginBottom: 4 },
  section: { marginBottom: 12 },
  sectionHead: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.4,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  overviewRow: { flexDirection: "row", marginBottom: 10 },
  overviewCard: {
    width: "48%",
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    padding: 8,
    marginRight: "4%",
  },
  overviewCardLast: {
    width: "48%",
    backgroundColor: SOFT,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    padding: 8,
    marginRight: 0,
  },
  ovLabel: { fontSize: 6.5, color: MUTED, marginBottom: 1, textTransform: "uppercase", letterSpacing: 0.4 },
  ovValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 5 },
  scopeRow: { flexDirection: "row" },
  scopeCol: { width: "33.33%", paddingRight: 8 },
  scopeTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 5,
  },
  item: { flexDirection: "row", marginBottom: 3 },
  dash: { width: 8, fontSize: 8, color: BLUE },
  itemText: { flex: 1, fontSize: 7.5, color: TEXT },
  optRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 0.6,
    borderColor: LINE,
    borderRadius: 3,
    marginBottom: 4,
    backgroundColor: SOFT,
  },
  optName: { fontSize: 8, color: TEXT, width: "70%" },
  optPrice: { fontSize: 8, fontFamily: "Helvetica-Bold", color: BLUE, textAlign: "right", width: "30%" },
  commercial: { flexDirection: "row", marginBottom: 4 },
  priceCol: { width: "56%", paddingRight: 10 },
  payCol: { width: "44%" },
  tableHead: {
    flexDirection: "row",
    backgroundColor: NAVY,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeadText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: WHITE },
  priceRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.6,
    borderBottomColor: LINE,
    backgroundColor: WHITE,
  },
  priceRowAlt: { backgroundColor: SOFT },
  priceLabel: { width: "65%", fontSize: 8, color: TEXT },
  priceValue: { width: "35%", fontSize: 8, textAlign: "right", color: TEXT },
  discount: { color: RED, fontFamily: "Helvetica-Bold" },
  totalRow: {
    flexDirection: "row",
    backgroundColor: SOFT,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopWidth: 1.5,
    borderTopColor: NAVY,
    marginTop: 1,
  },
  totalLabel: { width: "65%", fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY },
  totalValue: { width: "35%", fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY, textAlign: "right" },
  payBox: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    padding: 9,
    backgroundColor: SOFT,
  },
  payTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  payItem: { marginBottom: 7 },
  payStep: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 1 },
  payDesc: { fontSize: 7.5, color: TEXT },
  payNote: { fontSize: 7, color: MUTED, marginTop: 4, lineHeight: 1.35 },
  term: { flexDirection: "row", marginBottom: 3.5 },
  termNum: { width: 12, fontSize: 7.5, color: MUTED },
  termText: { flex: 1, fontSize: 7.5, color: TEXT },
  close: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 8,
    color: TEXT,
    lineHeight: 1.45,
  },
  sigRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 12,
  },
  sigCol: { width: "48%", marginRight: "4%" },
  sigColLast: { width: "48%", marginRight: 0 },
  sigHead: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.4,
    marginBottom: 18,
  },
  sigLine: { borderBottomWidth: 1, borderBottomColor: LINE, marginBottom: 3, minHeight: 16 },
  sigCap: { fontSize: 6.5, color: MUTED, marginBottom: 10 },
  banner: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
    padding: 5,
    marginBottom: 8,
    borderRadius: 3,
  },
  bannerText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#9A3412", textAlign: "center" },
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

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getSections(data: QuotationData): ScopeSection[] {
  if (data.scopeSections?.length) return data.scopeSections.slice(0, 3);
  if (data.includes?.length) return [{ title: "Scope of Work", items: data.includes }];
  return DEFAULT_SCOPE;
}

function OfferPage({ data, variant }: { data: QuotationData; variant: "client" | "internal" }) {
  const totals = calculateQuotationTotals(data);
  const recipient = data.customerName || "________________";
  const company = data.companyName || "";
  const sections = getSections(data);
  const preparedFor = company ? `${recipient}\n${company}` : recipient;

  return (
    <Page size="A4" style={s.page}>
      {variant === "internal" && (
        <View style={s.banner}>
          <Text style={s.bannerText}>INTERNAL COPY — NOT FOR CLIENT DISTRIBUTION</Text>
        </View>
      )}

      {/* Letterhead */}
      <View style={s.header}>
        <View style={s.brandBlock}>
          <Image src={logo} style={s.logo} />
          <View>
            <Text style={s.brandName}>VYNTECH SOLUTIONS</Text>
            <Text style={s.brandTag}>Digital Product Engineering</Text>
          </View>
        </View>
        <View>
          <Text style={s.contact}>VynTech Solutions Inc.</Text>
          <Text style={s.contact}>Canada · Lahore Delivery Center</Text>
          <Text style={s.contact}>hello@vyntechsolutions.ca</Text>
          <Text style={s.contact}>www.vyntechsolutions.ca</Text>
        </View>
      </View>
      <View style={s.accentBar} />

      <Text style={s.docTitle}>STATEMENT OF WORK & COMMERCIAL PROPOSAL</Text>

      {/* Document control */}
      <View style={s.metaGrid}>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Reference</Text>
          <Text style={s.metaValue}>{data.quoteNumber}</Text>
        </View>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Issue Date</Text>
          <Text style={s.metaValue}>{fmtDate(data.quoteDate)}</Text>
        </View>
        <View style={s.metaCell}>
          <Text style={s.metaLabel}>Valid Until</Text>
          <Text style={s.metaValue}>{addDays(data.quoteDate, VALIDITY_DAYS)}</Text>
        </View>
        <View style={s.metaCellLast}>
          <Text style={s.metaLabel}>Currency</Text>
          <Text style={s.metaValue}>CAD</Text>
        </View>
      </View>

      <Text style={s.greeting}>Prepared for: {preparedFor.replace("\n", " · ")}</Text>
      <Text style={s.intro}>
        {data.introText ||
          "Thank you for considering VynTech Solutions. This document outlines the proposed engagement scope, commercial investment, and acceptance terms."}
      </Text>

      {/* Engagement overview */}
      <View style={s.section}>
        <Text style={s.sectionHead}>1. ENGAGEMENT OVERVIEW</Text>
        <View style={s.overviewRow}>
          <View style={s.overviewCard}>
            <Text style={s.ovLabel}>Engagement Type</Text>
            <Text style={s.ovValue}>{data.projectType || data.projectTitle}</Text>
            <Text style={s.ovLabel}>Technology Stack</Text>
            <Text style={s.ovValue}>{data.technology || "—"}</Text>
          </View>
          <View style={s.overviewCardLast}>
            <Text style={s.ovLabel}>Estimated Scope</Text>
            <Text style={s.ovValue}>{data.totalPages || "—"}</Text>
            <Text style={s.ovLabel}>Estimated Timeline</Text>
            <Text style={s.ovValue}>{data.timeline || "—"}</Text>
          </View>
        </View>
      </View>

      {/* Scope */}
      <View style={s.section}>
        <Text style={s.sectionHead}>2. SCOPE OF WORK</Text>
        <View style={s.scopeRow}>
          {sections.map((section) => (
            <View key={section.title} style={s.scopeCol}>
              <Text style={s.scopeTitle}>{section.title}</Text>
              {section.items.filter(Boolean).map((item, i) => (
                <View key={i} style={s.item}>
                  <Text style={s.dash}>–</Text>
                  <Text style={s.itemText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {data.optionalServices?.filter((o) => o.service.trim()).length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionHead}>3. OPTIONAL SERVICES</Text>
          <Text style={{ fontSize: 7.5, color: MUTED, marginBottom: 6 }}>
            Available upon request. Selection does not alter the base investment unless priced and confirmed.
          </Text>
          {data.optionalServices
            .filter((o) => o.service.trim())
            .map((opt, i) => (
              <View key={i} style={s.optRow}>
                <Text style={s.optName}>{opt.service}</Text>
                <Text style={s.optPrice}>
                  {opt.amount && opt.amount > 0 ? formatCad(opt.amount) : opt.price || "Upon Request"}
                </Text>
              </View>
            ))}
        </View>
      )}

      {/* Commercials */}
      <View style={s.section}>
        <Text style={s.sectionHead}>
          {data.optionalServices?.filter((o) => o.service.trim()).length > 0
            ? "4. COMMERCIAL INVESTMENT"
            : "3. COMMERCIAL INVESTMENT"}
        </Text>
        <View style={s.commercial}>
          <View style={s.priceCol}>
            <View style={s.tableHead}>
              <Text style={[s.tableHeadText, { width: "65%" }]}>Description</Text>
              <Text style={[s.tableHeadText, { width: "35%", textAlign: "right" }]}>Amount (CAD)</Text>
            </View>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Professional Services — Development</Text>
              <Text style={s.priceValue}>{formatCad(data.baseAmount)}</Text>
            </View>
            {data.discountPercent > 0 && (
              <View style={[s.priceRow, s.priceRowAlt]}>
                <Text style={[s.priceLabel, s.discount]}>Commercial Discount ({data.discountPercent}%)</Text>
                <Text style={[s.priceValue, s.discount]}>-{formatCad(totals.discount)}</Text>
              </View>
            )}
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>Subtotal</Text>
              <Text style={s.priceValue}>{formatCad(totals.subtotal)}</Text>
            </View>
            <View style={[s.priceRow, s.priceRowAlt]}>
              <Text style={s.priceLabel}>Applicable Tax — HST ({data.hstPercent}%)</Text>
              <Text style={s.priceValue}>{formatCad(totals.hst)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total Investment</Text>
              <Text style={s.totalValue}>{formatCad(totals.total)}</Text>
            </View>
          </View>

          <View style={s.payCol}>
            <View style={s.payBox}>
              <Text style={s.payTitle}>PAYMENT SCHEDULE</Text>
              <View style={s.payItem}>
                <Text style={s.payStep}>Milestone 1 — {data.depositPercent}% Kickoff</Text>
                <Text style={s.payDesc}>{formatCad(totals.deposit)} CAD upon acceptance</Text>
              </View>
              <View style={s.payItem}>
                <Text style={s.payStep}>Milestone 2 — {100 - data.depositPercent}% Delivery</Text>
                <Text style={s.payDesc}>{formatCad(totals.balance)} CAD prior to go-live</Text>
              </View>
              <Text style={s.payNote}>
                Invoices are payable as per the schedule above. Work commencement is subject to receipt of
                Milestone 1.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Terms */}
      <View style={s.section}>
        <Text style={s.sectionHead}>
          {data.optionalServices?.filter((o) => o.service.trim()).length > 0
            ? "5. TERMS & CONDITIONS"
            : "4. TERMS & CONDITIONS"}
        </Text>
        {data.terms.map((term, i) => (
          <View key={i} style={s.term}>
            <Text style={s.termNum}>{i + 1}.</Text>
            <Text style={s.termText}>{term}</Text>
          </View>
        ))}
      </View>

      <Text style={s.close}>
        We look forward to partnering with you. Kindly sign below to confirm acceptance of this proposal
        and authorize project commencement.
      </Text>

      {/* Acceptance */}
      <View style={s.sigRow}>
        <View style={s.sigCol}>
          <Text style={s.sigHead}>FOR VYNTECH SOLUTIONS INC.</Text>
          <View style={s.sigLine} />
          <Text style={s.sigCap}>Authorized Signatory</Text>
          <View style={s.sigLine} />
          <Text style={s.sigCap}>Name / Title</Text>
          <View style={s.sigLine} />
          <Text style={s.sigCap}>Date</Text>
        </View>
        <View style={s.sigColLast}>
          <Text style={s.sigHead}>CLIENT ACCEPTANCE</Text>
          <View style={s.sigLine} />
          <Text style={s.sigCap}>Authorized Signatory</Text>
          <View style={s.sigLine} />
          <Text style={s.sigCap}>Name / Title</Text>
          <View style={s.sigLine} />
          <Text style={s.sigCap}>Date</Text>
        </View>
      </View>

      <View style={s.footer} fixed>
        <Text style={s.footerText}>Confidential — VynTech Solutions Inc.</Text>
        <Text style={s.footerText}>{data.quoteNumber}</Text>
      </View>
    </Page>
  );
}

export function QuotationPdfDocument({
  data,
  variant = "both",
}: {
  data: QuotationData;
  variant?: "client" | "internal" | "both";
}) {
  return (
    <Document
      title={`SOW ${data.quoteNumber}`}
      author="VynTech Solutions Inc."
      subject="Statement of Work & Commercial Proposal"
    >
      {(variant === "client" || variant === "both") && <OfferPage data={data} variant="client" />}
      {(variant === "internal" || variant === "both") && <OfferPage data={data} variant="internal" />}
    </Document>
  );
}
