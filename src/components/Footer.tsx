"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import VynTechLogo from "./VynTechLogo";

type NavLink = { label: string; href: string };
type FooterGroup = { title: string; links: NavLink[] };

const SOCIAL_ICONS: Record<string, ReactNode> = {
  LinkedIn: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Facebook: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  Instagram: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  YouTube: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  X: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

const DEFAULT_TAGLINE =
  "Empowering businesses with innovative technology solutions. We deliver cutting-edge software, robust cloud architectures, and transformative digital experiences that drive growth.";

const DEFAULT_ADDRESS = "55 Village Centre Pl #200,\nMississauga, ON L4Z 1V9";

const DEFAULT_GROUPS: FooterGroup[] = [
  {
    title: "Services",
    links: [
      { label: "Web Development", href: "/services/web-development" },
      { label: "Mobile App Development", href: "/services/mobile-app-development" },
      { label: "Cloud Solutions", href: "/services/cloud-solutions" },
      { label: "AI/ML Solutions", href: "/services/ai-ml-solutions" },
      { label: "DevOps & CI/CD", href: "/services/devops-cicd" },
      { label: "UI/UX Design", href: "/services/ui-ux-design" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Healthcare & Pharmaceuticals", href: "/industries/healthcare" },
      { label: "Finance & Banking", href: "/industries/finance-banking" },
      { label: "Ecommerce & Retail", href: "/industries/ecommerce-retail" },
      { label: "Education & E-learning", href: "/industries/education" },
      { label: "Real Estate & Property", href: "/industries/real-estate" },
      { label: "Logistics & Transportation", href: "/industries/logistics" },
      { label: "Entertainment & Media", href: "/industries/entertainment-media" },
      { label: "Manufacturing & Industry", href: "/industries/manufacturing" },
      { label: "Hospitality & Travel", href: "/industries/hospitality-travel" },
      { label: "Telecommunications", href: "/industries/telecommunications" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Ecommerce Solutions", href: "/services/ecommerce-solutions" },
      { label: "Custom Software Development", href: "/services/custom-software-development" },
      { label: "SEO/Digital Marketing", href: "/services/seo-digital-marketing" },
      { label: "Maintenance & Support", href: "/services/maintenance-support" },
    ],
  },
];

const DEFAULT_LEGAL: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

const DEFAULT_SOCIAL: NavLink[] = [
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "X", href: "https://x.com" },
];

function FooterColumn({
  group,
  openSection,
  toggleSection,
}: {
  group: FooterGroup;
  openSection: string | null;
  toggleSection: (section: string) => void;
}) {
  const key = group.title.toLowerCase();
  return (
    <div className="md:col-span-2 lg:col-span-2 border-b border-gray-300 md:border-none py-2 md:py-0">
      <button
        onClick={() => toggleSection(key)}
        className="flex justify-between items-center w-full md:cursor-default"
        type="button"
      >
        <h4 className="text-[#1a1a2e] text-base font-bold md:mb-6">{group.title}</h4>
        <div className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-600">
          <svg
            className={`w-4 h-4 transition-transform ${openSection === key ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div
        className={`mt-4 md:mt-0 overflow-hidden transition-all duration-300 ${
          openSection === key ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0 md:max-h-none md:opacity-100"
        }`}
      >
        <ul className="space-y-3">
          {group.links.map((link) => (
            <li key={`${group.title}-${link.label}`}>
              <Link href={link.href || "#"} className="text-sm text-[#4A5568] hover:text-[#00A3FF] transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [tagline, setTagline] = useState(DEFAULT_TAGLINE);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [officeLabel, setOfficeLabel] = useState("Canada (Head Office)");
  const [copyrightText, setCopyrightText] = useState(
    `© ${new Date().getFullYear()} VynTech Solutions. All rights reserved.`
  );
  const [groups, setGroups] = useState<FooterGroup[]>(DEFAULT_GROUPS);
  const [legalLinks, setLegalLinks] = useState<NavLink[]>(DEFAULT_LEGAL);
  const [socialLinks, setSocialLinks] = useState<NavLink[]>(DEFAULT_SOCIAL);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/cms/content?type=navigation").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/cms/content?type=organization").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([navData, orgData]) => {
        if (cancelled) return;
        const nav = navData?.navigation as Record<string, unknown> | undefined;
        const org = orgData?.organization as Record<string, unknown> | undefined;
        if (org?.tagline) setTagline(String(org.tagline));
        if (org?.address) setAddress(String(org.address));
        if (org?.officeLabel) setOfficeLabel(String(org.officeLabel));
        if (org?.copyrightText) {
          setCopyrightText(String(org.copyrightText));
        } else if (org?.name) {
          setCopyrightText(
            `© ${new Date().getFullYear()} ${String(org.name)}. All rights reserved.`
          );
        }

        const cmsGroups = nav?.footerGroups as
          | { title?: string; links?: { label?: string; href?: string }[] }[]
          | undefined;
        if (cmsGroups?.length) {
          const mapped = cmsGroups
            .filter((g) => g.title && Array.isArray(g.links) && g.links.length)
            .map((g) => ({
              title: String(g.title),
              links: g.links!.map((l) => ({
                label: String(l.label || ""),
                href: String(l.href || "#"),
              })),
            }));
          if (mapped.length) setGroups(mapped);
        }

        const cmsLegal = nav?.legalLinks as { label?: string; href?: string }[] | undefined;
        if (cmsLegal?.length) {
          setLegalLinks(
            cmsLegal.map((l) => ({
              label: String(l.label || ""),
              href: String(l.href || "#"),
            }))
          );
        }

        const cmsSocial = nav?.socialLinks as { label?: string; href?: string }[] | undefined;
        if (cmsSocial?.length) {
          setSocialLinks(
            cmsSocial.map((l) => ({
              label: String(l.label || ""),
              href: String(l.href || "#"),
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const addressLines = address.split("\n");

  const officeHeading = (
    <h4 className="text-[#1a1a2e] text-sm font-semibold flex items-center gap-2 mb-2">
      {officeLabel}
      <Image
        src="https://flagcdn.com/w40/ca.png"
        alt="Canada Flag"
        width={20}
        height={14}
        className="object-cover rounded-sm shadow-sm"
      />
    </h4>
  );

  const socialRow = (
    <div className="flex items-center gap-3">
      {socialLinks.map((social) => (
        <Link
          key={social.label}
          href={social.href || "#"}
          className="w-10 h-10 rounded-full bg-[#374151] hover:bg-[#4B5563] text-white flex items-center justify-center transition-colors shadow-sm"
          aria-label={social.label}
          target={social.href?.startsWith("http") ? "_blank" : undefined}
          rel={social.href?.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {SOCIAL_ICONS[social.label] || <span className="text-xs">{social.label.slice(0, 1)}</span>}
        </Link>
      ))}
    </div>
  );

  return (
    <footer className="w-full bg-[#E5E5E5] pt-8 sm:pt-16 pb-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 mb-6 md:mb-16">
          <div className="md:col-span-4 lg:col-span-4 pr-0 lg:pr-12 mb-4 md:mb-0">
            <div className="mb-4 sm:mb-6">
              <VynTechLogo darkText className="!gap-2" />
            </div>

            <p className="text-[#4A5568] text-sm leading-relaxed mb-4 md:mb-8">{tagline}</p>

            <div className="hidden md:block">
              <div className="mb-8">
                {officeHeading}
                <p className="text-[#4A5568] text-sm leading-relaxed">
                  {addressLines.map((line, i) => (
                    <span key={i}>
                      {i > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </p>
              </div>
              {socialRow}
            </div>
          </div>

          {groups.map((group) => (
            <FooterColumn
              key={group.title}
              group={group}
              openSection={openSection}
              toggleSection={toggleSection}
            />
          ))}
        </div>

        <div className="md:hidden block mt-4 mb-4">
          <div className="mb-8">
            {officeHeading}
            <p className="text-[#4A5568] text-sm leading-relaxed">
              {addressLines.map((line, i) => (
                <span key={i}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
          </div>
          {socialRow}
        </div>

        <div className="border-t border-gray-300 mb-6" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href || "#"}
                className="text-xs text-[#4A5568] hover:text-[#00A3FF] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[#4A5568]">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
