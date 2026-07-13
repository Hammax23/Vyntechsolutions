import fs from "fs";

function stripDataBlock(src, startMarker) {
  const start = src.indexOf(startMarker);
  if (start < 0) throw new Error("start not found: " + startMarker);
  // find end of object literal after =
  const eq = src.indexOf("=", start);
  let i = eq + 1;
  while (/\s/.test(src[i])) i++;
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        // include trailing semicolon/newlines
        let end = i + 1;
        while (src[end] === ";" || src[end] === "\r" || src[end] === "\n" || src[end] === " ") end++;
        return { before: src.slice(0, start), after: src.slice(end) };
      }
    } else if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") {
          i += 2;
          continue;
        }
        if (src[i] === q) break;
        i++;
      }
    }
  }
  throw new Error("unclosed");
}

function stripInterface(src, name) {
  const re = new RegExp(`interface ${name} \\{[\\s\\S]*?\\n\\};?\\n*`);
  return src.replace(re, "");
}

// --- Services page ---
{
  let src = fs.readFileSync("src/app/services/[slug]/page.tsx", "utf8");
  const { before, after } = stripDataBlock(src, "const servicesData:");
  src = before + after;
  src = stripInterface(src, "ServiceData");

  // ensure imports
  if (!src.includes('from "@/data/servicesData"')) {
    src = src.replace(
      'import Footer from "@/components/Footer";',
      `import Footer from "@/components/Footer";\nimport { servicesData, type ServiceData } from "@/data/servicesData";`
    );
  }

  // replace const service = servicesData[slug] with state+fetch
  src = src.replace(
    `export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const service = servicesData[slug];
  
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);`,
    `export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [service, setService] = useState<ServiceData | null>(servicesData[slug] || null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    let cancelled = false;
    fetch(\`/api/cms/services/\${slug}\`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.service) setService(data.service);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);`
  );

  fs.writeFileSync("src/app/services/[slug]/page.tsx", src);
  console.log("Updated services page", src.length);
}

// --- Industries page ---
{
  let src = fs.readFileSync("src/app/industries/[slug]/page.tsx", "utf8");
  const { before, after } = stripDataBlock(src, "const industriesData:");
  src = before + after;
  src = stripInterface(src, "IndustryData");

  if (!src.includes('from "@/data/industriesData"')) {
    src = src.replace(
      'import Footer from "@/components/Footer";',
      `import Footer from "@/components/Footer";\nimport { useEffect, useState } from "react";\nimport { industriesData, type IndustryData } from "@/data/industriesData";`
    );
  }

  // industries currently only imports useParams, needs useState useEffect
  if (!src.includes('from "react"') && !src.includes("useState")) {
    // already added above
  }

  src = src.replace(
    `export default function IndustryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const industry = industriesData[slug];`,
    `export default function IndustryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [industry, setIndustry] = useState<IndustryData | null>(industriesData[slug] || null);

  useEffect(() => {
    let cancelled = false;
    fetch(\`/api/cms/industries/\${slug}\`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.industry) setIndustry(data.industry);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);`
  );

  fs.writeFileSync("src/app/industries/[slug]/page.tsx", src);
  console.log("Updated industries page", src.length);
}
