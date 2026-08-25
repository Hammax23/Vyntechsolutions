"use client";

import { useEffect, useMemo, useState } from "react";

const D = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
const S = "https://cdn.simpleicons.org";

type Tool = { name: string; logo?: string };

const tabs: {
  id: string;
  label: string;
  tools: Tool[];
}[] = [
  {
    id: "frontend",
    label: "Frontend",
    tools: [
      { name: "React", logo: `${D}/react/react-original.svg` },
      { name: "Next.js", logo: `${S}/nextdotjs` },
      { name: "Vue.js", logo: `${D}/vuejs/vuejs-original.svg` },
      { name: "Nuxt", logo: `${D}/nuxtjs/nuxtjs-original.svg` },
      { name: "TypeScript", logo: `${D}/typescript/typescript-original.svg` },
      { name: "JavaScript", logo: `${D}/javascript/javascript-original.svg` },
      { name: "HTML5", logo: `${D}/html5/html5-original.svg` },
      { name: "CSS3", logo: `${D}/css3/css3-original.svg` },
      { name: "Tailwind", logo: `${D}/tailwindcss/tailwindcss-original.svg` },
      { name: "Bootstrap", logo: `${D}/bootstrap/bootstrap-original.svg` },
      { name: "Sass", logo: `${D}/sass/sass-original.svg` },
      { name: "Redux", logo: `${D}/redux/redux-original.svg` },
      { name: "Vite", logo: `${D}/vitejs/vitejs-original.svg` },
      { name: "Webpack", logo: `${D}/webpack/webpack-original.svg` },
      { name: "Zustand", logo: "/tech/zustand.svg" },
      { name: "React Query", logo: `${S}/reactquery` },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    tools: [
      { name: "Node.js", logo: `${D}/nodejs/nodejs-original.svg` },
      { name: "Express", logo: `${D}/express/express-original.svg` },
      { name: "NestJS", logo: `${D}/nestjs/nestjs-original.svg` },
      { name: "Laravel", logo: `${D}/laravel/laravel-original.svg` },
      { name: "PHP", logo: `${D}/php/php-original.svg` },
      { name: "Python", logo: `${D}/python/python-original.svg` },
      { name: "Django", logo: `${D}/django/django-plain.svg` },
      { name: "FastAPI", logo: `${D}/fastapi/fastapi-original.svg` },
      { name: "GraphQL", logo: `${D}/graphql/graphql-plain.svg` },
      { name: "Java", logo: `${D}/java/java-original.svg` },
      { name: "Spring", logo: `${D}/spring/spring-original.svg` },
      { name: "C#", logo: `${D}/csharp/csharp-original.svg` },
      { name: "Dotnet", logo: `${D}/dot-net/dot-net-original.svg` },
      { name: "TypeScript", logo: `${D}/typescript/typescript-original.svg` },
      { name: "REST", logo: `${S}/swagger` },
      { name: "BullMQ", logo: "/tech/bullmq.svg" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    tools: [
      { name: "React Native", logo: `${D}/react/react-original.svg` },
      { name: "Flutter", logo: `${D}/flutter/flutter-original.svg` },
      { name: "Dart", logo: `${D}/dart/dart-original.svg` },
      { name: "Swift", logo: `${D}/swift/swift-original.svg` },
      { name: "Kotlin", logo: `${D}/kotlin/kotlin-original.svg` },
      { name: "Firebase", logo: `${D}/firebase/firebase-original.svg` },
      { name: "TypeScript", logo: `${D}/typescript/typescript-original.svg` },
      { name: "SQLite", logo: `${D}/sqlite/sqlite-original.svg` },
      { name: "Expo", logo: `${S}/expo` },
      { name: "SwiftUI", logo: `${S}/swift` },
      { name: "Jetpack Compose", logo: `${S}/jetpackcompose` },
      { name: "Realm", logo: "https://cdn.jsdelivr.net/npm/simple-icons@11/icons/realm.svg" },
    ],
  },
  {
    id: "database",
    label: "Database",
    tools: [
      { name: "PostgreSQL", logo: `${D}/postgresql/postgresql-original.svg` },
      { name: "MongoDB", logo: `${D}/mongodb/mongodb-original.svg` },
      { name: "MySQL", logo: `${D}/mysql/mysql-original.svg` },
      { name: "Redis", logo: `${D}/redis/redis-original.svg` },
      { name: "Firebase", logo: `${D}/firebase/firebase-original.svg` },
      { name: "Prisma", logo: `${D}/prisma/prisma-original.svg` },
      { name: "Supabase", logo: `${D}/supabase/supabase-original.svg` },
      { name: "Elasticsearch", logo: `${D}/elasticsearch/elasticsearch-original.svg` },
      { name: "SQLite", logo: `${D}/sqlite/sqlite-original.svg` },
      { name: "MariaDB", logo: `${D}/mariadb/mariadb-original.svg` },
      { name: "DynamoDB", logo: "https://cdn.jsdelivr.net/npm/simple-icons@11/icons/amazondynamodb.svg" },
      { name: "TypeORM", logo: `${S}/typeorm` },
      { name: "Mongoose", logo: `${S}/mongoose` },
    ],
  },
  {
    id: "devops",
    label: "DevOps",
    tools: [
      { name: "AWS", logo: `${D}/amazonwebservices/amazonwebservices-plain-wordmark.svg` },
      { name: "Azure", logo: `${D}/azure/azure-original.svg` },
      { name: "Google Cloud", logo: `${D}/googlecloud/googlecloud-original.svg` },
      { name: "Docker", logo: `${D}/docker/docker-original.svg` },
      { name: "Kubernetes", logo: `${D}/kubernetes/kubernetes-plain.svg` },
      { name: "Terraform", logo: `${D}/terraform/terraform-original.svg` },
      { name: "Git", logo: `${D}/git/git-original.svg` },
      { name: "GitHub", logo: `${D}/github/github-original.svg` },
      { name: "GitLab", logo: `${D}/gitlab/gitlab-original.svg` },
      { name: "Nginx", logo: `${D}/nginx/nginx-original.svg` },
      { name: "Linux", logo: `${D}/linux/linux-original.svg` },
      { name: "Grafana", logo: `${D}/grafana/grafana-original.svg` },
      { name: "Cloudflare", logo: `${S}/cloudflare` },
      { name: "Vercel", logo: `${S}/vercel` },
      { name: "Ansible", logo: `${D}/ansible/ansible-original.svg` },
    ],
  },
  {
    id: "seo",
    label: "SEO",
    tools: [
      { name: "Search Console", logo: `${S}/googlesearchconsole` },
      { name: "GA4", logo: `${S}/googleanalytics` },
      { name: "Tag Manager", logo: `${S}/googletagmanager` },
      { name: "Ahrefs", logo: "/tech/ahrefs.svg" },
      { name: "SEMrush", logo: `${S}/semrush` },
      { name: "Screaming Frog", logo: "/tech/screaming-frog.svg" },
      { name: "Schema.org", logo: "/tech/schema.svg" },
      { name: "Next.js", logo: `${S}/nextdotjs` },
      { name: "Yoast", logo: `${S}/yoast` },
      { name: "Rank Math", logo: "/tech/rankmath.svg" },
      { name: "Hotjar", logo: `${S}/hotjar` },
      { name: "Looker Studio", logo: `${S}/looker` },
      { name: "PageSpeed", logo: `${S}/pagespeedinsights` },
    ],
  },
  {
    id: "design",
    label: "Design",
    tools: [
      { name: "Figma", logo: `${D}/figma/figma-original.svg` },
      { name: "Adobe XD", logo: `${D}/xd/xd-plain.svg` },
      { name: "Illustrator", logo: `${D}/illustrator/illustrator-plain.svg` },
      { name: "Photoshop", logo: `${D}/photoshop/photoshop-original.svg` },
      { name: "After Effects", logo: `${D}/aftereffects/aftereffects-original.svg` },
      { name: "Sketch", logo: `${D}/sketch/sketch-original.svg` },
      { name: "Framer", logo: `${S}/framer` },
      { name: "Miro", logo: `${S}/miro` },
      { name: "Lottie", logo: `${S}/lottiefiles` },
      { name: "Webflow", logo: `${S}/webflow` },
      { name: "Canva", logo: "https://cdn.jsdelivr.net/npm/simple-icons@11/icons/canva.svg" },
    ],
  },
];

function ToolLogo({ tool }: { tool: Tool }) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(tool.logo) && !failed;

  return (
    <span className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tool.logo}
          alt=""
          className="h-8 w-8 object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-[10px] font-semibold text-slate-500 leading-none text-center px-0.5">
          {tool.name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

const LOGO_BY_NAME: Record<string, string> = Object.fromEntries(
  tabs.flatMap((tab) => tab.tools.filter((t) => t.logo).map((t) => [t.name.toLowerCase(), t.logo as string]))
);

function resolveTool(name: string): Tool {
  const logo = LOGO_BY_NAME[name.toLowerCase()];
  return logo ? { name, logo } : { name };
}

export default function TechnologyStack() {
  const [stackTabs, setStackTabs] = useState(tabs);
  const [active, setActive] = useState(tabs[0].id);
  const [eyebrow, setEyebrow] = useState("Tech stack");
  const [heading, setHeading] = useState("Technology stack");
  const [body, setBody] = useState(
    "React, Next.js, Node.js, and cloud platforms we use to build websites, mobile apps, and custom software for every business."
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cms/content?type=homepage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const hp = data?.homepage as Record<string, unknown> | undefined;
        if (!hp) return;
        if (hp.techStackEyebrow) setEyebrow(String(hp.techStackEyebrow));
        if (hp.techStackHeading) setHeading(String(hp.techStackHeading));
        if (hp.techStackBody) setBody(String(hp.techStackBody));
        const cmsStack = hp.techStack as
          | { id?: string; label?: string; tools?: string[] }[]
          | undefined;
        if (Array.isArray(cmsStack) && cmsStack.length) {
          const next = cmsStack
            .filter((t) => t.label && Array.isArray(t.tools) && t.tools.length)
            .map((t, i) => ({
              id: String(t.id || `tab-${i}`),
              label: String(t.label),
              tools: t.tools!.map((name) => resolveTool(String(name))),
            }));
          if (next.length) {
            setStackTabs(next);
            setActive(next[0].id);
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const current = useMemo(
    () => stackTabs.find((c) => c.id === active) ?? stackTabs[0],
    [stackTabs, active]
  );

  return (
    <section
      id="tech-stack"
      aria-labelledby="tech-stack-heading"
      className="w-full bg-white py-16 sm:py-20 md:py-24 border-t border-slate-100"
    >
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0055FF] mb-3">
            {eyebrow}
          </p>
          <h2
            id="tech-stack-heading"
            className="text-[28px] sm:text-[2.15rem] font-semibold text-[#111827] mb-3"
          >
            {heading}
          </h2>
          <p className="text-[15px] text-slate-500 max-w-2xl mx-auto leading-relaxed">{body}</p>
        </div>

        <div
          role="tablist"
          aria-label="Stack categories"
          className="flex flex-wrap justify-center gap-x-8 sm:gap-x-10 md:gap-x-12 gap-y-1 mb-8 md:mb-10 border-b border-slate-200"
        >
          {stackTabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tech-panel-${tab.id}`}
                id={`tech-tab-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`px-4 sm:px-5 py-3.5 text-base sm:text-[17px] transition-colors -mb-px border-b-2 ${
                  isActive
                    ? "border-[#111827] text-[#111827] font-medium"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`tech-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`tech-tab-${current.id}`}
        >
          <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-8">
            {current.tools.map((tool) => (
              <li key={tool.name} className="flex flex-col items-center gap-2 text-center">
                <ToolLogo tool={tool} />
                <span className="text-[12px] text-slate-600 leading-tight">{tool.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
