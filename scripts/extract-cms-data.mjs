import fs from "fs";

function extractObjectLiteral(src, assignStart) {
  const eq = src.indexOf("=", assignStart);
  let i = eq + 1;
  while (src[i] && /\s/.test(src[i])) i++;
  if (src[i] !== "{") throw new Error("Expected object literal");
  let depth = 0;
  const start = i;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return src.slice(start, i + 1);
      }
    } else if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") {
          i += 2;
          continue;
        }
        if (src[i] === quote) break;
        i++;
      }
    }
  }
  throw new Error("Unclosed object");
}

function extract(file, startMarker, outFile, exportName, typeDecl) {
  const src = fs.readFileSync(file, "utf8");
  const start = src.indexOf(startMarker);
  if (start < 0) throw new Error(`start not found in ${file}`);
  const dataLiteral = extractObjectLiteral(src, start);
  const content = `${typeDecl}\n\nexport const ${exportName} = ${dataLiteral};\n`;
  fs.writeFileSync(outFile, content);
  console.log("Wrote", outFile, content.length, "bytes");
}

const serviceType = `export type ServiceData = {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  overview: string;
  features: { title: string; description: string; icon: string }[];
  technologies: string[];
  process: { step: string; description: string }[];
  stats: { value: string; label: string }[];
  caseStudies: { title: string; industry: string; result: string }[];
};`;

const industryType = `export type IndustryData = {
  title: string;
  subtitle: string;
  description: string;
  heroStats: { value: string; label: string }[];
  challenges: { title: string; description: string }[];
  services: { title: string; description: string }[];
  technologies: string[];
};`;

extract(
  "src/app/services/[slug]/page.tsx",
  "const servicesData:",
  "src/data/servicesData.ts",
  "servicesData: Record<string, ServiceData>",
  serviceType
);

extract(
  "src/app/industries/[slug]/page.tsx",
  "const industriesData:",
  "src/data/industriesData.ts",
  "industriesData: Record<string, IndustryData>",
  industryType
);
