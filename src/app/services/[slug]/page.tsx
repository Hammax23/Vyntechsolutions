"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TechStack from "@/components/TechStack";
import FAQ from "@/components/FAQ";
import { servicesData, type ServiceData } from "@/data/servicesData";

// Services Data
const allServices = [
  { slug: "web-development", name: "Web Development" },
  { slug: "mobile-app-development", name: "Mobile App Development" },
  { slug: "cloud-solutions", name: "Cloud Solutions" },
  { slug: "ai-ml-solutions", name: "AI/ML Solutions" },
  { slug: "devops-cicd", name: "DevOps & CI/CD" },
  { slug: "ui-ux-design", name: "UI/UX Design" },
  { slug: "ecommerce-solutions", name: "E-commerce Solutions" },
  { slug: "custom-software-development", name: "Custom Software Development" },
  { slug: "seo-digital-marketing", name: "SEO/Digital Marketing" },
  { slug: "maintenance-support", name: "Maintenance & Support" },
  { slug: "tax-accounting", name: "Tax & Accounting Services" },
];

// Icon component
const FeatureIcon = ({ type }: { type: string }) => {
  const iconPaths: Record<string, string> = {
    // Development
    code: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
    api: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
    iac: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5", // code

    // Devices & Mobile
    mobile: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
    apple: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3", // mobile
    android: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3", // mobile

    // Speed & Performance
    speed: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
    performance: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", // speed
    modernize: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", // speed

    // Ecommerce & Shopping
    custom: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
    store: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.999 2.999 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.999 2.999 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z",
    payment: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
    inventory: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",

    // Abstract & Platforms
    platform: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.536.57a48.053 48.053 0 01-.223 5.162c1.613-.186 3.25-.293 4.907-.315a.656.656 0 01.663.658v0c0 .355-.186.676-.401.959a1.647 1.647 0 00-.349 1.003c0 1.036 1.007 1.875 2.25 1.875s2.25-.84 2.25-1.875a1.647 1.647 0 00-.349-1.003c-.215-.283-.401-.604-.401-.959v0c0-.31.26-.555.57-.536a48.053 48.053 0 015.162.223c-.186-1.613-.293-3.25-.315-4.907a.656.656 0 01.658-.663v0c.355 0 .676.186.959.401.29.221.634.349 1.003.349 1.036 0 1.875-1.007 1.875-2.25s-.84-2.25-1.875-2.25a1.647 1.647 0 00-1.003.349c-.283.215-.604.401-.959.401v0c-.31 0-.555-.26-.536-.57a48.053 48.053 0 01.223-5.162c-1.613.186-3.25.293-4.907.315a.656.656 0 01-.663-.658v0z",
    integration: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.536.57a48.053 48.053 0 01-.223 5.162c1.613-.186 3.25-.293 4.907-.315a.656.656 0 01.663.658v0c0 .355-.186.676-.401.959a1.647 1.647 0 00-.349 1.003c0 1.036 1.007 1.875 2.25 1.875s2.25-.84 2.25-1.875a1.647 1.647 0 00-.349-1.003c-.215-.283-.401-.604-.401-.959v0c0-.31.26-.555.57-.536a48.053 48.053 0 015.162.223c-.186-1.613-.293-3.25-.315-4.907a.656.656 0 01.658-.663v0c.355 0 .676.186.959.401.29.221.634.349 1.003.349 1.036 0 1.875-1.007 1.875-2.25s-.84-2.25-1.875-2.25a1.647 1.647 0 00-1.003.349c-.283.215-.604.401-.959.401v0c-.31 0-.555-.26-.536-.57a48.053 48.053 0 01.223-5.162c-1.613.186-3.25.293-4.907.315a.656.656 0 01-.663-.658v0z", // platform
    cross: "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15",

    // Cloud & Infrastructure
    multicloud: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
    saas: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z", // cloud
    serverless: "M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z",
    container: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
    pipeline: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z",
    migrate: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",

    // Analysis & AI
    ml: "M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z",
    nlp: "M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z", // ml
    vision: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    analytics: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",

    // Screens & General
    monitor: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25",
    monitoring: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25", // monitor
    visual: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25", // monitor

    // Tools & Others
    technical: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.905-4.905M11.42 15.17l-4.905 4.905",
    content: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    security: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    support: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    research: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
    strategy: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z",
    prototype: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
    enterprise: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z",
    architecture: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z", // enterprise
    ppc: "M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5",

    default: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
  };

  const pathD = iconPaths[type] || iconPaths.default;

  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={pathD} />
    </svg>
  );
};

// Step icons for process
const STEP_ICONS: { [key: string]: JSX.Element } = {
  0: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />,
  1: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />,
  2: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />,
  3: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />,
  4: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />,
};

// Interactive Process Steps Component - Joined Card with Animation
const ProcessSteps = ({ steps }: { steps: Array<{ step: string; description: string }> }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const handleStepClick = (i: number) => {
    if (i === activeStep) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveStep(i);
      setAnimating(false);
    }, 180);
  };

  return (
    <>
      {/* Mobile Top-to-Bottom Vertical Stack (< md) */}
      <div className="flex md:hidden flex-col gap-3 max-w-md mx-auto px-2">
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          return (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isActive
                ? "bg-white border-[#0055FF]/40 shadow-xl"
                : "bg-white/80 border-gray-100 hover:border-gray-200 shadow-sm"
                }`}
            >
              <button
                onClick={() => handleStepClick(i)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base transition-colors ${isActive
                      ? "bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white shadow-md shadow-[#00E1FF]/20"
                      : "bg-gray-100 text-gray-400 group-hover:text-[#00E1FF]"
                      }`}
                  >
                    {step.step.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-base font-bold text-[#1a1a2e]">
                      {step.step}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                    ? "bg-[#0055FF] text-white rotate-180"
                    : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {isActive && (
                <div className="px-4 pb-4 pt-1 text-gray-600 text-xs leading-relaxed border-t border-gray-100 mt-1">
                  {step.description}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Horizontal Joined Step Selector (>= md) */}
      <div className="hidden md:flex flex-row justify-center gap-3 items-stretch min-h-[140px] px-2">
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          return (
            <div key={i} className="flex flex-row flex-shrink-0">
              {/* Step tile */}
              <div
                onClick={() => handleStepClick(i)}
                className={`
                  cursor-pointer transition-all duration-300 flex flex-col items-center justify-between p-4
                  w-28
                  ${isActive
                    ? "bg-gradient-to-r from-[#00E1FF] to-[#0055FF] shadow-xl shadow-[#00E1FF]/20 rounded-l-2xl rounded-r-none"
                    : "bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#00E1FF]/30 rounded-2xl group"
                  }
                `}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-white" : "bg-gray-50"}`}>
                  <svg
                    className={`w-5 h-5 transition-colors ${isActive ? "text-[#0055FF]" : "text-gray-400 group-hover:text-[#00E1FF]"}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    {STEP_ICONS[i] || STEP_ICONS[0]}
                  </svg>
                </div>
                {/* Letter */}
                <span className={`text-5xl font-black leading-none select-none mt-2 transition-colors ${isActive ? "text-white" : "text-gray-200 group-hover:text-[#00E1FF]/40"}`}>
                  {step.step.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Joined content panel — only for active step */}
              {isActive && (
                <div
                  className={`
                    bg-white rounded-r-2xl shadow-xl
                    border-t border-b border-r border-gray-100
                    flex flex-col justify-center px-6 py-5
                    min-w-[220px] max-w-[380px]
                    transition-all duration-300
                    ${animating ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"}
                  `}
                >
                  <h3 className="text-[#1a1a2e] font-bold text-xl mb-2">{step.step}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// Categorized Tech Stack Component (Tabbed navigation design)
const techCategoriesData = [
  {
    id: "frontend",
    name: "FRONTEND",
    items: [
      { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
      { name: "Vue.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
      { name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
      { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
      { name: "Tailwind", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
      { name: "Bootstrap", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
    ]
  },
  {
    id: "backend",
    name: "BACKEND",
    items: [
      { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
      { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
      { name: "Laravel", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg" },
      { name: "PHP", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
      { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
      { name: "Flask", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
    ]
  },
  {
    id: "database",
    name: "DATABASE",
    items: [
      { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
      { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
      { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
      { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
      { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
    ]
  },
  {
    id: "infra",
    name: "INFRA AND DEVOPS",
    items: [
      { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
      { name: "Azure", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
      { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
      { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
      { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
      { name: "GraphQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
    ]
  },
  {
    id: "design",
    name: "DESIGN",
    items: [
      { name: "Figma", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
    ]
  },
];


const CategorizedTechStack = () => {
  const [activeTab, setActiveTab] = useState("frontend");
  const activeCategory = techCategoriesData.find(cat => cat.id === activeTab) || techCategoriesData[0];

  return (
    <section className="py-24 bg-[#070a12] relative overflow-hidden text-white" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Title */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
            Technology Stack
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            We work with a wide range of modern, cutting-edge technologies. From programming languages and frameworks to databases, cloud platforms, and testing environments, our flexible tech stack ensures applications remain scalable, secure, and high-performing as businesses grow.
          </p>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-12">
          {/* Vertical Tabs Side */}
          <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {techCategoriesData.map((category) => {
              const isActive = category.id === activeTab;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`
                    flex-shrink-0 text-left px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wider
                    flex items-center gap-3 transition-all duration-300
                    ${isActive
                      ? "bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white shadow-lg shadow-[#00E1FF]/25"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "bg-white" : "bg-white/30"}`} />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Cards Grid Side */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {activeCategory.items.map((tech, idx) => (
                <div
                  key={idx}
                  className="bg-[#121826] border border-white/5 hover:border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group"
                >
                  <div className="w-12 h-12 relative flex items-center justify-center">
                    <Image
                      src={tech.logo}
                      alt={tech.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <span className="text-white text-xs font-semibold tracking-wide text-center">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// How We Deliver Services Accordion Component
const WebDevDeliveryModelSection = ({
  heading,
  description,
  steps,
}: {
  heading?: string;
  description?: string;
  steps?: { title: string; content: string }[];
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  // Only render if we have Strapi content for this section
  if (!heading || !steps || steps.length === 0) return null;

  const sectionDescription = description ? description.split('\n\n') : [];

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Outcome Copy */}
          <div className="lg:col-span-6">
            <span className="inline-block bg-gradient-to-r from-[#00E1FF]/10 to-[#0055FF]/10 text-[#0055FF] border border-[#00E1FF]/30 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-sm">
              Delivery Framework
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-6 leading-tight">
              {heading}
            </h2>

            <div className="w-20 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-8" />

            <div className="space-y-5 text-gray-600 text-sm sm:text-base leading-relaxed">
              {sectionDescription.map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: para.replace("VynTech Solutions", '<strong class="text-[#0055FF] font-semibold">VynTech Solutions</strong>') }} />
              ))}
            </div>
          </div>

          {/* Right Column: Expandable Accordions */}
          <div className="lg:col-span-6 space-y-4">
            {steps.map((phase, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                    ? "bg-[#141824] border-[#0055FF]/50 shadow-xl"
                    : "bg-[#1c2234] border-[#2a344d] hover:border-gray-600"
                    }`}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-base sm:text-lg font-bold text-white group-hover:text-[#00E1FF] transition-colors pr-4">
                      {phase.title}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen
                        ? "bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white rotate-45 shadow-md shadow-[#00E1FF]/30"
                        : "bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white"
                        }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-gray-300 text-sm sm:text-base leading-relaxed border-t border-white/10 pt-4">
                      {phase.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}; const cloudIncludedData = [
  {
    id: "auto-scaling",
    title: "High-Availability & Auto-Scaling",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    description: "Architecting zero-downtime, multi-region cloud infrastructures equipped with horizontal auto-scaling and intelligent load balancing to absorb traffic surges effortlessly.",
    points: [
      "Multi-AZ fault tolerance & load balancing",
      "Traffic-triggered horizontal auto-scaling",
      "99.99% Guaranteed SLA Uptime Target"
    ]
  },
  {
    id: "iac-automation",
    title: "IaC & CI/CD Release Automation",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    description: "Eliminating manual server management using Terraform, GitHub Actions, and containerization so code moves seamlessly from commit to production.",
    points: [
      "Terraform & CloudFormation state control",
      "Automated testing & deployment pipelines",
      "Instant environment duplication & rollbacks"
    ]
  },
  {
    id: "cyber-security",
    title: "Cyber Security & Regulatory Compliance",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    description: "Hardening cloud environments with zero-trust network policies, data encryption at rest and in transit, and continuous compliance audit readiness.",
    points: [
      "End-to-end KMS data encryption & IAM policies",
      "Automated WAF & DDoS threat protection",
      "SOC 2, ISO 27001 & HIPAA audit readiness"
    ]
  },
  {
    id: "finops-cost",
    title: "FinOps Spend & Cost Optimization",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Proactively managing monthly cloud bills through rightsizing idle compute nodes, savings plans, and automated resource cleanup triggers.",
    points: [
      "Savings Plans & Reserved Instance optimization",
      "Automated idle server shutdown triggers",
      "30-50% average cloud bill reduction"
    ]
  },
  {
    id: "observability",
    title: "24/7 Observability & Managed SLA",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m-9-6l2-2 2 2 4-4" />
      </svg>
    ),
    description: "Deep telemetry monitoring across metrics, logs, and APM traces to resolve latency bottlenecks before end users encounter any issues.",
    points: [
      "Real-time Prometheus & Grafana alerting",
      "Centralized log aggregation & tracing",
      "24/7 automated incident response SLAs"
    ]
  }
];

const CloudIncludedSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const current = cloudIncludedData[activeTab < 0 ? 0 : activeTab];

  return (
    <section className="py-14 sm:py-24 bg-[#f8fafc] text-[#0f172a] border-t border-b border-gray-200/80">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header matching Why Choose Us */}
        <div className="text-center mb-8 sm:mb-12 max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-2 sm:mb-3 tracking-tight">
            Enterprise Cloud <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Deliverables</span>
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-3 sm:mb-4" />
          <p className="text-gray-600 text-xs sm:text-base leading-relaxed px-2">
            Beyond basic cloud setup, we engineer production-ready cloud standards that guarantee uptime, security, and cost efficiency:
          </p>
        </div>

        {/* Mobile Accordion View (< lg) */}
        <div className="lg:hidden space-y-3">
          {cloudIncludedData.map((item, idx) => {
            const isOpen = activeTab === idx;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                  ? "bg-white border-[#0055FF]/40 shadow-lg"
                  : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                  }`}
              >
                <button
                  onClick={() => setActiveTab(isOpen ? -1 : idx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3 pr-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen
                        ? "bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white shadow-sm"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {item.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#0f172a]">
                      {item.title}
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isOpen ? "bg-[#0f172a] text-white rotate-45" : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-[#f8fafc]">
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                      {item.description}
                    </p>
                    <div className="space-y-2.5">
                      {item.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100/80 text-[#0055FF] border border-blue-200 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                          <span className="text-[#0f172a] text-xs font-bold leading-snug">
                            {pt}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop View (>= lg) */}
        <div className="hidden lg:block bg-white border border-gray-200/80 rounded-3xl p-10 lg:p-14 shadow-xl">
          <div className="grid grid-cols-12 gap-8 items-stretch">
            {/* Left Column: 5 Pill Buttons */}
            <div className="col-span-5 flex flex-col gap-3">
              {cloudIncludedData.map((item, idx) => {
                const isActive = activeTab === idx;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(idx)}
                    className={`w-full px-5 py-4 rounded-2xl border transition-all duration-300 flex items-center justify-between text-left cursor-pointer group ${isActive
                      ? "bg-[#0f172a] border-[#00E1FF]/50 shadow-md text-white"
                      : "bg-gray-50/80 border-gray-200 hover:border-[#0055FF]/40 text-gray-700 hover:text-[#0f172a]"
                      }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isActive
                          ? "bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white"
                          : "bg-gray-200/70 text-gray-700 group-hover:text-gray-900"
                          }`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-base font-bold">{item.title}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${isActive ? "text-[#00E1FF] translate-x-1" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Detail Card */}
            <div className="col-span-7 bg-[#f8fafc] border border-gray-200 text-[#0f172a] rounded-2xl p-10 flex flex-col justify-center shadow-inner">
              <h3 className="text-3xl font-extrabold text-[#0f172a] mb-4">{current?.title}</h3>
              <p className="text-gray-600 text-base leading-relaxed mb-8">{current?.description}</p>
              <div className="space-y-4">
                {current?.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100/70 text-[#0055FF] border border-blue-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-[#0f172a] text-base font-bold">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const aiMlServicesData = [
  {
    id: "chatbot",
    title: "Customer Service Automation",
    icon: (
      <svg className="w-6 h-6 text-[#0055FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 01.978-2.025c.09-.108.157-.235.18-.372a9.756 9.756 0 01-1.084-2.508C4.03 15.25 3 13.7 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    description: "Automate customer interactions using NLP and intelligent chatbots to reduce human workload, improve response times, and ensure 24/7 availability with consistent support experiences.",
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  },
  {
    id: "analytics",
    title: "Data Analytics & Business Intelligence",
    icon: (
      <svg className="w-6 h-6 text-[#0055FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m-9-6l2-2 2 2 4-4" />
      </svg>
    ),
    description: "Unlock the value of your enterprise data with advanced analytics dashboards and visualization tools that reveal performance trends and uncover growth opportunities.",
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  },
  {
    id: "process",
    title: "Process Automation & Optimization",
    icon: (
      <svg className="w-6 h-6 text-[#0055FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: "Streamline repetitive tasks and complex operational workflows using AI and ML automation to reduce manual costs, eliminate errors, and boost team output.",
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  },
  {
    id: "strategy",
    title: "AI/ML Strategy & Consulting",
    icon: (
      <svg className="w-6 h-6 text-[#0055FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625a3.375 3.375 0 00-3.75-3.375m-3.75 3.375a3.375 3.375 0 013.75-3.375m0 0V5.25m0 0A2.25 2.25 0 009.75 3h-4.5A2.25 2.25 0 003 5.25v4.5A2.25 2.25 0 005.25 12h4.5A2.25 2.25 0 0012 9.75V5.25zm0 0A2.25 2.25 0 0114.25 3h4.5A2.25 2.25 0 0121 5.25v4.5A2.25 2.25 0 0118.75 12h-4.5A2.25 2.25 0 0112 9.75V5.25z" />
      </svg>
    ),
    description: "Design and implement tailored AI roadmaps aligned with business goals, focusing on high-ROI use cases, scalable architectures, and responsible AI innovation.",
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  },
  {
    id: "predictive",
    title: "Predictive Analytics & Forecasting",
    icon: (
      <svg className="w-6 h-6 text-[#0055FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    description: "Forecast market demand, user churn, and inventory trends through custom machine learning models trained on historical data to drive proactive decision-making.",
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  },
  {
    id: "llm",
    title: "Custom LLM & Generative AI Integration",
    icon: (
      <svg className="w-6 h-6 text-[#0055FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    description: "Fine-tune and integrate state-of-the-art Large Language Models (LLMs) and Generative AI into your applications for document processing, content generation, and smart search.",
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  }
];

const AiMlServicesGridSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#f8fafc] text-[#0f172a] border-t border-b border-gray-200/80">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Left Column: Title & Intro (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0055FF] text-[10px] sm:text-xs font-extrabold tracking-wider uppercase mb-4 shadow-sm w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E1FF] animate-pulse" />
              Best AI/ML Services in Canada
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-4 leading-tight tracking-tight">
              Enterprise <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">AI & ML Capabilities</span>
            </h2>

            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-6" />

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
              From intelligent chatbots to custom predictive algorithms, we deliver end-to-end AI capabilities that drive business growth. Our artificial intelligence and machine learning solutions empower organizations to unlock hidden data patterns, automate complex operational workflows, and enhance customer experiences across all touchpoints.
            </p>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              By leveraging state-of-the-art neural networks, natural language processing, and advanced predictive analytics, we build resilient AI infrastructure tailored to your exact business objectives. Whether you are modernizing legacy operations or deploying next-generation Generative AI models, our engineering team ensures seamless scalability, robust enterprise security, and measurable ROI at every stage of development.
            </p>
          </div>

          {/* Right Column: Sticky Scroll Stacking Cards Container */}
          <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-8 relative pb-10">
            {aiMlServicesData.map((service, idx) => {
              const stickyTop = 100 + idx * 24;
              return (
                <div
                  key={service.id}
                  style={{
                    position: "sticky",
                    top: `${stickyTop}px`,
                    zIndex: 10 + idx
                  }}
                  className={`rounded-2xl sm:rounded-3xl border ${service.borderColor} ${service.bgColor} p-5 sm:p-8 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group`}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-sm border border-gray-200/80 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        {service.icon}
                      </div>
                      <h3 className="text-base sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">
                        {service.title}
                      </h3>
                    </div>

                  </div>

                  <p className="text-gray-700 text-xs sm:text-base leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

const DevOpsServicesGridSection = () => {
  const services = [
    {
      num: "01",
      title: "CI/CD Pipeline Automation",
      desc: "We design and build robust, automated CI/CD pipelines that enable you to test and deploy your code frequently and reliably with zero downtime.",
      link: true
    },
    {
      num: "02",
      title: "Infrastructure as Code (IaC)",
      desc: "We use tools like Terraform and Ansible to manage your infrastructure as code, enabling versioning, repeatability, and scalability.",
      link: true
    },
    {
      num: "03",
      title: "Cloud Automation & Management",
      desc: "We help you leverage the full power of the cloud (AWS, Azure, GCP) by automating resource provisioning, configuration, and management.",
      link: true
    },
    {
      num: "04",
      title: "Monitoring & Observability",
      desc: "We implement comprehensive monitoring and observability solutions that give you deep visibility into your systems' health and performance.",
      link: true
    },
    {
      num: "05",
      title: "DevSecOps & Security",
      desc: "We integrate security into every stage of your development lifecycle, from code scanning to compliance automation, to build more secure applications.",
      link: true
    },
    {
      num: "06",
      title: "Site Reliability Engineering (SRE)",
      desc: "We apply SRE principles to improve your systems' reliability, performance, and resilience, ensuring you meet your service level objectives (SLOs).",
      link: true
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#f8fafc] border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block bg-gradient-to-r from-[#00E1FF]/10 to-[#0055FF]/10 text-[#0055FF] border border-[#00E1FF]/30 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4 shadow-sm">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-4">
            Our Comprehensive <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">DevOps Services</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-6" />
          <p className="text-gray-600 max-w-3xl text-sm sm:text-base leading-relaxed">
            We provide end-to-end DevOps support, from initial assessment and strategy to implementation and ongoing management, helping you mature your software delivery lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#00E1FF]/40 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E1FF] to-[#0055FF] mb-4 transition-transform group-hover:scale-105 origin-left">
                {svc.num}
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-4 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00E1FF] group-hover:to-[#0055FF] transition-all">
                {svc.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {svc.desc}
              </p>
              {svc.link && (
                <button onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))} className="text-[#0055FF] font-semibold text-sm hover:text-[#00AAFF] transition-colors flex items-center gap-1">
                  Learn More
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const EcommerceHeroGraphic = () => {
  return (
    <div className="relative w-full h-[340px] sm:h-[480px] flex items-center justify-center overflow-visible py-4">
      {/* Background glows */}
      <div className="absolute w-80 h-80 sm:w-[500px] sm:h-[500px] bg-[#0055FF]/15 rounded-full blur-3xl -z-10" />
      <div className="absolute w-52 h-52 sm:w-80 sm:h-80 bg-[#00E1FF]/10 rounded-full blur-2xl -z-10 translate-x-20 -translate-y-10" />

      <svg
        viewBox="0 0 600 440"
        className="w-full max-w-[600px] h-auto drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <defs>
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#0f172a" floodOpacity="0.25" />
          </filter>
          <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0055FF" floodOpacity="0.15" />
          </filter>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E1FF" />
            <stop offset="100%" stopColor="#0055FF" />
          </linearGradient>
          <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>
        </defs>

        {/* ══ LAPTOP BASE & SCREEN ══ */}
        <g filter="url(#shadow3d)">
          {/* Laptop outer frame */}
          <rect x="70" y="50" width="460" height="290" rx="16" fill="#1e293b" />
          {/* Laptop screen */}
          <rect x="76" y="56" width="448" height="278" rx="10" fill="#f8fafc" />
        </g>

        {/* ══ E-COMMERCE UI INSIDE SCREEN ══ */}
        {/* Header / Nav */}
        <rect x="76" y="56" width="448" height="40" rx="10" fill="white" />
        {/* Store Logo */}
        <circle cx="106" cy="76" r="12" fill="url(#blueGradient)" />
        <path d="M102 74 L110 74 L108 80 L104 80 Z" fill="white" />
        <circle cx="104" cy="83" r="1.5" fill="white" />
        <circle cx="108" cy="83" r="1.5" fill="white" />
        <text x="126" y="80" fontSize="14" fontWeight="800" fill="#1e293b" fontFamily="system-ui">ShopSphere</text>

        {/* Nav Links */}
        <text x="240" y="80" fontSize="11" fontWeight="600" fill="#64748b" fontFamily="system-ui">Women</text>
        <text x="290" y="80" fontSize="11" fontWeight="600" fill="#64748b" fontFamily="system-ui">Men</text>
        <text x="330" y="80" fontSize="11" fontWeight="600" fill="#64748b" fontFamily="system-ui">Kids</text>
        <text x="370" y="80" fontSize="11" fontWeight="600" fill="#64748b" fontFamily="system-ui">Sale</text>

        {/* Cart & Search Icons */}
        <circle cx="484" cy="76" r="12" fill="#f1f5f9" />
        <circle cx="454" cy="76" r="12" fill="#f1f5f9" />
        <text x="484" y="80" fontSize="10" textAnchor="middle" fill="#64748b">🛒</text>
        <text x="454" y="80" fontSize="10" textAnchor="middle" fill="#64748b">🔍</text>
        <circle cx="490" cy="70" r="4" fill="#00E1FF" />

        {/* Hero Section of UI */}
        <rect x="96" y="110" width="408" height="120" rx="16" fill="url(#blueGradient)" />
        {/* Hero Text */}
        <text x="126" y="146" fontSize="24" fontWeight="800" fill="white" fontFamily="system-ui">Summer</text>
        <text x="126" y="172" fontSize="24" fontWeight="800" fill="white" fontFamily="system-ui">Collection</text>
        <text x="126" y="190" fontSize="11" fill="white" opacity="0.8" fontFamily="system-ui">Up to 50% off on selected items.</text>
        <rect x="126" y="202" width="90" height="26" rx="13" fill="#00E1FF" />
        <text x="171" y="219" fontSize="10" fontWeight="700" fill="#ffffff" fontFamily="system-ui" textAnchor="middle">Shop Now</text>

        {/* Hero Graphic / Model Placeholder */}
        <circle cx="430" cy="170" r="45" fill="white" opacity="0.2" />
        <rect x="390" y="140" width="80" height="90" rx="40" fill="white" opacity="0.3" />

        {/* Product Cards */}
        <text x="96" y="255" fontSize="14" fontWeight="700" fill="#1e293b" fontFamily="system-ui">Trending Now</text>

        {/* Card 1 */}
        <rect x="96" y="265" width="126" height="50" rx="8" fill="white" filter="url(#cardShadow)" />
        <rect x="104" y="273" width="34" height="34" rx="6" fill="#f1f5f9" />
        <text x="121" y="294" fontSize="16" textAnchor="middle">👟</text>
        <text x="146" y="286" fontSize="11" fontWeight="700" fill="#1e293b" fontFamily="system-ui">Running Shoes</text>
        <text x="146" y="300" fontSize="10" fontWeight="700" fill="#0055FF" fontFamily="system-ui">$129.99</text>

        {/* Card 2 */}
        <rect x="236" y="265" width="126" height="50" rx="8" fill="white" filter="url(#cardShadow)" />
        <rect x="244" y="273" width="34" height="34" rx="6" fill="#f1f5f9" />
        <text x="261" y="294" fontSize="16" textAnchor="middle">👕</text>
        <text x="286" y="286" fontSize="11" fontWeight="700" fill="#1e293b" fontFamily="system-ui">Cotton T-Shirt</text>
        <text x="286" y="300" fontSize="10" fontWeight="700" fill="#0055FF" fontFamily="system-ui">$24.99</text>

        {/* Card 3 */}
        <rect x="376" y="265" width="126" height="50" rx="8" fill="white" filter="url(#cardShadow)" />
        <rect x="384" y="273" width="34" height="34" rx="6" fill="#f1f5f9" />
        <text x="401" y="294" fontSize="16" textAnchor="middle">🎒</text>
        <text x="426" y="286" fontSize="11" fontWeight="700" fill="#1e293b" fontFamily="system-ui">Travel Backpack</text>
        <text x="426" y="300" fontSize="10" fontWeight="700" fill="#0055FF" fontFamily="system-ui">$79.99</text>

        {/* ══ LAPTOP KEYBOARD / BOTTOM ══ */}
        <path d="M40 340 L560 340 L580 354 L20 354 Z" fill="#cbd5e1" />
        <rect x="250" y="342" width="100" height="8" rx="4" fill="#94a3b8" />
        <path d="M20 354 L580 354 L580 360 C580 364, 576 368, 572 368 L28 368 C24 368, 20 364, 20 360 Z" fill="#94a3b8" />

        {/* ══ FLOATING ELEMENTS ══ */}

        {/* Floating Add to Cart Button */}
        <g filter="url(#shadow3d)" transform="translate(430, 240)">
          <rect x="0" y="0" width="120" height="44" rx="22" fill="url(#whiteGradient)" />
          <text x="60" y="26" fontSize="12" fontWeight="800" fill="#0055FF" fontFamily="system-ui" textAnchor="middle">Add to Cart 🛒</text>
        </g>

        {/* Floating Price Tag */}
        <g filter="url(#shadow3d)" transform="translate(30, 100) rotate(-15)">
          <path d="M20 10 L60 10 L70 30 L40 60 L10 30 Z" fill="#0055FF" />
          <circle cx="40" cy="22" r="4" fill="white" />
          <text x="40" y="44" fontSize="10" fontWeight="800" fill="white" fontFamily="system-ui" textAnchor="middle">SALE</text>
        </g>

        {/* Floating Shopping Bag */}
        <g filter="url(#shadow3d)" transform="translate(490, 80) rotate(10)">
          <path d="M10 20 C10 10 30 10 30 20" fill="none" stroke="#00E1FF" strokeWidth="4" />
          <rect x="0" y="20" width="40" height="40" rx="6" fill="#f0f9ff" />
          <rect x="0" y="20" width="40" height="40" rx="6" fill="#00E1FF" opacity="0.2" />
          <path d="M10 35 L30 35" stroke="#00E1FF" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Floating Stars */}
        <g style={{ animation: "pulse 3s infinite" }}>
          <path d="M70 250 L75 260 L85 265 L75 270 L70 280 L65 270 L55 265 L65 260 Z" fill="#00E1FF" />
        </g>
        <g style={{ animation: "pulse 3s infinite 1.5s" }}>
          <path d="M520 200 L524 206 L530 210 L524 214 L520 220 L516 214 L510 210 L516 206 Z" fill="#0055FF" />
        </g>

      </svg>
    </div>
  );
};

const MaintenanceHeroGraphic = () => {
  return (
    <div className="relative w-full h-[340px] sm:h-[480px] flex items-center justify-center overflow-visible py-2 sm:py-4">
      {/* Background glow */}
      <div className="absolute w-80 h-80 sm:w-[480px] sm:h-[480px] bg-[#0055FF]/15 rounded-full blur-3xl -z-10" />

      <svg viewBox="0 0 500 400" className="w-full h-auto drop-shadow-2xl hover:-translate-y-2 transition-transform duration-700">
        <defs>
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="8" dy="12" stdDeviation="8" floodOpacity="0.15" />
          </filter>
          <filter id="shadow3d_heavy" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="10" dy="15" stdDeviation="10" floodOpacity="0.25" />
          </filter>
          <mask id="wrenchMaskTop">
            <rect x="-50" y="-100" width="100" height="200" fill="white" />
            <circle cx="0" cy="-75" r="14" fill="black" />
            <rect x="-14" y="-95" width="28" height="30" fill="black" />
          </mask>
          <mask id="wrenchMaskBottom">
            <rect x="-50" y="-100" width="100" height="200" fill="white" />
            <circle cx="0" cy="75" r="14" fill="black" />
            <rect x="-14" y="65" width="28" height="30" fill="black" />
          </mask>
        </defs>

        {/* Monitor Stand */}
        <g filter="url(#shadow3d)">
          <path d="M 230 280 L 270 280 L 285 340 L 215 340 Z" fill="#cbd5e1" />
          <path d="M 230 280 L 270 280 L 285 340 L 270 340 L 230 340 Z" fill="#94a3b8" opacity="0.3" />
          <rect x="180" y="340" width="140" height="15" rx="4" fill="#e2e8f0" />
          <rect x="180" y="340" width="140" height="8" rx="4" fill="#f1f5f9" />
        </g>

        {/* Monitor Frame */}
        <g filter="url(#shadow3d)">
          <rect x="70" y="80" width="360" height="240" rx="16" fill="#1e293b" />
          <rect x="80" y="90" width="340" height="200" rx="6" fill="#020617" />

          {/* Screen Content */}
          <rect x="80" y="90" width="340" height="200" rx="6" fill="#f8fafc" />

          {/* Wireframe UI */}
          <rect x="95" y="105" width="60" height="12" rx="4" fill="#bae6fd" opacity="0.6" />
          <rect x="95" y="125" width="100" height="8" rx="2" fill="#bae6fd" opacity="0.5" />
          <rect x="95" y="140" width="140" height="8" rx="2" fill="#bae6fd" opacity="0.5" />

          {/* Wireframe Box */}
          <rect x="95" y="160" width="310" height="65" rx="4" fill="#bae6fd" opacity="0.2" />
          <line x1="95" y1="160" x2="405" y2="225" stroke="#7dd3fc" opacity="0.4" strokeWidth="2" />
          <line x1="95" y1="225" x2="405" y2="160" stroke="#7dd3fc" opacity="0.4" strokeWidth="2" />

          {/* More wireframes */}
          <rect x="95" y="240" width="150" height="12" rx="3" fill="#bae6fd" opacity="0.4" />
          <rect x="95" y="260" width="200" height="12" rx="3" fill="#bae6fd" opacity="0.4" />

          {/* Monitor bottom bezel */}
          <rect x="70" y="290" width="360" height="30" fill="#1e293b" />
          <circle cx="250" cy="305" r="4" fill="#334155" />
        </g>

        {/* Medium Gear (Top Right) */}
        <g transform="translate(290, 110)" filter="url(#shadow3d)">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="-8" y="-55" width="16" height="110" rx="3" fill="#0284c7" transform={`rotate(${i * 22.5})`} />
          ))}
          <circle cx="0" cy="0" r="46" fill="#0ea5e9" />
          <circle cx="0" cy="0" r="28" fill="#0c4a6e" />
          <circle cx="0" cy="0" r="14" fill="#0ea5e9" />
        </g>

        {/* Large Gear (Left) */}
        <g transform="translate(140, 170)" filter="url(#shadow3d)">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="-12" y="-85" width="24" height="170" rx="5" fill="#1d4ed8" transform={`rotate(${i * 22.5})`} />
          ))}
          <circle cx="0" cy="0" r="70" fill="#3b82f6" />
          <circle cx="0" cy="0" r="42" fill="#1e3a8a" />
          <circle cx="0" cy="0" r="20" fill="#3b82f6" />
        </g>

        {/* Small Gear (Bottom Left) */}
        <g transform="translate(120, 275)" filter="url(#shadow3d)">
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x="-6" y="-38" width="12" height="76" rx="2" fill="#475569" transform={`rotate(${i * 30})`} />
          ))}
          <circle cx="0" cy="0" r="30" fill="#64748b" />
          <circle cx="0" cy="0" r="18" fill="#334155" />
          <circle cx="0" cy="0" r="8" fill="#64748b" />
        </g>

        {/* Large Front Gear (Center/Bottom) */}
        <g transform="translate(220, 230)" filter="url(#shadow3d_heavy)">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="-12" y="-75" width="24" height="150" rx="5" fill="#0284c7" transform={`rotate(${i * 22.5})`} />
          ))}
          <circle cx="0" cy="0" r="62" fill="#38bdf8" />
          <circle cx="0" cy="0" r="38" fill="#082f49" />
          <circle cx="0" cy="0" r="18" fill="#38bdf8" />
        </g>

        {/* Wrench and Hammer (Crossed) */}
        <g transform="translate(320, 260)" filter="url(#shadow3d_heavy)">

          {/* Wrench (Diagonal / ) */}
          <g transform="rotate(-45)">
            <rect x="-10" y="-70" width="20" height="140" rx="6" fill="#7dd3fc" />
            <rect x="-6" y="-60" width="12" height="120" rx="3" fill="#bae6fd" />

            <circle cx="0" cy="-70" r="26" fill="#7dd3fc" mask="url(#wrenchMaskTop)" />
            <circle cx="0" cy="70" r="24" fill="#7dd3fc" mask="url(#wrenchMaskBottom)" />
          </g>

          {/* Hammer (Diagonal \ ) */}
          <g transform="rotate(45)">
            <rect x="-12" y="-50" width="24" height="130" rx="8" fill="#1e3a8a" />
            <rect x="-14" y="20" width="28" height="60" rx="4" fill="#0f172a" />

            {/* Hammer Head */}
            <rect x="-35" y="-65" width="70" height="26" rx="4" fill="#3b82f6" />
            <rect x="-35" y="-65" width="70" height="10" rx="2" fill="#60a5fa" />
            {/* Striker */}
            <rect x="-42" y="-62" width="10" height="20" rx="3" fill="#2563eb" />
            {/* Claw */}
            <polygon points="35,-65 55,-50 45,-40 35,-42" fill="#3b82f6" />
            <polygon points="35,-65 55,-50 45,-40 35,-55" fill="#60a5fa" opacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  );
};

const SeoHeroGraphic = () => {
  return (
    <div className="relative w-full h-[340px] sm:h-[480px] flex items-center justify-center overflow-visible py-2 sm:py-4">
      {/* Background glow */}
      <div className="absolute w-80 h-80 sm:w-[480px] sm:h-[480px] bg-[#00E1FF]/20 rounded-full blur-3xl -z-10" />
      <svg viewBox="0 0 400 400" className="w-full h-auto drop-shadow-2xl hover:-translate-y-2 transition-transform duration-700">
        <defs>
          <filter id="shadow3d" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="6" dy="8" stdDeviation="6" floodOpacity="0.1" />
          </filter>
          <filter id="shadow3d_heavy" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="8" dy="12" stdDeviation="8" floodOpacity="0.15" />
          </filter>
          <filter id="glassShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="15" dy="25" stdDeviation="15" floodOpacity="0.25" floodColor="#1e3a8a" />
          </filter>
        </defs>

        {/* Main Browser Window */}
        <g filter="url(#shadow3d)">
          <rect x="40" y="60" width="320" height="260" rx="16" fill="#f1f5f9" />
          <path d="M40 76 A16 16 0 0 1 56 60 L344 60 A16 16 0 0 1 360 76 L360 100 L40 100 Z" fill="#7dd3fc" />
          <path d="M40 76 A16 16 0 0 1 56 60 L344 60 A16 16 0 0 1 360 76 L360 68 A16 16 0 0 0 344 52 L56 52 A16 16 0 0 0 40 68 Z" fill="#bae6fd" />
          <circle cx="65" cy="80" r="6" fill="#0369a1" opacity="0.4" />
          <circle cx="85" cy="80" r="6" fill="#0369a1" opacity="0.4" />
          <circle cx="105" cy="80" r="6" fill="#0369a1" opacity="0.4" />
          <rect x="130" y="68" width="210" height="24" rx="12" fill="#f8fafc" />
          <circle cx="320" cy="80" r="5" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <line x1="324" y1="84" x2="330" y2="90" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Background Text Lines (Right) */}
        <g filter="url(#shadow3d)">
          <rect x="230" y="130" width="80" height="14" rx="7" fill="#0284c7" />
          <rect x="230" y="128" width="80" height="14" rx="7" fill="#38bdf8" />

          <rect x="230" y="155" width="100" height="14" rx="7" fill="#0284c7" />
          <rect x="230" y="153" width="100" height="14" rx="7" fill="#38bdf8" />

          <rect x="230" y="180" width="70" height="14" rx="7" fill="#0284c7" />
          <rect x="230" y="178" width="70" height="14" rx="7" fill="#38bdf8" />
        </g>

        {/* Tall Bar (Back Right) */}
        <g filter="url(#shadow3d)">
          <rect x="180" y="110" width="40" height="180" fill="#38bdf8" />
          <polygon points="180,110 190,100 230,100 220,110" fill="#7dd3fc" />
          <polygon points="220,110 230,100 230,280 220,290" fill="#0284c7" />
        </g>

        {/* Pill Panel UI */}
        <g filter="url(#shadow3d_heavy)">
          <rect x="170" y="215" width="160" height="60" rx="30" fill="#0284c7" />
          <rect x="170" y="212" width="160" height="60" rx="30" fill="#38bdf8" />
          <rect x="177" y="219" width="146" height="46" rx="23" fill="#bae6fd" />

          <circle cx="210" cy="242" r="10" fill="#94a3b8" />
          <circle cx="210" cy="240" r="10" fill="#f1f5f9" />

          <circle cx="245" cy="242" r="10" fill="#94a3b8" />
          <circle cx="245" cy="240" r="10" fill="#f1f5f9" />

          <circle cx="280" cy="242" r="10" fill="#94a3b8" />
          <circle cx="280" cy="240" r="10" fill="#f1f5f9" />
        </g>

        {/* Short Bar (Front Left) */}
        <g filter="url(#shadow3d)">
          <rect x="80" y="190" width="40" height="100" fill="#7dd3fc" />
          <polygon points="80,190 90,180 130,180 120,190" fill="#bae6fd" />
          <polygon points="120,190 130,180 130,280 120,290" fill="#38bdf8" />
        </g>

        {/* Medium Bar (Front Middle - Dark Blue) */}
        <g filter="url(#shadow3d_heavy)">
          <rect x="130" y="140" width="40" height="150" fill="#1d4ed8" />
          <polygon points="130,140 140,130 180,130 170,140" fill="#3b82f6" />
          <polygon points="170,140 180,130 180,280 170,290" fill="#1e3a8a" />
        </g>

        {/* Magnifying Glass 3D */}
        <g filter="url(#glassShadow)">
          <line x1="87" y1="238" x2="30" y2="295" stroke="#1e3a8a" strokeWidth="26" strokeLinecap="round" />
          <line x1="87" y1="238" x2="30" y2="295" stroke="#2563eb" strokeWidth="22" strokeLinecap="round" />
          <line x1="85" y1="236" x2="28" y2="293" stroke="#60a5fa" strokeWidth="12" strokeLinecap="round" />

          <circle cx="125" cy="200" r="55" fill="none" stroke="#1d4ed8" strokeWidth="22" />
          <circle cx="125" cy="200" r="55" fill="none" stroke="#3b82f6" strokeWidth="18" />
          <circle cx="123" cy="198" r="55" fill="none" stroke="#93c5fd" strokeWidth="10" />

          <circle cx="125" cy="200" r="46" fill="#7dd3fc" opacity="0.35" />
          <path d="M 90 175 A 46 46 0 0 1 150 165 A 50 50 0 0 0 85 190 Z" fill="#ffffff" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};

const CustomSoftwareHeroGraphic = () => {
  return (
    <div className="relative w-full max-w-[600px] mx-auto h-[340px] sm:h-[480px] flex items-center justify-center py-4">
      {/* Background glow */}
      <div className="absolute w-80 h-80 sm:w-[480px] sm:h-[480px] bg-[#0055FF]/10 rounded-full blur-3xl -z-10" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 w-full px-4 relative z-10">

        {/* 1. Browser Window */}
        <div className="flex justify-center hover:-translate-y-2 transition-transform duration-500 hover:drop-shadow-lg">
          <svg viewBox="0 0 100 100" className="w-24 sm:w-32 h-auto" overflow="visible">
            <rect x="10" y="20" width="80" height="60" rx="6" fill="#dbeafe" />
            <path d="M10 26 C10 22.7 12.7 20 16 20 L84 20 C87.3 20 90 22.7 90 26 L90 32 L10 32 Z" fill="#334155" />
            <circle cx="18" cy="26" r="2.5" fill="#ef4444" />
            <circle cx="26" cy="26" r="2.5" fill="#facc15" />
            <circle cx="34" cy="26" r="2.5" fill="#22c55e" />
            <rect x="65" y="24.5" width="15" height="3" rx="1.5" fill="#475569" />
            <text x="50" y="63" fontSize="28" fontWeight="900" fontFamily="monospace" textAnchor="middle" fill="#ef4444">&lt;/&gt;</text>
          </svg>
        </div>

        {/* 2. Gear & Wrench */}
        <div className="flex justify-center hover:-translate-y-2 transition-transform duration-500 delay-75 hover:drop-shadow-lg">
          <svg viewBox="0 0 100 100" className="w-24 sm:w-32 h-auto" overflow="visible">
            {/* Gear Body */}
            <circle cx="50" cy="50" r="30" fill="#334155" />
            <g fill="#334155">
              <rect x="40" y="10" width="20" height="20" rx="3" />
              <rect x="40" y="70" width="20" height="20" rx="3" />
              <rect x="10" y="40" width="20" height="20" rx="3" />
              <rect x="70" y="40" width="20" height="20" rx="3" />
              <g transform="rotate(45 50 50)">
                <rect x="40" y="10" width="20" height="20" rx="3" />
                <rect x="40" y="70" width="20" height="20" rx="3" />
                <rect x="10" y="40" width="20" height="20" rx="3" />
                <rect x="70" y="40" width="20" height="20" rx="3" />
              </g>
            </g>
            <circle cx="50" cy="50" r="18" fill="white" />
            {/* Wrench */}
            <path d="M42 38 C42 34 46 32 50 32 C54 32 58 34 58 38 C58 41 55 43 55 43 L55 65 C55 67 53 69 50 69 C47 69 45 67 45 65 L45 43 C45 43 42 41 42 38 Z" fill="#dbeafe" />
          </svg>
        </div>

        {/* 3. Robot with Laptop */}
        <div className="flex justify-center hover:-translate-y-2 transition-transform duration-500 delay-150 hover:drop-shadow-lg">
          <svg viewBox="0 0 100 100" className="w-24 sm:w-32 h-auto" overflow="visible">
            {/* Robot Head */}
            <rect x="25" y="15" width="50" height="35" rx="12" fill="#334155" />
            <rect x="18" y="25" width="64" height="15" rx="4" fill="#334155" />
            {/* Eyes & Smile */}
            <circle cx="36" cy="30" r="4" fill="#0ea5e9" />
            <circle cx="64" cy="30" r="4" fill="#0ea5e9" />
            <path d="M44 38 Q50 42 56 38" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Body */}
            <path d="M25 55 C25 45 75 45 75 55 L80 85 L20 85 Z" fill="#dbeafe" />
            <circle cx="25" cy="65" r="8" fill="#bfdbfe" />
            <circle cx="75" cy="65" r="8" fill="#bfdbfe" />
            {/* Laptop */}
            <rect x="25" y="55" width="50" height="28" rx="3" fill="#1e293b" />
            <rect x="22" y="83" width="56" height="4" rx="2" fill="#94a3b8" />
            <text x="50" y="75" fontSize="16" fontWeight="900" fontFamily="monospace" textAnchor="middle" fill="#ef4444">&lt;/&gt;</text>
          </svg>
        </div>

        {/* 4. Laptop with { } */}
        <div className="flex justify-center hover:-translate-y-2 transition-transform duration-500 delay-[225ms] hover:drop-shadow-lg">
          <svg viewBox="0 0 100 100" className="w-24 sm:w-32 h-auto" overflow="visible">
            <rect x="15" y="25" width="70" height="50" rx="4" fill="#334155" />
            <path d="M10 75 L90 75 C94 75 95 78 95 82 L5 82 C5 78 6 75 10 75 Z" fill="#dbeafe" />
            <path d="M40 75 L60 75 L65 82 L35 82 Z" fill="#bfdbfe" />
            <text x="50" y="62" fontSize="34" fontWeight="900" fontFamily="monospace" textAnchor="middle" fill="#0ea5e9">{`{ }`}</text>
          </svg>
        </div>

        {/* 5. Document with Gears */}
        <div className="flex justify-center hover:-translate-y-2 transition-transform duration-500 delay-[300ms] hover:drop-shadow-lg">
          <svg viewBox="0 0 100 100" className="w-24 sm:w-32 h-auto" overflow="visible">
            <path d="M25 15 L60 15 L75 30 L75 85 C75 88 72 90 69 90 L31 90 C28 90 25 88 25 85 Z" fill="#dbeafe" />
            <path d="M60 15 L60 30 L75 30 Z" fill="#93c5fd" />
            {/* Big Gear */}
            <g transform="translate(42, 55) scale(0.8)">
              <circle cx="0" cy="0" r="14" fill="#93c5fd" />
              <circle cx="0" cy="0" r="6" fill="#dbeafe" />
              {Array.from({ length: 8 }).map((_, i) => (
                <rect key={i} x="-3" y="-18" width="6" height="36" fill="#93c5fd" rx="1" transform={`rotate(${i * 45})`} />
              ))}
            </g>
            {/* Small Gear */}
            <g transform="translate(62, 72) scale(0.6)">
              <circle cx="0" cy="0" r="14" fill="#93c5fd" />
              <circle cx="0" cy="0" r="6" fill="#dbeafe" />
              {Array.from({ length: 8 }).map((_, i) => (
                <rect key={i} x="-3" y="-18" width="6" height="36" fill="#93c5fd" rx="1" transform={`rotate(${i * 45})`} />
              ))}
            </g>
          </svg>
        </div>

        {/* 6. Desktop Monitor */}
        <div className="flex justify-center hover:-translate-y-2 transition-transform duration-500 delay-[375ms] hover:drop-shadow-lg">
          <svg viewBox="0 0 100 100" className="w-24 sm:w-32 h-auto" overflow="visible">
            {/* Stand */}
            <path d="M45 75 L55 75 L60 90 L40 90 Z" fill="#bfdbfe" />
            <rect x="30" y="90" width="40" height="4" rx="2" fill="#dbeafe" />
            {/* Monitor */}
            <rect x="10" y="15" width="80" height="60" rx="4" fill="#dbeafe" />
            <rect x="14" y="19" width="72" height="45" rx="2" fill="#334155" />
            {/* Code Lines */}
            <circle cx="22" cy="27" r="2" fill="white" opacity="0.8" />
            <circle cx="22" cy="35" r="2" fill="white" opacity="0.8" />
            <circle cx="22" cy="43" r="2" fill="white" opacity="0.8" />
            <circle cx="22" cy="51" r="2" fill="white" opacity="0.8" />
            <circle cx="22" cy="59" r="2" fill="white" opacity="0.8" />

            <rect x="28" y="26" width="15" height="3" rx="1.5" fill="#ef4444" />
            <rect x="46" y="26" width="25" height="3" rx="1.5" fill="#ef4444" />

            <rect x="28" y="34" width="25" height="3" rx="1.5" fill="#0ea5e9" />
            <rect x="56" y="34" width="15" height="3" rx="1.5" fill="#0ea5e9" />

            <rect x="28" y="42" width="12" height="3" rx="1.5" fill="#facc15" />
            <rect x="43" y="42" width="28" height="3" rx="1.5" fill="#facc15" />

            <rect x="28" y="50" width="30" height="3" rx="1.5" fill="#ef4444" />
            <rect x="28" y="58" width="20" height="3" rx="1.5" fill="#facc15" />
            <rect x="51" y="58" width="20" height="3" rx="1.5" fill="#facc15" />
          </svg>
        </div>

      </div>
    </div>
  );
};

const CUSTOM_SOFTWARE_SERVICES = [
  {
    title: "Custom Software Development",
    desc: "It is a good catch to have own software to keep your audience on a single platform. So, it will be easy to target them through new services, updates and customized solutions. We offer custom and innovative software development services, from ideation to deployment tailored to objectives helping businesses grow."
  },
  {
    title: "Custom Crm Development Services",
    desc: "At VynTech Solutions, you won't get the pre-designed softwares for your new and unique business. Our in-house team of software development experts build custom solutions to meet the specific needs and requirements of a business. Unique ideas deserve unique solutions."
  },
  {
    title: "Enterprise Software Development Company",
    desc: "We have latest enterprise solutions to give robust and scalable solutions. Technology has ruled the market for years so it is an impressive decision to have software for your business. We specialize in offering full-service software development, to design, build, and deploy that function seamlessly without any problem."
  },
  {
    title: "Software Consulting Services",
    desc: "We leverage the power of software development to give smooth and secure experience that deliver captivating user experiences across platforms. Even after launching your product, we won't leave you. In fact, you will get regular updates from our company regarding updates."
  },
  {
    title: "Software Integration Services",
    desc: "With Software integration services, we give extraordinary experience by connecting your systems and apps using latest technology. These softwares can help you to reach your audience easily without focussing on the device type as we develop software for every business."
  },
  {
    title: "API Development Services",
    desc: "With our powerful API development services, we grow your online ecosystem using powerful and flexible features to develop result-oriented solutions for your specific business requirements. We have a track record of doing business honestly so you can trust us for your dream project. Your dream is our responsibility."
  }
];

const CustomSoftwareServicesSection = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-[#f8fafc] border-t border-gray-100 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        <div className={`text-center max-w-4xl mx-auto mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-4">
            Software Services <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">we provide</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-8 mx-auto" />
          <p className="text-gray-600 text-lg leading-relaxed">
            A business needs strategy as well as a tech team to know the market trends. If you have decided to start a software business, VynTech Solutions can become your roadmap to the destination. Here are the software development services that we provide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CUSTOM_SOFTWARE_SERVICES.map((srv, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-[#00E1FF]/40 hover:-translate-y-1 transition-all duration-300 relative group
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: visible ? `${idx * 100}ms` : "0ms" }}
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#f0f6ff] border border-blue-100 flex items-center justify-center text-[#0055FF] group-hover:bg-gradient-to-r group-hover:from-[#00E1FF] group-hover:to-[#0055FF] group-hover:text-white group-hover:border-transparent transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                    <line x1="2" y1="8" x2="22" y2="8"></line>
                    <circle cx="6" cy="6" r="1" fill="currentColor" stroke="none"></circle>
                    <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none"></circle>
                    <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"></circle>

                    <path d="M12 11.5v-1a.5.5 0 0 1 1 0v1a2.5 2.5 0 0 1 1.732 1h1a.5.5 0 0 1 0 1h-1A2.5 2.5 0 0 1 13 16.232v1a.5.5 0 0 1-1 0v-1a2.5 2.5 0 0 1-1.732-1h-1a.5.5 0 0 1 0-1h1A2.5 2.5 0 0 1 12 11.5z"></path>
                    <circle cx="12" cy="14" r="1"></circle>

                    <path d="M16 14.5v-.5a.5.5 0 0 1 1 0v.5A1.5 1.5 0 0 1 18 15.5h.5a.5.5 0 0 1 0 1h-.5a1.5 1.5 0 0 1-.866.5v.5a.5.5 0 0 1-1 0v-.5a1.5 1.5 0 0 1-1-.5h-.5a.5.5 0 0 1 0-1h.5a1.5 1.5 0 0 1 .866-.5z"></path>
                    <circle cx="16.5" cy="16" r=".5"></circle>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00E1FF] group-hover:to-[#0055FF] transition-all">
                {srv.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {srv.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ECOMMERCE_SERVICES = [
  {
    num: "01",
    title: "Custom Storefront Development",
    desc: "Fully tailored custom ecommerce website development aligned with your brand and sales goals.",
  },
  {
    num: "02",
    title: "Platform-Agnostic Builds",
    desc: "Flexible ecommerce site development across Shopify, WooCommerce, Magento, and custom stacks.",
  },
  {
    num: "03",
    title: "UX & Conversion Design",
    desc: "High-impact ecommerce website design and development focused on usability and checkout flow.",
  },
  {
    num: "04",
    title: "Backend & API Integrations",
    desc: "Robust web ecommerce development with ERP, CRM, inventory, and payment integrations.",
  },
  {
    num: "05",
    title: "Scalable Architecture",
    desc: "Enterprise-ready ecommerce development services built for performance and growth.",
  },
  {
    num: "06",
    title: "Optimization & Support",
    desc: "Ongoing enhancements by experienced ecommerce developers and QA specialists.",
  },
];

const EcommerceServicesSection = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f6ff 0%, #f8faff 60%, #eaf4ff 100%)" }}
    >
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E1FF]/7 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#0055FF]/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">

        {/* Header */}
        <div className={`mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E1FF]/15 to-[#0055FF]/15 border border-[#00E1FF]/25 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00E1FF] to-[#0055FF] animate-pulse" />
            <span className="text-xs font-bold text-[#0055FF] uppercase tracking-widest">Our Services</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] leading-tight mb-4">
            End-to-End{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Ecommerce</span>
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full transition-all duration-1000 delay-500 ${visible ? "w-full" : "w-0"}`}
              />
            </span>{" "}
            Development Services
          </h2>
          <p className={`text-gray-500 max-w-xl text-sm sm:text-base leading-relaxed transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            As a trusted ecommerce development company, we design, build, and optimize powerful online stores that drive revenue, improve user experience, and integrate seamlessly with your business systems.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ECOMMERCE_SERVICES.map((item, i) => (
            <div
              key={item.num}
              className={`group relative bg-white rounded-2xl p-7 border border-gray-100 overflow-hidden cursor-default
                transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 hover:border-[#00E1FF]/40
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
              `}
              style={{ transitionDelay: visible ? `${i * 90}ms` : "0ms" }}
            >
              {/* Left accent border — grows on hover */}
              <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#00E1FF] to-[#0055FF] rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

              {/* Top shimmer on hover */}
              <div className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#00E1FF] to-[#0055FF] transition-all duration-500 rounded-t-2xl" />

              {/* Background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00E1FF]/0 to-[#0055FF]/0 group-hover:from-[#00E1FF]/4 group-hover:to-[#0055FF]/6 transition-all duration-500 rounded-2xl" />

              {/* Number */}
              <div className="relative z-10 text-sm font-black bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text mb-4 tracking-wider">
                {item.num}
              </div>

              {/* Title */}
              <h3 className="relative z-10 text-base font-bold text-[#0f172a] mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00E1FF] group-hover:to-[#0055FF] transition-all">
                {item.title}
              </h3>

              {/* Description */}
              <p className="relative z-10 text-gray-500 text-sm leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                {item.desc}
              </p>

              {/* Learn More link — slides in on hover */}
              <div className="relative z-10 mt-5 overflow-hidden h-5">
                <div className="flex items-center gap-1.5 translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-xs font-bold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">Learn More</span>
                  <svg className="w-3.5 h-3.5 text-[#00E1FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


const UIUX_ENGAGEMENTS = [
  {
    title: "UX audit and recommendations",
    description:
      "An analysis of your current interface, identifying friction points and a report prioritized by impact on conversion. Delivered as a standalone engagement or built into a larger project.",
  },
  {
    title: "Wireframes and architecture",
    description:
      "Navigation structure, information hierarchy and functional mockups before the visual design. This step avoids costly revisions down the line.",
  },
  {
    title: "Interactive prototypes",
    description:
      "Clickable mockups and functional prototypes to validate the user experience before development. Quick tests and low-cost iterations.",
  },
  {
    title: "Full UI/UX design",
    description:
      "End-to-end design covering research, wireframes, visual UI, design systems, and handoff-ready assets. The complete package for a polished, pixel-perfect product.",
  },
];

const UiUxEngagementsSection = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for scroll-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f6ff 0%, #f8faff 60%, #eaf4ff 100%)" }}
    >
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#00E1FF]/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#0055FF]/6 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">

        {/* Animated Heading */}
        <div
          className={`mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E1FF]/15 to-[#0055FF]/15 border border-[#00E1FF]/25 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00E1FF] to-[#0055FF] animate-pulse" />
            <span className="text-xs font-bold text-[#0055FF] uppercase tracking-widest">UI/UX Engagements</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] leading-tight">
            Four types of UI/UX{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">
                engagements
              </span>
              {/* Animated underline */}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full transition-all duration-1000 delay-500 ${visible ? "w-full" : "w-0"
                  }`}
              />
            </span>{" "}
            we run
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="relative">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {UIUX_ENGAGEMENTS.map((item, i) => (
              <div
                key={i}
                className={`group relative bg-white rounded-2xl p-7 shadow-sm border border-gray-100 overflow-hidden cursor-default
                  transition-all duration-500
                  hover:shadow-xl hover:-translate-y-1.5 hover:border-[#00E1FF]/40
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                `}
                style={{ transitionDelay: visible ? `${150 + i * 100}ms` : "0ms" }}
              >
                {/* Shimmer gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00E1FF]/0 to-[#0055FF]/0 group-hover:from-[#00E1FF]/5 group-hover:to-[#0055FF]/8 transition-all duration-500 rounded-2xl" />

                {/* Top accent bar — grows in on hover */}
                <div className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-t-2xl transition-all duration-500" />

                {/* Number badge */}
                <div className="relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E1FF]/10 to-[#0055FF]/10 group-hover:from-[#00E1FF]/20 group-hover:to-[#0055FF]/20 flex items-center justify-center mb-5 transition-all duration-300">
                  <span className="text-sm font-black bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="relative z-10 text-base font-bold text-[#0f172a] mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00E1FF] group-hover:to-[#0055FF] transition-all">
                  {item.title}
                </h3>
                <p className="relative z-10 text-gray-500 text-sm leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                  {item.description}
                </p>

                {/* Bottom arrow — slides in on hover */}
                <div className="relative z-10 mt-5 flex items-center gap-1.5 overflow-hidden">
                  <span className="text-xs font-semibold text-[#0055FF] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    Learn more
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-[#00E1FF] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 delay-75 opacity-0 group-hover:opacity-100"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const UiUxHeroGraphic = () => {

  return (
    <div className="relative w-full h-[340px] sm:h-[480px] flex items-center justify-center overflow-visible py-2 sm:py-4">
      {/* Background Glow */}
      <div className="absolute w-64 sm:w-96 h-64 sm:h-96 bg-[#00E1FF]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute w-48 sm:w-72 h-48 sm:h-72 bg-[#0055FF]/20 rounded-full blur-2xl -z-10 translate-x-10" />

      {/* Container */}
      <div className="relative w-full max-w-lg h-full flex items-center justify-center scale-[0.70] min-[390px]:scale-[0.80] sm:scale-100 origin-center">

        {/* ── SCREEN 1: Left dark blue tall screen (tilted -rotate-6) ── */}
        <div className="absolute left-0 top-6 w-[175px] h-[320px] bg-[#0d1b2e] rounded-2xl p-1.5 shadow-2xl border border-[#00E1FF]/20 -rotate-6 z-10">
          <div className="w-full h-full bg-gradient-to-b from-[#0f2744] to-[#0a1929] rounded-xl overflow-hidden p-3 flex flex-col gap-2 text-white">
            {/* Top bar */}
            <div className="flex justify-between items-center">
              <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[8px]">✦</div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E1FF]" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>
            {/* Headline skeleton */}
            <div className="mt-1 space-y-1.5">
              <div className="w-full h-2 bg-white/70 rounded-full" />
              <div className="w-4/5 h-2 bg-white/60 rounded-full" />
              <div className="w-3/5 h-2 bg-white/50 rounded-full" />
            </div>
            {/* Blue button */}
            <div className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white text-[7px] font-bold px-3 py-1 rounded-lg w-fit mt-1">Get Started</div>
            {/* Icon list */}
            <div className="space-y-1.5 mt-1">
              {["📐 Wireframes", "🎨 UI Design", "🔁 Prototyping", "✅ Testing"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00E1FF]/40 shrink-0" />
                  <div className="text-[7px] text-white/70">{t}</div>
                </div>
              ))}
            </div>
            {/* Small card */}
            <div className="mt-auto bg-white/10 rounded-lg p-1.5">
              <div className="w-3/4 h-1.5 bg-white/40 rounded-full mb-1" />
              <div className="w-1/2 h-1 bg-white/25 rounded-full" />
            </div>
          </div>
        </div>

        {/* ── SCREEN 2: Center tall desktop mockup (slightly tilted) ── */}
        <div className="absolute left-[105px] top-0 w-[220px] h-[355px] bg-white rounded-2xl p-1.5 shadow-2xl border border-gray-200 -rotate-1 z-20">
          <div className="w-full h-full bg-[#f8faff] rounded-xl overflow-hidden flex flex-col text-gray-800">
            {/* Browser chrome */}
            <div className="bg-[#0a1929] px-2 py-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <div className="flex-1 mx-1.5 bg-white/10 rounded-full h-2 flex items-center px-1.5">
                <div className="text-[5px] text-white/40">yoursite.com</div>
              </div>
            </div>
            {/* Nav bar */}
            <div className="flex gap-3 px-3 py-1.5 border-b border-gray-100 text-[7px] text-gray-500">
              <span className="font-bold text-[#0055FF]">Home</span>
              <span>About</span>
              <span>Services</span>
              <span>Contact</span>
              <div className="ml-auto bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white px-2 py-0.5 rounded-full text-[6px] font-bold">Hire Us</div>
            </div>
            {/* Hero banner */}
            <div className="bg-gradient-to-r from-[#0a1929] to-[#0f2744] mx-2 mt-1.5 rounded-xl p-3 text-white">
              <div className="w-4/5 h-1.5 bg-white/70 rounded-full mb-1" />
              <div className="w-3/5 h-1.5 bg-white/50 rounded-full mb-2" />
              <div className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-[6px] font-bold px-2 py-0.5 rounded-lg w-fit">Discover More →</div>
            </div>
            {/* Cards row */}
            <div className="flex gap-1.5 px-2 mt-2">
              {["💬", "📊", "🎯"].map((ic, i) => (
                <div key={i} className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 p-1.5 flex flex-col items-center gap-1">
                  <div className="text-[10px]">{ic}</div>
                  <div className="w-full h-1 bg-gray-200 rounded-full" />
                  <div className="w-3/4 h-1 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
            {/* Content rows */}
            <div className="px-2 mt-2 space-y-1.5 flex-1">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-lg bg-[#00E1FF]/10 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full" />
                  <div className="w-4/5 h-1 bg-gray-100 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-lg bg-[#0055FF]/10 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="w-3/4 h-1.5 bg-gray-200 rounded-full" />
                  <div className="w-1/2 h-1 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCREEN 3: Right tall phone (tilted rotate-6) ── */}
        <div className="absolute right-0 top-3 w-[155px] h-[310px] bg-white rounded-[32px] p-1.5 shadow-2xl border border-gray-200 rotate-6 z-30">
          <div className="w-full h-full bg-[#f0f4f8] rounded-[26px] overflow-hidden flex flex-col text-gray-800">
            {/* Notch */}
            <div className="w-10 h-2.5 bg-black rounded-full mx-auto mt-2 mb-1.5" />
            {/* Profile card */}
            <div className="mx-2 bg-gradient-to-r from-[#0a1929] to-[#0f2744] rounded-xl p-2 text-white">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px]">👤</div>
                <div>
                  <div className="text-[7px] font-bold">UI Designer</div>
                  <div className="text-[6px] opacity-60">VynTech Studio</div>
                </div>
              </div>
              <div className="flex gap-1 mt-0.5">
                {["★", "★", "★", "★", "★"].map((s, i) => (
                  <span key={i} className="text-[#00E1FF] text-[8px]">{s}</span>
                ))}
              </div>
            </div>
            {/* Feature list */}
            <div className="px-2 mt-2 space-y-1.5">
              {["Responsive Design", "Design Systems", "User Research", "Prototyping"].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#0055FF] shrink-0" />
                  <div className="text-[7px] text-gray-600">{t}</div>
                </div>
              ))}
            </div>
            {/* Bottom CTA */}
            <div className="mt-auto mx-2 mb-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white text-[7px] font-bold py-1.5 rounded-xl text-center">
              View Portfolio
            </div>
          </div>
        </div>

        {/* ── FLOATING CARD: Popup design card ── */}
        <div className="absolute left-[95px] bottom-2 w-[130px] bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-40 rotate-2">
          <div className="text-[7px] font-bold text-[#0a1929] mb-1.5">Design Score</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#00E1FF] flex items-center justify-center text-[9px] font-black text-[#0055FF]">98</div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full" />
                <span className="text-[6px] text-gray-400">UX</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1 bg-[#0055FF] rounded-full" style={{ width: "85%" }} />
                <span className="text-[6px] text-gray-400">UI</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FLOATING BADGE: Blue accent ── */}
        <div className="absolute right-2 bottom-8 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white text-[7px] font-bold px-2.5 py-1.5 rounded-xl shadow-lg shadow-[#00E1FF]/25 z-40 -rotate-3">
          ✨ Pixel Perfect
        </div>

      </div>
    </div>
  );
};



const DevOpsHeroGraphic = () => {
  return (
    <div className="relative w-full flex items-center justify-center select-none py-10 sm:py-16">
      <svg
        viewBox="0 0 600 500"
        className="w-full max-w-[550px] h-auto drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <defs>
          {/* Cloud Gradient */}
          <linearGradient id="cloudGrad" x1="30%" y1="10%" x2="70%" y2="90%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Loop Gradients */}
          <linearGradient id="leftLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="rightLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          {/* Purple Circle Border Gradient */}
          <linearGradient id="circleBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id="circleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="12" stdDeviation="10" floodColor="#090d16" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Decorative background stars/glows */}
        <g opacity="0.3" fill="#38bdf8">
          <circle cx="100" cy="80" r="5" />
          <circle cx="480" cy="60" r="3" />
          <circle cx="500" cy="420" r="4" />
          <circle cx="80" cy="400" r="3" />
        </g>

        {/* The Cloud (Background) */}
        <path
          d="M 120,320 
             C 50,320 10,275 10,210 
             C 10,145 65,110 110,115 
             C 125,50 190,10 270,10 
             C 365,10 435,65 455,140 
             C 515,140 560,185 560,240 
             C 560,295 515,340 455,340 
             L 120,340 Z"
          fill="url(#cloudGrad)"
        />

        {/* The White Circle (Foreground) with shadow and purple border */}
        <circle
          cx="360"
          cy="310"
          r="135"
          fill="#ffffff"
          stroke="url(#circleBorderGrad)"
          strokeWidth="14"
          filter="url(#circleShadow)"
        />

        {/* Stylized Interlocking Infinity/DevOps Logo */}
        <g transform="translate(360, 310) scale(1.15)">
          <path
            d="M 0,0 
               C -25,-35 -65,-35 -65,0 
               C -65,35 -25,35 0,0 
               C 25,-35 65,-35 65,0 
               C 65,35 25,35 0,0 Z"
            fill="none"
            stroke="url(#leftLoopGrad)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};


const AiMlHeroGraphic = () => {
  return (
    <div className="relative w-full h-[340px] sm:h-[480px] flex items-center justify-center overflow-visible py-2 sm:py-4">
      {/* Deep Cyber Mesh Glow Background */}
      <div className="absolute w-[300px] h-[300px] sm:w-[460px] sm:h-[460px] bg-gradient-to-tr from-[#00E1FF]/25 via-purple-600/30 to-pink-600/20 rounded-full blur-3xl -z-10 animate-pulse" />

      {/* Futuristic Orbiting Mesh Rings */}
      <div className="absolute w-[240px] h-[240px] sm:w-[380px] sm:h-[380px] rounded-full border border-[#00E1FF]/30 border-dashed animate-[spin_50s_linear_infinite]" />
      <div className="absolute w-[180px] h-[180px] sm:w-[280px] sm:h-[280px] rounded-full border border-purple-500/30 border-dashed animate-[spin_35s_linear_infinite_reverse]" />

      {/* SVG Neural Connections Background */}
      <svg className="absolute w-full h-full inset-0 pointer-events-none" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="130" fill="none" stroke="#00E1FF" strokeWidth="1" strokeDasharray="3 6" opacity="0.35" className="hidden sm:block" />
        <circle cx="200" cy="200" r="95" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 5" opacity="0.4" className="hidden sm:block" />
        <circle cx="200" cy="200" r="90" fill="none" stroke="#00E1FF" strokeWidth="1" strokeDasharray="3 6" opacity="0.35" className="sm:hidden" />
        <circle cx="200" cy="200" r="65" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 5" opacity="0.4" className="sm:hidden" />

        {/* Pulsing Neural Lines */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 200 + 40 * Math.cos(rad);
          const y1 = 200 + 40 * Math.sin(rad);
          const x2 = 200 + 130 * Math.cos(rad);
          const y2 = 200 + 130 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 2 === 0 ? "#00E1FF" : "#a855f7"}
              strokeWidth="1.2"
              opacity="0.3"
              strokeDasharray="2 4"
            />
          );
        })}
      </svg>

      {/* Centerpiece Neon AI / ML Glowing Card Badge */}
      <div className="relative z-20 px-8 py-5 sm:px-14 sm:py-9 rounded-3xl bg-gradient-to-br from-[#0c0d28]/90 via-[#161238]/90 to-[#280c42]/90 backdrop-blur-xl border border-white/20 shadow-[0_0_60px_rgba(0,225,255,0.45)] flex flex-col items-center justify-center group hover:scale-105 transition-transform duration-500">
        {/* Inner Glowing Backdrop Light */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#00E1FF]/10 via-purple-500/15 to-pink-500/10 blur-xl pointer-events-none" />

        <div className="relative flex items-center gap-2 sm:gap-3">
          <span className="text-4xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00E1FF] to-[#e0aaff] tracking-wider drop-shadow-[0_0_25px_rgba(0,225,255,0.9)]">
            AI
          </span>
          <span className="text-3xl sm:text-6xl font-light text-[#00E1FF] opacity-90 drop-shadow-[0_0_20px_rgba(0,225,255,0.7)]">
            /
          </span>
          <span className="text-4xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#c084fc] to-pink-400 tracking-wider drop-shadow-[0_0_25px_rgba(192,132,252,0.9)]">
            ML
          </span>
        </div>

        <div className="mt-1.5 sm:mt-3 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center gap-2">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00E1FF] animate-ping" />
          <span className="text-[9px] sm:text-xs font-bold text-white tracking-widest uppercase">
            NEURAL MODELS & INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Floating AI Tech Badges */}
      {/* 1. OpenAI (Top Left) */}
      <div className="absolute top-2 sm:top-6 left-4 sm:left-10 z-30 group cursor-pointer">
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/90 backdrop-blur-md shadow-xl border border-white/60 flex items-center gap-2 group-hover:scale-110 transition-transform">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] sm:text-xs font-black text-gray-900">GPT-4o / LLM</span>
        </div>
      </div>

      {/* 2. PyTorch (Top Right) */}
      <div className="absolute top-2 sm:top-6 right-4 sm:right-10 z-30 group cursor-pointer">
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/90 backdrop-blur-md shadow-xl border border-white/60 flex items-center gap-2 group-hover:scale-110 transition-transform">
          <span className="text-xs">🔥</span>
          <span className="text-[10px] sm:text-xs font-black text-gray-900">PyTorch</span>
        </div>
      </div>

      {/* 3. Computer Vision (Bottom Left) */}
      <div className="absolute bottom-2 sm:bottom-6 left-4 sm:left-10 z-30 group cursor-pointer">
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/90 backdrop-blur-md shadow-xl border border-white/60 flex items-center gap-2 group-hover:scale-110 transition-transform">
          <span className="text-xs">👁️</span>
          <span className="text-[10px] sm:text-xs font-black text-gray-900">Computer Vision</span>
        </div>
      </div>

      {/* 4. Real-time Inference (Bottom Right) */}
      <div className="absolute bottom-2 sm:bottom-6 right-4 sm:right-10 z-30 group cursor-pointer">
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/90 backdrop-blur-md shadow-xl border border-white/60 flex items-center gap-2 group-hover:scale-110 transition-transform">
          <span className="text-xs">⚡</span>
          <span className="text-[10px] sm:text-xs font-black text-[#0055FF]">Real-Time Inference</span>
        </div>
      </div>
    </div>
  );
};

const CloudOrbitHeroGraphic = () => {
  return (
    <div className="relative w-full h-[340px] sm:h-[480px] flex items-center justify-center overflow-visible py-2 sm:py-4">
      {/* Background Cyber Glow */}
      <div className="absolute w-96 h-96 bg-gradient-to-tr from-[#00E1FF]/20 via-[#0055FF]/20 to-purple-600/10 rounded-full blur-3xl -z-10 animate-pulse" />

      {/* Outer Orbit Line Circle */}
      <div className="absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full border border-[#00E1FF]/30 border-dashed animate-[spin_60s_linear_infinite]" />
      <div className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] rounded-full border border-[#0055FF]/40 border-dashed animate-[spin_40s_linear_infinite_reverse]" />

      {/* SVG Circuit Lines background */}
      <svg className="absolute w-full h-full inset-0 pointer-events-none" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="140" fill="none" stroke="#00E1FF" strokeWidth="1" strokeDasharray="4 6" opacity="0.3" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="#0055FF" strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 200 + 45 * Math.cos(rad);
          const y1 = 200 + 45 * Math.sin(rad);
          const x2 = 200 + 140 * Math.cos(rad);
          const y2 = 200 + 140 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#00E1FF"
              strokeWidth="1.5"
              opacity="0.35"
              strokeDasharray="2 4"
            />
          );
        })}
      </svg>

      {/* Center Glowing Cloud Badge */}
      <div className="relative z-20 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#00E1FF] via-[#0055FF] to-[#0a1128] p-1 shadow-[0_0_50px_rgba(0,225,255,0.6)] flex items-center justify-center animate-pulse">
        <div className="w-full h-full rounded-full bg-[#0d1428] flex flex-col items-center justify-center border border-white/30 text-white shadow-inner">
          <svg className="w-12 h-12 text-[#00E1FF] drop-shadow-[0_0_10px_rgba(0,225,255,0.8)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
          <span className="text-[9px] font-extrabold tracking-widest text-[#00E1FF] uppercase mt-1">
            CLOUD ARCH
          </span>
        </div>
      </div>

      {/* 8 Orbiting Badges around the circle */}
      {/* 1. AWS (Top: 0deg) */}
      <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 group cursor-pointer">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-xs font-black text-[#FF9900] tracking-tighter">aws</span>
        </div>
      </div>

      {/* 2. Azure (Top-Right: 45deg) */}
      <div className="absolute top-14 sm:top-16 right-10 sm:right-14 z-30 group cursor-pointer">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7 text-[#0089D6]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 19.5h6.5L12 12l3.5 7.5H22L12 2z" />
          </svg>
        </div>
      </div>

      {/* 3. Google Cloud (Right: 90deg) */}
      <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-30 group cursor-pointer">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#4285F4" />
          </svg>
        </div>
      </div>

      {/* 4. Oracle Cloud (Bottom-Right: 135deg) */}
      <div className="absolute bottom-14 sm:bottom-16 right-10 sm:right-14 z-30 group cursor-pointer">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 border-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-[10px] font-extrabold text-[#C7254E]">ORACLE</span>
        </div>
      </div>

      {/* 5. Cloudflare (Bottom: 180deg) */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 group cursor-pointer">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7 text-[#F38020]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
        </div>
      </div>

      {/* 6. Docker (Bottom-Left: 225deg) */}
      <div className="absolute bottom-14 sm:bottom-16 left-10 sm:left-14 z-30 group cursor-pointer">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7 text-[#2496ED]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 3h2v2h-2V3zm-3 0h2v2h-2V3zM7 3h2v2H7V3zm6 3h2v2h-2V6zm-3 0h2v2h-2V6zM7 6h2v2H7V6zm-3 0h2v2H4V6zm9 3h2v2h-2V9zm-3 0h2v2h-2V9zm-3 0h2v2H7V9zm-3 0h2v2H4V9zm-3 0h2v2H1V9zm18.5 2.5c-.5.3-1.1.4-1.7.5-.1-.4-.3-.8-.5-1.1.8-.3 1.4-.8 1.8-1.5.4.6 1 1.2 1.8 1.5-.2.4-.4.7-.5 1.1-.6-.1-1.2-.2-1.7-.5zM.2 13c.2 2.6 1.9 4.6 4.3 5.4 3.7 1.3 7.8.4 10.7-2.1 1.4-.1 2.7-.6 3.8-1.5 1-.8 1.6-2 1.8-3.2.1-.8 0-1.6-.3-2.3H.2v3.7z" />
          </svg>
        </div>
      </div>

      {/* 7. Kubernetes (Left: 270deg) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-30 group cursor-pointer">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7 text-[#326CE5]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3l6.7 3.7-2.5 1.4L12 7.1 7.8 9.4 5.3 8 12 4.3zm-7 5l3 1.7v3.5l-3 1.7V9.3zm8.5 9.7l-6.5-3.6 2.5-1.4 4 2.3 4-2.3 2.5 1.4-6.5 3.6zm5.5-4.4l-3-1.7V9.3l3-1.7v5.4z" />
          </svg>
        </div>
      </div>

      {/* 8. Terraform (Top-Left: 315deg) */}
      <div className="absolute top-14 sm:top-16 left-10 sm:left-14 z-30 group cursor-pointer">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white p-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 border-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-[10px] font-extrabold text-[#844FBA]">TERRA</span>
        </div>
      </div>

      {/* Floating Status Badges */}
      <div className="absolute -top-2 -right-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl px-3.5 py-2 flex items-center gap-2.5 border border-white/50 z-40">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-xs font-bold text-gray-900">99.99% SLA Uptime</span>
      </div>

      <div className="absolute -bottom-2 -left-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl px-3.5 py-2 flex items-center gap-2.5 border border-white/50 z-40">
        <span className="text-xs">⚡</span>
        <span className="text-xs font-bold text-[#0055FF]">Multi-Cloud Sync</span>
      </div>
    </div>
  );
};

const MobileDevServicesTabSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: "ios",
      name: "iOS App Development",
      highlightText: "iOS app development services",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.07.08 2.15-.57 2.81-1.37z" />
        </svg>
      ),
      detailIcon: (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.07.08 2.15-.57 2.81-1.37z" />
        </svg>
      ),
      title: "iOS App Development",
      description: "As a mobile application development company in Canada, we provide iOS app development services using Swift and SwiftUI, with a focus on performance, privacy, and smooth App Store approvals.",
      points: [
        {
          title: "System integration",
          text: "iOS builds are developed to connect with CRMs and ERPs. This helps Canadian businesses to keep processes linked instead of relying on disconnected tools."
        },
        {
          title: "Scalable setup",
          text: "Modular codebases and CI/CD pipelines are built in from the start, making it easier for enterprises to handle rising traffic without constant rebuilds."
        }
      ]
    },
    {
      id: "android",
      name: "Android App Development",
      highlightText: "Android app development services",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1s1-.45 1-1v-3h4v3c0 .55.45 1 1 1s1-.45 1-1v-3h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zM15.53 2.16l1.3-1.3c.2-.2.2-.51 0-.71a.498.498 0 0 0-.7 0l-1.47 1.48C13.68 1.23 12.37 1 11 1s-2.68.23-3.66.63L5.87.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C4.58 3.32 3 5.48 3 8h16c0-2.52-1.58-4.68-3.47-5.84zM7 5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
        </svg>
      ),
      detailIcon: (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1s1-.45 1-1v-3h4v3c0 .55.45 1 1 1s1-.45 1-1v-3h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zM15.53 2.16l1.3-1.3c.2-.2.2-.51 0-.71a.498.498 0 0 0-.7 0l-1.47 1.48C13.68 1.23 12.37 1 11 1s-2.68.23-3.66.63L5.87.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C4.58 3.32 3 5.48 3 8h16c0-2.52-1.58-4.68-3.47-5.84zM7 5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
        </svg>
      ),
      title: "Android App Development",
      description: "We provide native Android app development services using Kotlin and Jetpack Compose, delivering fast, scalable, and secure Android applications tailored for the Canadian market.",
      points: [
        {
          title: "Hardware & OS optimization",
          text: "Android apps are fine-tuned for diverse hardware configurations, battery efficiency, and seamless background processing."
        },
        {
          title: "Google Play compliance",
          text: "Strict adherence to Google Play Store security guidelines and Vitals benchmarks ensures high search visibility and seamless releases."
        }
      ]
    },
    {
      id: "react-native",
      name: "React Native App Development",
      highlightText: "React Native app development",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(0 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ),
      detailIcon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(0 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
      title: "React Native App Development",
      description: "We engineer high-performance cross-platform apps using React Native, giving your enterprise full native capabilities combined with modern React developer velocity.",
      points: [
        {
          title: "Native component architecture",
          text: "React Native bridges JavaScript logic directly to native iOS and Android components for zero compromise on speed or feel."
        },
        {
          title: "Over-the-air updates",
          text: "Deploy immediate patch updates and feature enhancements directly to users without waiting for app store review cycles."
        }
      ]
    },
    {
      id: "web-app",
      name: "Web App Development",
      highlightText: "mobile web app development",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 9h16" />
          <path d="M8 6.5h.01M11 6.5h.01" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      ),
      detailIcon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 9h16" />
          <path d="M8 6.5h.01M11 6.5h.01" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      ),
      title: "Web App Development",
      description: "We build Progressive Web Applications (PWAs) and mobile-first web software that deliver native-like responsiveness, offline access, and fast loading speeds.",
      points: [
        {
          title: "Cross-browser accessibility",
          text: "Responsive web apps that run seamlessly across all mobile browsers without requiring store downloads."
        },
        {
          title: "Offline capability",
          text: "Service workers and local storage allow users to access critical features even in low or no network environments."
        }
      ]
    }
  ];

  const current = tabs[activeTab];

  const renderDescription = (desc: string, highlight: string) => {
    const parts = desc.split(highlight);
    if (parts.length < 2) return desc;
    return (
      <>
        {parts[0]}
        <span className="underline font-semibold text-white decoration-[#00E1FF]/80 underline-offset-4">
          {highlight}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="py-20 bg-[#08080b] text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-14 px-2">
          <span className="inline-block bg-gradient-to-r from-[#00E1FF]/10 to-[#0055FF]/10 text-[#00E1FF] border border-[#00E1FF]/30 text-xs sm:text-sm font-semibold px-4 py-1.5 sm:px-5 sm:py-2 rounded-full mb-4 shadow-sm">
            What We Offer
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
            Mobile App Development Services
          </h2>
          <p className="text-gray-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            End-to-end native and cross-platform mobile engineering tailored to deliver high performance, robust security, and seamless user experiences.
          </p>
        </div>

        <div className="bg-[#121217] rounded-3xl p-4 sm:p-10 lg:p-14 border border-gray-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle Ambient Glow Effect */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0055FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: 2x2 Grid of Tab Selectors on Mobile & Tablet */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(idx)}
                    className={`p-3.5 sm:p-7 rounded-2xl flex flex-col justify-between text-left transition-all duration-300 min-h-[100px] sm:min-h-[130px] cursor-pointer group relative overflow-hidden ${isActive
                      ? "bg-gradient-to-r from-[#0055FF] to-[#00AAFF] text-white font-bold shadow-[0_12px_30px_rgba(0,85,255,0.4)] scale-[1.02]"
                      : "bg-[#181822] text-gray-300 border border-gray-800/90 hover:bg-[#20202c] hover:border-gray-700 hover:text-white"
                      }`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? "bg-white/20 text-white" : "bg-[#222230] text-[#00E1FF] group-hover:bg-[#0055FF] group-hover:text-white"
                      }`}>
                      {tab.icon}
                    </div>
                    <span className="text-xs sm:text-base font-bold leading-tight mt-2 sm:mt-0">
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Middle Vertical Divider (Desktop Only) */}
            <div className="hidden lg:flex lg:col-span-1 justify-center self-stretch relative py-4">
              <div className="w-[2px] h-full bg-gray-800/80 rounded-full relative">
                <div
                  className="w-[3px] bg-gradient-to-b from-[#00E1FF] to-[#0055FF] rounded-full transition-all duration-300 absolute -left-[0.5px] shadow-sm shadow-[#00E1FF]"
                  style={{
                    height: `${100 / tabs.length}%`,
                    top: `${(activeTab * 100) / tabs.length}%`
                  }}
                />
              </div>
            </div>

            {/* Right Column: Selected Tab Detail Content */}
            <div className="lg:col-span-5 flex flex-col justify-center min-h-0 lg:min-h-[340px]">
              <div>
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#00E1FF]/20 via-[#0055FF]/20 to-[#0055FF]/30 border border-[#00E1FF]/30 flex items-center justify-center mb-4 sm:mb-6 text-white shadow-md">
                  {current.detailIcon}
                </div>

                <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
                  {current.title}
                </h3>

                <p className="text-gray-300 text-xs sm:text-base leading-relaxed mb-6 sm:mb-8">
                  {renderDescription(current.description, current.highlightText)}
                </p>

                {/* Bullet Points */}
                <div className="space-y-4 sm:space-y-6">
                  {current.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-3 sm:gap-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#0055FF]/20 border border-[#0055FF]/40 text-[#00E1FF] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12.75l6 6" />
                        </svg>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-base leading-relaxed">
                        <strong className="text-white font-bold">{pt.title}: </strong>
                        {pt.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CoreCapabilitiesSection = () => {
  const capabilities = [
    {
      title: "Cloud Native",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      ),
      text: (
        <>
          Cloud-native applications engineered to <strong className="font-semibold text-[#0f172a]">scale dynamically</strong> with demand.
        </>
      )
    },
    {
      title: "Mobile Builds",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      ),
      text: (
        <>
          iOS and Android builds with <strong className="font-semibold text-[#0f172a]">smooth cross-platform</strong> execution.
        </>
      )
    },
    {
      title: "UI & UX Experience",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      ),
      text: (
        <>
          Interfaces built for <strong className="font-semibold text-[#0f172a]">rapid adoption</strong> and long-term user engagement.
        </>
      )
    },
    {
      title: "API Integrations",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      text: (
        <>
          Secure API links into <strong className="font-bold text-[#0f172a]">ERP, CRM</strong>, and existing tools.
        </>
      )
    },
    {
      title: "Data Compliance",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      text: (
        <>
          Compliance with Canadian data laws like <strong className="font-bold text-[#0f172a]">PIPEDA, CPPA, Quebec Law 25, PHIPA</strong> for healthcare.
        </>
      )
    }
  ];

  return (
    <div className="mt-16 pt-8 border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-gray-300" />
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#0055FF] bg-gradient-to-r from-[#00E1FF]/10 to-[#0055FF]/10 border border-[#00E1FF]/30 px-5 py-2 rounded-full shadow-sm">
          Our Core Capabilities
        </span>
        <div className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-gray-300" />
      </div>

      {/* 5 Card Modern Grid (2 cols on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-5">
        {capabilities.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 sm:p-7 flex flex-col justify-between min-h-[190px] sm:min-h-[250px] border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,85,255,0.12)] hover:border-[#00E1FF]/50 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden"
          >
            {/* Ambient Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00E1FF] to-[#0055FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

            {/* Icon Top */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E1FF]/10 to-[#0055FF]/10 text-[#0055FF] group-hover:bg-gradient-to-r group-hover:from-[#00E1FF] group-hover:to-[#0055FF] group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                {item.icon}
              </div>
            </div>

            {/* Text Bottom */}
            <p className="text-sm text-gray-600 leading-relaxed font-normal">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tax & Accounting Hero Graphic
const TaxAccountingHeroGraphic = () => {
  return (
    <div className="relative w-full h-[340px] sm:h-[480px] flex items-center justify-center overflow-visible py-2 sm:py-4">
      {/* Background glow */}
      <div className="absolute w-80 h-80 sm:w-[480px] sm:h-[480px] bg-[#0055FF]/12 rounded-full blur-3xl -z-10" />
      <div className="absolute w-52 h-52 sm:w-80 sm:h-80 bg-[#00E1FF]/8 rounded-full blur-2xl -z-10 translate-x-20 -translate-y-10" />

      <svg
        viewBox="0 0 520 440"
        className="w-full max-w-[520px] h-auto drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <defs>
          <filter id="taxShadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.20" />
          </filter>
          <filter id="taxCardShadow" x="-15%" y="-15%" width="130%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#1e3a8a" floodOpacity="0.14" />
          </filter>
          <filter id="taxBadgeShadow" x="-25%" y="-25%" width="150%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* ── DOCUMENT (main) ── */}
        <g filter="url(#taxShadow)">
          {/* Document shadow/back page */}
          <rect x="168" y="48" width="210" height="280" rx="14" fill="#e2e8f0" />
          {/* Folded corner back page */}
          <polygon points="348,48 378,78 348,78" fill="#cbd5e1" />

          {/* Main document */}
          <rect x="158" y="36" width="210" height="280" rx="14" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
          {/* Folded corner */}
          <polygon points="338,36 368,66 338,66" fill="#dbeafe" />
          <polygon points="338,36 368,66 368,36" fill="#bfdbfe" />
        </g>

        {/* ── TAX LABEL BADGE ── */}
        <g filter="url(#taxCardShadow)">
          <rect x="200" y="68" width="126" height="40" rx="10" fill="#0055FF" />
          <rect x="200" y="68" width="126" height="18" rx="10" fill="#0ea5e9" opacity="0.5" />
        </g>
        <text x="263" y="95" fontSize="22" fontWeight="900" fill="white" fontFamily="system-ui, sans-serif" textAnchor="middle" letterSpacing="4">TAX</text>

        {/* ── DOCUMENT LINES ── */}
        {/* Bullet + lines */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(0, ${i * 32})`}>
            <circle cx="190" cy="132" r="7" fill="#cbd5e1" />
            <rect x="208" y="127" width={i === 0 ? 120 : i === 1 ? 90 : i === 2 ? 110 : 75} height="9" rx="4.5" fill="#e2e8f0" />
          </g>
        ))}

        {/* Extra lines for realism */}
        <rect x="190" y="265" width="150" height="8" rx="4" fill="#f1f5f9" />
        <rect x="190" y="280" width="110" height="8" rx="4" fill="#f1f5f9" />

        {/* ── CLOUD (top-left) ── */}
        <g opacity="0.85">
          <ellipse cx="130" cy="72" rx="28" ry="18" fill="#1e293b" />
          <ellipse cx="110" cy="78" rx="18" ry="14" fill="#1e293b" />
          <ellipse cx="150" cy="78" rx="16" ry="13" fill="#1e293b" />
          <ellipse cx="130" cy="82" rx="30" ry="16" fill="#1e293b" />
        </g>
        <g opacity="0.9">
          <ellipse cx="128" cy="70" rx="26" ry="16" fill="#334155" />
          <ellipse cx="108" cy="76" rx="16" ry="12" fill="#334155" />
          <ellipse cx="148" cy="76" rx="14" ry="11" fill="#334155" />
          <ellipse cx="128" cy="80" rx="28" ry="14" fill="#334155" />
        </g>

        {/* ── CLOUD (top-right of document) ── */}
        <g opacity="0.75">
          <ellipse cx="370" cy="165" rx="32" ry="20" fill="#e2e8f0" />
          <ellipse cx="348" cy="172" rx="20" ry="15" fill="#e2e8f0" />
          <ellipse cx="392" cy="172" rx="18" ry="14" fill="#e2e8f0" />
          <ellipse cx="370" cy="178" rx="34" ry="18" fill="#e2e8f0" />
        </g>
        <g opacity="0.9">
          <ellipse cx="368" cy="163" rx="30" ry="18" fill="#f1f5f9" />
          <ellipse cx="346" cy="170" rx="18" ry="13" fill="#f1f5f9" />
          <ellipse cx="390" cy="170" rx="16" ry="12" fill="#f1f5f9" />
          <ellipse cx="368" cy="176" rx="32" ry="16" fill="#f1f5f9" />
        </g>

        {/* ── COIN STACK ── */}
        {/* Shadow under coins */}
        <ellipse cx="130" cy="365" rx="52" ry="12" fill="#0f172a" opacity="0.10" />

        {/* Coin stack — bottom to top */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(0, ${-i * 14})`}>
            {/* Coin rim (dark side) */}
            <ellipse cx="130" cy="362" rx="50" ry="14" fill="#0055FF" />
            {/* Coin body */}
            <ellipse cx="130" cy="356" rx="50" ry="14" fill={i === 4 ? "#0ea5e9" : "#0055FF"} />
            {/* Coin shine */}
            <ellipse cx="118" cy="352" rx="16" ry="5" fill="white" opacity="0.18" transform={`rotate(-18, 118, 352)`} />
            {/* Coin stripe pattern */}
            {[0, 1, 2, 3, 4, 5, 6].map((s) => (
              <line
                key={s}
                x1={84 + s * 14}
                y1="357"
                x2={84 + s * 14}
                y2="369"
                stroke="white"
                strokeWidth="2.5"
                opacity="0.22"
              />
            ))}
          </g>
        ))}
        {/* Top coin face */}
        <ellipse cx="130" cy="292" rx="50" ry="14" fill="#38bdf8" />
        <ellipse cx="118" cy="288" rx="14" ry="4" fill="white" opacity="0.25" transform="rotate(-18,118,288)" />

        {/* ── PERCENTAGE BADGE ── */}
        <g filter="url(#taxBadgeShadow)">
          {/* Outer ring */}
          <circle cx="352" cy="300" r="54" fill="#ea580c" />
          {/* Inner face */}
          <circle cx="352" cy="296" r="54" fill="#f97316" />
          {/* Shine arc */}
          <path d="M316 268 A46 46 0 0 1 380 258" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.25" />
        </g>
        {/* % symbol */}
        <text
          x="352"
          y="316"
          fontSize="56"
          fontWeight="900"
          fill="white"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
        >%</text>

        {/* ── SPARKLE STARS ── */}
        {[
          { x: 440, y: 80, r: 4 },
          { x: 460, y: 110, r: 2.5 },
          { x: 80, y: 200, r: 3 },
          { x: 60, y: 240, r: 2 },
          { x: 430, y: 340, r: 3.5 },
        ].map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#00E1FF" opacity="0.5" />
        ))}
      </svg>
    </div>
  );
};

export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const isMobilePage = slug === "mobile-app-development";
  const [service, setService] = useState<ServiceData | null>(servicesData[slug] || null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    let cancelled = false;
    fetch(`/api/cms/services/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.service) setService(data.service);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!service) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1a1a2e] mb-4">Service Not Found</h1>
          <Link href="/" className="text-[#262b3f] hover:underline">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Hero Section - Dark Style */}
        <section className="relative pt-28 pb-16 bg-[#0d1117] overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(0,180,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.06) 0%, transparent 50%)' }} />

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/40 text-sm mb-8">
              <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
              <span>›</span>
              <Link href="/services" className="hover:text-white/70 transition-colors">Services</Link>
              <span>›</span>
              <span className="text-white/60">{service.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Text Content */}
              <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                {/* Category Badge */}
                <div className="inline-flex items-center gap-2 border border-[#00E1FF]/30 bg-gradient-to-r from-[#00E1FF]/10 to-[#0055FF]/10 rounded-full px-4 py-1.5 mb-6">
                  <span className="text-xs font-bold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text uppercase tracking-widest">{service.title}</span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
                  {service.subtitle || service.title}
                  <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text"> 24/7</span>
                </h1>

                {/* Description */}
                <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
                  {service.description}
                </p>



                {/* CTA Buttons */}
                <div className="flex items-center justify-center lg:justify-start gap-6 mb-10 w-full">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] hover:opacity-90 text-white px-7 py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg shadow-[#00E1FF]/25"
                  >
                    Get a Free Consultation
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>


              </div>

              {/* Right: Mockup Illustration */}
              <div className={`relative transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                {slug === "mobile-app-development" ? (
                  /* Cascading 4-Phone 3D Showcase for Mobile App Development */
                  <div className="relative w-full h-[340px] sm:h-[480px] flex items-center justify-center overflow-visible py-2 sm:py-4">
                    {/* Background Glow */}
                    <div className="absolute w-64 sm:w-80 h-64 sm:h-80 bg-[#00E1FF]/15 rounded-full blur-3xl -z-10" />

                    {/* Container with perspective & mobile scaling */}
                    <div className="relative w-full max-w-lg h-full flex items-center justify-center scale-[0.72] min-[390px]:scale-[0.82] sm:scale-100 origin-center">

                      {/* PHONE 1: Leftmost White Phone (Tilted -rotate-12) */}
                      <div className="absolute left-0 sm:left-2 top-14 w-[165px] sm:w-[195px] h-[320px] sm:h-[370px] bg-white rounded-[36px] p-2.5 shadow-2xl border-4 border-gray-200 -rotate-12 translate-y-4 hover:translate-y-2 transition-all duration-500 z-10">
                        <div className="w-full h-full bg-[#f1f5f9] rounded-[28px] overflow-hidden p-3 flex flex-col justify-between text-gray-800">
                          {/* Top Notch */}
                          <div className="w-14 h-2.5 bg-gray-300 rounded-full mx-auto mb-1" />

                          {/* Graphic */}
                          <div className="space-y-2 my-auto text-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 mx-auto flex items-center justify-center text-white text-base font-bold shadow-md">
                              🎨
                            </div>
                            <div className="w-full bg-blue-100/70 rounded-xl p-2 text-left">
                              <div className="w-3/4 h-2 bg-blue-400 rounded-full mb-1" />
                              <div className="w-1/2 h-1.5 bg-blue-300 rounded-full" />
                            </div>
                          </div>

                          <div className="text-center pt-1">
                            <div className="text-xs font-black text-gray-900 mb-0.5">Manage Tasks</div>
                            <div className="text-[8px] text-gray-500 mb-2 leading-tight">Team and Project management</div>
                            <div className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white text-[9px] font-bold py-1 px-3 rounded-full shadow-md">
                              Get Started
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PHONE 2: Dark Blue Gradient Phone (Tilted -rotate-6) */}
                      <div className="absolute left-14 sm:left-20 top-6 w-[175px] sm:w-[205px] h-[330px] sm:h-[380px] bg-[#0d1117] rounded-[38px] p-2.5 shadow-2xl border-4 border-indigo-900/60 -rotate-6 transition-all duration-500 z-20">
                        <div className="w-full h-full bg-gradient-to-b from-[#1e1b4b] to-[#312e81] rounded-[30px] overflow-hidden p-3 flex flex-col justify-between text-white">
                          {/* Top Bar */}
                          <div className="flex justify-between items-center text-[9px] opacity-80">
                            <span className="font-bold">Hi Alex</span>
                            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[7px]">👤</div>
                          </div>

                          {/* Card */}
                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/15 my-1">
                            <div className="text-[8px] uppercase tracking-wider text-cyan-300 font-bold mb-0.5">Mobile App Design</div>
                            <div className="text-[9px] text-white/80">Mike and Anita</div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-1.5 my-1">
                            <div className="bg-white/10 rounded-xl p-1.5 text-center">
                              <div className="text-xs font-extrabold text-cyan-300">22</div>
                              <div className="text-[7px] opacity-70">Done</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-1.5 text-center">
                              <div className="text-xs font-extrabold text-indigo-300">7</div>
                              <div className="text-[7px] opacity-70">In progress</div>
                            </div>
                          </div>

                          {/* Bottom Nav Skeleton */}
                          <div className="flex justify-around items-center pt-1.5 border-t border-white/10 text-xs">
                            <span className="text-cyan-300 text-[10px]">🏠</span>
                            <span className="opacity-50 text-[10px]">📑</span>
                            <span className="opacity-50 text-[10px]">👤</span>
                          </div>
                        </div>
                      </div>

                      {/* PHONE 3: Light Schedule Phone (Slightly tilted rotate-3) */}
                      <div className="absolute right-14 sm:right-20 top-2 w-[180px] sm:w-[210px] h-[340px] sm:h-[390px] bg-white rounded-[40px] p-2.5 shadow-2xl border-4 border-gray-200 rotate-3 transition-all duration-500 z-30">
                        <div className="w-full h-full bg-[#f8fafc] rounded-[32px] overflow-hidden p-3 flex flex-col justify-between text-gray-800">
                          {/* Top Notch */}
                          <div className="w-14 h-3 bg-black rounded-full mx-auto mb-1.5" />

                          {/* Calendar Bar */}
                          <div>
                            <div className="text-center font-bold text-xs text-gray-900 mb-1.5">April</div>
                            <div className="grid grid-cols-4 gap-1 text-center mb-2">
                              <div className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white rounded-lg p-1 text-[8px] font-bold">12 Wed</div>
                              <div className="bg-gray-100 rounded-lg p-1 text-[8px] text-gray-600">13 Thu</div>
                              <div className="bg-gray-100 rounded-lg p-1 text-[8px] text-gray-600">14 Fri</div>
                              <div className="bg-gray-100 rounded-lg p-1 text-[8px] text-gray-600">15 Sat</div>
                            </div>
                          </div>

                          {/* Time Slots */}
                          <div className="space-y-1 flex-1">
                            <div className="bg-indigo-600 text-white rounded-lg p-1.5 text-[8px]">
                              <div className="font-bold">Mobile App Design</div>
                              <div className="opacity-80 text-[7px]">9:00 AM - 10:00 AM</div>
                            </div>
                            <div className="bg-purple-600 text-white rounded-lg p-1.5 text-[8px]">
                              <div className="font-bold">Software Testing</div>
                              <div className="opacity-80 text-[7px]">10:00 AM - 12:00 PM</div>
                            </div>
                            <div className="bg-blue-600 text-white rounded-lg p-1.5 text-[8px]">
                              <div className="font-bold">Web Development</div>
                              <div className="opacity-80 text-[7px]">1:00 PM - 2:00 PM</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PHONE 4: Rightmost Hero Phone with Image Card (Tilted rotate-12) */}
                      <div className="absolute right-0 sm:right-2 -top-4 w-[180px] sm:w-[210px] h-[345px] sm:h-[395px] bg-[#f1f5f9] rounded-[38px] p-2.5 shadow-2xl border-4 border-white rotate-12 -translate-y-2 hover:-translate-y-4 transition-all duration-500 z-40">
                        <div className="w-full h-full bg-gradient-to-b from-blue-50 to-indigo-50 rounded-[30px] overflow-hidden p-3 flex flex-col justify-between text-gray-900 border border-blue-100">
                          {/* Top Notch */}
                          <div className="w-14 h-2.5 bg-gray-800 rounded-full mx-auto mb-1.5" />

                          {/* Hero Avatar / Graphic */}
                          <div className="relative w-full h-24 bg-gradient-to-tr from-[#00E1FF] to-[#0055FF] rounded-2xl p-2.5 flex flex-col justify-end text-white overflow-hidden shadow-md">
                            <div className="absolute top-1.5 right-1.5 bg-white/20 backdrop-blur-md rounded-full px-1.5 py-0.5 text-[7px] font-bold">
                              ★ 4.9
                            </div>
                            <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-xs mb-1">
                              🚀
                            </div>
                            <div className="text-xs font-black">Daily Tasks</div>
                          </div>

                          {/* Text & Button */}
                          <div className="text-center py-1">
                            <div className="text-xs font-black text-indigo-950 mb-0.5">Manage daily tasks</div>
                            <div className="text-[8px] text-gray-500 mb-2 leading-tight">Team & project management solution</div>
                            <div className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white text-[9px] font-bold py-1.5 px-3 rounded-full shadow-lg shadow-blue-500/25">
                              Get Started
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : slug === "cloud-solutions" ? (
                  /* Cloud Orbiting Graphic for Cloud Solutions */
                  <CloudOrbitHeroGraphic />
                ) : slug === "devops-cicd" ? (
                  /* CI/CD Infinity Loop Graphic for DevOps & CI/CD */
                  <DevOpsHeroGraphic />
                ) : slug === "ai-ml-solutions" ? (
                  /* Glowing Cyber Graphic for AI / ML Solutions */
                  <AiMlHeroGraphic />
                ) : slug === "ui-ux-design" ? (
                  /* UI/UX Graphic */
                  <UiUxHeroGraphic />
                ) : slug === "ecommerce-solutions" ? (
                  /* E-commerce Illustration */
                  <EcommerceHeroGraphic />
                ) : slug === "custom-software-development" ? (
                  /* Custom Software Development Graphic */
                  <CustomSoftwareHeroGraphic />
                ) : slug === "seo-digital-marketing" ? (
                  /* SEO Graphic */
                  <SeoHeroGraphic />
                ) : slug === "maintenance-support" ? (
                  /* Maintenance & Support Graphic */
                  <MaintenanceHeroGraphic />
                ) : slug === "tax-accounting" ? (
                  /* Tax & Accounting Graphic */
                  <TaxAccountingHeroGraphic />
                ) : (
                  /* Browser Window Illustration for Web Dev & standard services */
                  <div className="relative">
                    {/* Browser Window */}
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                      {/* Browser Chrome */}
                      <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-400" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="flex-1 mx-4 bg-white/10 rounded-full px-3 py-1">
                          <span className="text-white/60 text-xs">yoursite.ca</span>
                        </div>
                        <div className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-white text-xs px-3 py-1 rounded-full font-medium">Live</div>
                      </div>

                      {/* Page Preview */}
                      <div className="p-6 bg-gray-50">
                        {/* Nav skeleton */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-20 h-3 bg-gray-200 rounded-full" />
                          <div className="flex gap-2 ml-auto">
                            <div className="w-12 h-3 bg-gray-200 rounded-full" />
                            <div className="w-12 h-3 bg-gray-200 rounded-full" />
                            <div className="w-12 h-3 bg-gray-200 rounded-full" />
                            <div className="w-20 h-6 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full" />
                          </div>
                        </div>

                        {/* Hero area */}
                        <div className="grid grid-cols-5 gap-3 mb-4">
                          <div className="col-span-3 space-y-2">
                            <div className="w-3/4 h-3 bg-gray-300 rounded-full" />
                            <div className="w-full h-3 bg-gray-300 rounded-full" />
                            <div className="w-2/3 h-3 bg-gray-200 rounded-full" />
                            <div className="w-full h-2 bg-gray-200 rounded-full" />
                            <div className="w-5/6 h-2 bg-gray-200 rounded-full" />
                            <div className="pt-2 flex gap-2">
                              <div className="w-20 h-6 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-lg" />
                              <div className="w-16 h-6 bg-gray-200 rounded-lg" />
                            </div>
                          </div>
                          <div className="col-span-2 bg-[#00E1FF]/5 rounded-xl flex items-center justify-center h-28">
                            {/* Full Chrome browser logo */}
                            <svg className="w-14 h-14" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                              {/* Outer ring segments */}
                              <path d="M50 5 A45 45 0 0 1 89.06 27.5 L66.5 40 A22 22 0 0 0 50 28 Z" fill="#EA4335" opacity="0.85" />
                              <path d="M89.06 27.5 A45 45 0 0 1 89.06 72.5 L66.5 60 A22 22 0 0 0 72 50 Z" fill="#FBBC04" opacity="0.85" />
                              <path d="M89.06 72.5 A45 45 0 0 1 50 95 L50 72 A22 22 0 0 0 66.5 60 Z" fill="#34A853" opacity="0.85" />
                              <path d="M50 95 A45 45 0 0 1 10.94 72.5 L33.5 60 A22 22 0 0 0 28 50 Z" fill="#34A853" opacity="0.6" />
                              <path d="M10.94 72.5 A45 45 0 0 1 10.94 27.5 L33.5 40 A22 22 0 0 0 34 50 Z" fill="#FBBC04" opacity="0.6" />
                              <path d="M10.94 27.5 A45 45 0 0 1 50 5 L50 28 A22 22 0 0 0 33.5 40 Z" fill="#EA4335" opacity="0.6" />
                              {/* White divider ring */}
                              <circle cx="50" cy="50" r="24" fill="white" />
                              {/* Inner blue circle */}
                              <circle cx="50" cy="50" r="20" fill="#0055FF" />
                              {/* Shine */}
                              <circle cx="44" cy="44" r="5" fill="white" opacity="0.25" />
                            </svg>
                          </div>
                        </div>

                        {/* Cards */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-orange-50 h-10 rounded-lg" />
                          <div className="bg-blue-50 h-10 rounded-lg" />
                          <div className="bg-[#00E1FF]/10 h-10 rounded-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Google Score Badge */}
                    <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 border border-gray-100 animate-bounce">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                        ✓
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Fast Performance</div>
                        <div className="text-[10px] text-gray-500">Optimized Code</div>
                      </div>
                    </div>

                    {/* Mobile Badge */}
                    <div className="absolute -bottom-4 left-6 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 border border-gray-100">
                      <div className="w-7 h-7 rounded-full bg-[#00E1FF]/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#00E1FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Mobile</p>
                        <p className="text-xs font-bold text-[#1a1a2e]">100% Responsive</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Combined Overview & Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            {/* Header with Subtitle & Description */}
            <div className="max-w-4xl mx-auto text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
                {service.subtitle}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {service.overviewTagline || "We focus on understanding your business goals first, then build solutions that actually solve problems — not just look good on paper. Every project gets dedicated attention, clear communication, and a team that takes ownership of delivering results on time."}
              </p>
            </div>

            {/* Our Core Capabilities Section - ONLY on Mobile App Development Service Page */}
            {isMobilePage && <CoreCapabilitiesSection />}

            {/* What We Offer Label & Feature Cards (Hidden for specialized service pages) */}
            {!isMobilePage && slug !== "custom-software-development" && (
              <>
                <div className="text-center mb-8">
                  <span className="inline-block bg-gradient-to-r from-[#00E1FF]/10 to-[#0055FF]/10 text-[#0055FF] border border-[#00E1FF]/30 text-sm font-semibold px-4 py-2 rounded-full">
                    What We Offer
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {service.features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 flex flex-col justify-start min-h-[190px] border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,85,255,0.12)] hover:border-[#00E1FF]/50 hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden"
                    >
                      {/* Ambient Accent Line */}
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00E1FF] to-[#0055FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                      <div className="mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E1FF]/10 to-[#0055FF]/10 text-[#0055FF] group-hover:bg-gradient-to-r group-hover:from-[#00E1FF] group-hover:to-[#0055FF] group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                          <FeatureIcon type={feature.icon} />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#0f172a] mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-normal">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Mobile Services Interactive Tab Section (What We Offer for Mobile App Development page) */}
        {isMobilePage && (
          <MobileDevServicesTabSection />
        )}

        {/* UI/UX Engagements Section - Only for UI/UX Design */}
        {slug === "ui-ux-design" && (
          <UiUxEngagementsSection />
        )}

        {/* Custom Software Services Section - Only for Custom Software Development */}
        {slug === "custom-software-development" && (
          <CustomSoftwareServicesSection />
        )}

        {/* E-commerce Services Section - Only for E-commerce Solutions */}
        {slug === "ecommerce-solutions" && (
          <EcommerceServicesSection />
        )}

        {/* SEO Packages Section - Only for SEO/Digital Marketing */}
        {slug === "seo-digital-marketing" && (
          <section className="py-20 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                <span className="inline-block bg-[#262b3f]/10 text-[#262b3f] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                  SEO Packages
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
                  Choose Your Growth Plan
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Transparent pricing with real deliverables. No hidden fees, no long-term contracts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-8">
                {/* Starter Package */}
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#262b3f]/30 hover:shadow-xl transition-all duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">Starter</h3>
                    <p className="text-gray-500 text-sm">For small businesses getting started with SEO</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#1a1a2e]">$799</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Up to 10 keywords optimized</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Technical SEO audit & fixes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">On-page optimization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">2 blog posts/month</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Google Business Profile setup</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Monthly ranking report</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="w-full py-3 px-6 border-2 border-[#262b3f] text-[#262b3f] font-semibold rounded-lg hover:bg-[#262b3f] hover:text-white transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>

                {/* Growth Package - Popular */}
                <div className="relative bg-[#1a1a2e] border-2 border-[#262b3f] rounded-2xl p-8 shadow-2xl transform md:-translate-y-4">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#0055FF] to-[#00AAFF] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Growth</h3>
                    <p className="text-white/60 text-sm">For businesses ready to scale their online presence</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$1,499</span>
                    <span className="text-white/60">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Up to 25 keywords optimized</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Everything in Starter</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">4 blog posts/month</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Link building (10 backlinks/month)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Competitor analysis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Local SEO optimization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Bi-weekly strategy calls</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="w-full py-3 px-6 bg-gradient-to-r from-[#0055FF] to-[#00AAFF] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>

                {/* Enterprise Package */}
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#262b3f]/30 hover:shadow-xl transition-all duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">Enterprise</h3>
                    <p className="text-gray-500 text-sm">For large businesses with aggressive growth goals</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#1a1a2e]">$2,999</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Unlimited keywords</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Everything in Growth</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">8 blog posts/month</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Link building (25 backlinks/month)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Google Ads management included</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Dedicated SEO manager</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Weekly strategy calls</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="w-full py-3 px-6 border-2 border-[#262b3f] text-[#262b3f] font-semibold rounded-lg hover:bg-[#262b3f] hover:text-white transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-12 text-center">
                <p className="text-gray-500 text-sm mb-4">
                  All packages include: Google Analytics setup, Search Console integration, and monthly performance reports.
                </p>
                <p className="text-gray-600 font-medium">
                  Need a custom package? <button onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))} className="text-[#0055FF] hover:underline">Contact us</button> for a tailored solution.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Web Development Packages Section - Only for Web Development */}
        {slug === "web-development" && (
          <section className="py-20 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
              <div className="text-center mb-16">
                <span className="inline-block bg-[#262b3f]/10 text-[#262b3f] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                  Web Development Packages
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
                  Choose Your Development Plan
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Transparent pricing with real deliverables. No hidden fees, no long-term contracts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-8 mt-4 md:mt-0">
                {/* Starter Package */}
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#262b3f]/30 hover:shadow-xl transition-all duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">Landing Page</h3>
                    <p className="text-gray-500 text-sm">For small businesses establishing a simple online presence</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#1a1a2e]">$1,499</span>
                    <span className="text-gray-500"> one-time</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Up to 5 Pages</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Mobile Responsive Design</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Basic SEO Setup</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Contact Form Integration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Social Media Links</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="w-full py-3 px-6 border-2 border-[#262b3f] text-[#262b3f] font-semibold rounded-lg hover:bg-[#262b3f] hover:text-white transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>

                {/* Growth Package - Popular */}
                <div className="relative bg-[#1a1a2e] border-2 border-[#262b3f] rounded-2xl p-8 shadow-2xl transform md:-translate-y-4">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#0055FF] to-[#00AAFF] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Corporate Website</h3>
                    <p className="text-white/60 text-sm">For growing businesses needing a professional web presence</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$3,499</span>
                    <span className="text-white/60"> one-time</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Up to 15 Pages</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">CMS Integration (WordPress/Strapi)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Advanced On-Page SEO</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Custom Animations & Interactions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Performance & Speed Optimization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 text-sm">Google Analytics Integration</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="w-full py-3 px-6 bg-gradient-to-r from-[#0055FF] to-[#00AAFF] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>

                {/* Enterprise Package */}
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#262b3f]/30 hover:shadow-xl transition-all duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">E-Commerce / Custom Web App</h3>
                    <p className="text-gray-500 text-sm">For complex custom functionalities and high-traffic stores</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#1a1a2e]">$7,999</span>
                    <span className="text-gray-500">+</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Unlimited Pages & Products</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Secure Payment Gateways</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">User Authentication & Profiles</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Custom API Integrations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Scalable Cloud Architecture</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Dedicated Project Manager</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="w-full py-3 px-6 border-2 border-[#262b3f] text-[#262b3f] font-semibold rounded-lg hover:bg-[#262b3f] hover:text-white transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-12 text-center">
                <p className="text-gray-500 text-sm mb-4">
                  All packages include: Custom Design, Mobile Optimization, and 30 Days of Free Post-Launch Support.
                </p>
                <p className="text-gray-600 font-medium">
                  Need a custom solution? <button onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))} className="text-[#0055FF] hover:underline">Contact us</button> for a tailored quote.
                </p>
              </div>
            </div>
          </section>
        )}


        {/* Process Section - Interactive Step Selector */}
        {service.process && service.process.length > 0 && (
          <section className="py-20 bg-[#eef0f8]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
              {/* Header */}
              <div className="text-center mb-10 max-w-4xl mx-auto px-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1a1a2e] mb-4 leading-tight">
                  {service.processHeading || `Our ${service.title} Process: Discover to Scale`}
                </h2>
                {service.processDescription ? (
                  <p
                    className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: service.processDescription }}
                  />
                ) : (
                  <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
                    Our {service.title.toLowerCase()} services follow a proven{" "}
                    <strong className="text-[#1a1a2e]">five-phase process</strong> —{" "}
                    {service.process.slice(0, 5).map(s => s.step).join(", ")} — so every project is structured,
                    measurable, and built to grow safely after go-live.
                  </p>
                )}
              </div>

              {/* Interactive Step Selector */}
              <ProcessSteps steps={service.process} />
            </div>
          </section>
        )}

        {/* Local SEO Services Section - Only for SEO/Digital Marketing */}
        {slug === "seo-digital-marketing" && (
          <>
            {/* Section 1: Local SEO Services Toronto & Across Canada (Elegant Blue Theme) */}
            {/* Section 2: Why Our Local SEO Works */}
            <section className="py-20 bg-white border-t border-gray-100">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="bg-[#f8fafc] border border-gray-200/80 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Left: Text Content */}
                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] mb-4 leading-tight">
                        Why Our Local SEO Works
                      </h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-6" />
                      <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                        <p>
                          Most affordable SEO services cut corners — thin content, low-quality backlinks, and cookie-cutter audits. We don't. Our local SEO services in Toronto and across Canada are built on three pillars: <strong className="text-[#0f172a]">technical excellence</strong>, <strong className="text-[#0f172a]">hyper-local content</strong>, and <strong className="text-[#0f172a]">authoritative link earning</strong>.
                        </p>
                        <p>
                          When someone in Toronto searches "local SEO services near me," your business should be the first thing they see. We make that happen through Google Business Profile optimization, structured data markup, local citation building, and neighbourhood-level keyword targeting — the kind of work that moves the needle.
                        </p>
                      </div>
                    </div>

                    {/* Right: Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: "312%", label: "Avg. traffic increase" },
                        { value: "24+", label: "Cities served" },
                        { value: "200+", label: "Google Business Profiles optimized" },
                        { value: "18 spots", label: "Avg. ranking improvement" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-1 shadow-sm hover:shadow-xl hover:border-[#00E1FF]/40 hover:-translate-y-1 transition-all duration-300"
                        >
                          <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text leading-none">{stat.value}</span>
                          <span className="text-gray-500 text-xs sm:text-sm leading-snug mt-1">{stat.label}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            </section>
            <section className="py-24 bg-white border-t border-gray-100">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
                {/* Header Container */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-[#00E1FF] to-[#0055FF]" />
                    <span className="text-[#0055FF] text-xs font-bold uppercase tracking-[0.2em]">
                      Local SEO Specialists
                    </span>
                    <div className="w-12 h-[2px] bg-gradient-to-l from-[#00E1FF] to-[#0055FF]" />
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-bold text-[#0f172a] mb-8 leading-[1.15] tracking-tight">
                    Local SEO Services Toronto <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0055FF] to-[#00E1FF] font-medium">&amp; Across Canada</span>
                  </h2>

                  <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto font-light">
                    We provide sophisticated local SEO services to businesses in every major Canadian city. Our targeted strategies help you dominate the Google Maps pack and rank for searches that actually convert.
                  </p>
                </div>

                {/* Cities Grid - Elegant Typography Focus with Blue Accents */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-24 border-t border-b border-gray-100 py-12 relative">
                  {/* Subtle background glow for the grid */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00E1FF]/5 via-[#0055FF]/5 to-transparent blur-2xl -z-10" />

                  {[
                    "Toronto", "Brampton", "Mississauga", "North York",
                    "Calgary", "Vancouver", "Ottawa", "Hamilton"
                  ].map((city) => (
                    <Link
                      href={`/services/${slug}/${city.toLowerCase().replace(/ /g, '-')}`}
                      key={city}
                      className="group flex items-center gap-4 cursor-pointer border border-gray-200 rounded-2xl px-5 py-4 hover:border-[#0055FF]/30 hover:shadow-[0_4px_20px_rgba(0,85,255,0.05)] transition-all duration-300 bg-white/60 backdrop-blur-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0055FF]/5 flex items-center justify-center text-[#0055FF] group-hover:bg-[#0055FF] group-hover:text-white transition-colors duration-300 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-base sm:text-lg text-gray-900 font-medium group-hover:text-[#0055FF] transition-colors duration-300">{city}</span>
                    </Link>
                  ))}
                </div>

                {/* Refined CTA - Classy Blue */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-[#f8fbff] p-10 rounded-2xl border border-[#0055FF]/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00E1FF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                  <div className="max-w-xl relative z-10">
                    <h3 className="text-2xl font-bold text-[#0f172a] mb-3 tracking-tight">
                      Ready to Grow Your Organic Traffic?
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-light">
                      Every SEO engagement is scoped to your market, goals, and competition. Get a free strategy call and custom quote — no contracts, no lock-in.
                    </p>
                  </div>

                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                    className="relative z-10 shrink-0 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] hover:opacity-90 text-white px-8 py-4 rounded-full font-medium text-sm transition-all duration-300 shadow-[0_8px_20px_rgba(0,85,255,0.2)] hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(0,85,255,0.3)]"
                  >
                    Request a Free Quote
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>

          </>
        )}
        {/* How We Deliver Section (ONLY for Web Development Service Page, directly after Process section) */}
        {slug === "web-development" && (
          <WebDevDeliveryModelSection
            heading={service.deliveryHeading}
            description={service.deliveryDescription}
            steps={service.deliverySteps}
          />
        )}

        {/* What's Included Section (ONLY for Cloud Solutions Service Page, directly after Process section) */}
        {slug === "cloud-solutions" && (
          <CloudIncludedSection />
        )}

        {/* Enterprise AI/ML Capabilities Grid (ONLY for AI/ML Solutions Service Page, directly after Process section) */}
        {slug === "ai-ml-solutions" && (
          <AiMlServicesGridSection />
        )}

        {/* Comprehensive DevOps Services Section (ONLY for DevOps & CI/CD Service Page) */}
        {slug === "devops-cicd" && (
          <DevOpsServicesGridSection />
        )}

        {/* Categorized Tech Stack */}
        {slug !== "tax-accounting" && slug !== "seo-digital-marketing" && (
          <CategorizedTechStack />
        )}




        {/* Why Choose Us Section - CMS Driven with Fallback */}
        {(() => {
          if (!service.whyChooseUsHeading || !service.whyChooseUsCards || service.whyChooseUsCards.length === 0) return null;

          const heading = service.whyChooseUsHeading;
          const intro = service.whyChooseUsIntro;
          const subHeading = service.whyChooseUsSubHeading;
          const subText = service.whyChooseUsSubText;

          // Icon map: key -> SVG path
          const iconPaths: Record<string, string> = {
            chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
            desktop: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0h-18",
            users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
            clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
            check: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
            trend: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
            shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
            star: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
            lightning: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
          };

          const cards: { icon: string; label: string }[] = service.whyChooseUsCards;

          // Smart heading renderer: last 2 words get gradient
          const renderHeading = (text: string) => {
            const words = text.trim().split(" ");
            if (words.length <= 2) {
              return <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">{text}</span>;
            }
            const firstPart = words.slice(0, words.length - 2).join(" ");
            const lastPart = words.slice(-2).join(" ");
            return <>{firstPart} <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">{lastPart}</span></>;
          };

          return (
            <section className="py-20 bg-[#f8fafc]">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Left Column */}
                  <div className="lg:col-span-5">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-4">
                      {renderHeading(heading)}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-8" />
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">{intro}</p>
                    <h3 className="text-base sm:text-lg font-bold text-[#0f172a] mb-2">{subHeading}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{subText}</p>
                  </div>

                  {/* Right Column: Cards Grid */}
                  <div className="lg:col-span-7">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5">
                      {cards.map((card, i) => {
                        const path = iconPaths[card.icon] || iconPaths.chart;
                        const lines = card.label.split("\n");
                        return (
                          <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                            </svg>
                            <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">
                              {lines.map((line, li) => (
                                <span key={li}>{line}{li < lines.length - 1 && <br />}</span>
                              ))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* Why Choose Us — Tax & Accounting (custom version) */}
        {slug === "tax-accounting" && (
          <section className="py-20 bg-[#f8fafc]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Left Column: Heading + Text */}
                <div className="lg:col-span-5">
                  <span className="inline-block bg-gradient-to-r from-[#00E1FF]/10 to-[#0055FF]/10 text-[#0055FF] border border-[#00E1FF]/30 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-5 shadow-sm">
                    Why VynTech Solutions
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-4">
                    Why <span className="bg-gradient-to-r from-[#00E1FF] to-[#0055FF] text-transparent bg-clip-text">choose us</span>
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] rounded-full mb-8" />

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                    Managing taxes and accounting isn't just about numbers — it's about making confident financial decisions. At VynTech Solutions, our certified accounting professionals provide accurate, transparent, and deadline-driven financial services tailored for Canadian businesses of every size.
                  </p>

                  <h3 className="text-base sm:text-lg font-bold text-[#0f172a] mb-2">
                    Precision you can trust
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    From personal income tax to corporate filings and CRA compliance, we handle the complexity so you can focus on growing your business. Every engagement is backed by transparency, accuracy, and proactive year-round support.
                  </p>
                </div>

                {/* Right Column: 6 Benefit Cards */}
                <div className="lg:col-span-7">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5">

                    {/* Card 1 — CRA Compliance */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                      <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">CRA Compliant<br />Filings</span>
                    </div>

                    {/* Card 2 — Certified Professionals */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">Certified<br />Accountants</span>
                    </div>

                    {/* Card 3 — On-Time Deadlines */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">On-Time<br />Deadlines</span>
                    </div>

                    {/* Card 4 — Tax Savings */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">Maximum Tax<br />Savings</span>
                    </div>

                    {/* Card 5 — Transparent Pricing */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m-9-6l2-2 2 2 4-4" />
                      </svg>
                      <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">Transparent<br />Pricing</span>
                    </div>

                    {/* Card 6 — Year-Round Support */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-[#00E1FF]/40 transition-all duration-300 min-h-[130px] sm:min-h-[160px] border border-gray-100 group">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] group-hover:text-[#00E1FF] transition-colors mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796a3.765 3.765 0 00-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 01-1.388.88m2.268-2.268l4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l-3.448-4.138m3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-1.388-.88 3.737 3.737 0 01-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 01-1.652-1.306 9.027 9.027 0 01-1.306-1.652m0 0l4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976a3.765 3.765 0 010-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 011.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 00-1.652 1.306A9.025 9.025 0 004.33 7.288" />
                      </svg>
                      <span className="text-[#0f172a] font-semibold text-[11px] sm:text-xs md:text-sm leading-snug">Year-Round<br />Support</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services Across Canada Section (Only for Web Development Page) */}
        {slug === "web-development" && (
          <section className="py-16 bg-[#f8fafc] border-t border-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-3">
                {service.title} Services <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0055FF] to-[#00E1FF]">Across Canada</span>
              </h2>
              <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
                We serve businesses in every major Canadian city. Click your city to learn more about our local {service.title.toLowerCase()} services.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
                {[
                  "Toronto",
                  "Vancouver",
                  "Calgary",
                  "Ottawa",
                  "Mississauga",
                  "Brampton",
                  "Edmonton",
                  "Hamilton"
                ].map((city, idx) => (
                  <Link
                    href={`/services/${slug}/${city.toLowerCase().replace(/ /g, '-')}`}
                    key={idx}
                    className="bg-white border border-gray-200/80 rounded-2xl py-3 sm:py-4 px-3 sm:px-6 flex items-center justify-center gap-3 shadow-sm hover:shadow-[0_4px_20px_rgba(0,85,255,0.05)] hover:border-[#0055FF]/30 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0055FF]/5 flex items-center justify-center text-[#0055FF] group-hover:bg-[#0055FF] group-hover:text-white transition-colors duration-300 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-[#0f172a] font-bold text-sm sm:text-base group-hover:text-[#0055FF] transition-colors">{city}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}



        {/* FAQ Section */}
        <FAQ faqs={service.faqs} />

        {/* CTA Section - Slim */}
        <section id="contact" className="py-10 bg-[#1a1a2e]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-[#262b3f]/20 to-transparent rounded-2xl p-6 md:p-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Ready To Get Started?
                </h2>
                <p className="text-white/70 text-sm">
                  Let&apos;s discuss how our {service.title.toLowerCase()} services can help transform your business.
                </p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openLetsTalkBusiness'))}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00E1FF] to-[#0055FF] hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap shadow-lg shadow-[#00E1FF]/20"
              >
                Transform Your Digital Presence
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
