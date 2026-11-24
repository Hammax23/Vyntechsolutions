/**
 * Seed VynRank SEO Desk demo org, users (CEO / SEO Team / Client), packages, projects, tasks.
 * Usage: node scripts/seed-vynrank.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD = process.env.VYNRANK_SEED_PASSWORD || "VynRank!2026";

async function upsertUser({ orgId, email, name, role, passwordHash }) {
  return prisma.vynRankUser.upsert({
    where: { email },
    update: { name, role, isActive: true, orgId, passwordHash },
    create: { orgId, email, name, role, passwordHash, isActive: true },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  let org = await prisma.vynRankOrg.findFirst({ where: { name: "VynTech SEO Desk" } });
  if (!org) {
    org = await prisma.vynRankOrg.create({ data: { name: "VynTech SEO Desk" } });
  }

  const ceo = await upsertUser({
    orgId: org.id,
    email: "ceo@vynrank.local",
    name: "Alex Chen",
    role: "ceo",
    passwordHash,
  });
  const seo1 = await upsertUser({
    orgId: org.id,
    email: "seo@vynrank.local",
    name: "Jordan Lee",
    role: "seo_team",
    passwordHash,
  });
  const seo2 = await upsertUser({
    orgId: org.id,
    email: "seo2@vynrank.local",
    name: "Sam Rivera",
    role: "seo_team",
    passwordHash,
  });
  const client = await upsertUser({
    orgId: org.id,
    email: "client@vynrank.local",
    name: "Taylor Brooks",
    role: "client",
    passwordHash,
  });

  const packageDefs = [
    {
      name: "Local Growth",
      priceCad: 1500,
      description: "Local SEO + GBP + citation hygiene",
      features: ["GBP optimization", "Local keyword set", "Monthly report"],
      sortOrder: 1,
    },
    {
      name: "Authority",
      priceCad: 3500,
      description: "Content + technical + link acquisition",
      features: ["Technical audits", "Content calendar", "Digital PR"],
      sortOrder: 2,
    },
    {
      name: "Enterprise",
      priceCad: 7500,
      description: "Multi-market SEO program with dedicated pod",
      features: ["Dedicated SEO lead", "AI visibility tracking", "Executive QBRs"],
      sortOrder: 3,
    },
  ];

  const packages = [];
  for (const def of packageDefs) {
    const existing = await prisma.vynRankPackage.findFirst({
      where: { orgId: org.id, name: def.name },
    });
    if (existing) {
      packages.push(
        await prisma.vynRankPackage.update({
          where: { id: existing.id },
          data: {
            priceCad: def.priceCad,
            description: def.description,
            features: def.features,
            sortOrder: def.sortOrder,
          },
        })
      );
    } else {
      packages.push(
        await prisma.vynRankPackage.create({
          data: { orgId: org.id, ...def },
        })
      );
    }
  }

  // Wipe demo projects/tasks for idempotent reseed of sample data
  await prisma.vynRankTask.deleteMany({ where: { project: { orgId: org.id } } });
  await prisma.vynRankProject.deleteMany({ where: { orgId: org.id } });

  const p1 = await prisma.vynRankProject.create({
    data: {
      orgId: org.id,
      name: "NorthPeak Dental — Local SEO",
      clientName: "NorthPeak Dental",
      clientUserId: client.id,
      packageId: packages[0].id,
      status: "active",
      health: "healthy",
      phase: "execution",
      monthlyRevenue: 1500,
      organicTraffic: 4200,
      keywordsTop10: 28,
      organicLeads: 36,
      clientRating: 4.8,
      goal: "Dominate local pack for core dental services in Mississauga.",
      assignees: { connect: [{ id: seo1.id }] },
    },
  });

  const p2 = await prisma.vynRankProject.create({
    data: {
      orgId: org.id,
      name: "Harbor Freight SaaS — Authority",
      clientName: "Harbor Freight SaaS",
      packageId: packages[1].id,
      status: "active",
      health: "attention",
      phase: "strategy",
      monthlyRevenue: 3500,
      organicTraffic: 11800,
      keywordsTop10: 64,
      organicLeads: 22,
      goal: "Rebuild topical authority after migration.",
      assignees: { connect: [{ id: seo1.id }, { id: seo2.id }] },
    },
  });

  const p3 = await prisma.vynRankProject.create({
    data: {
      orgId: org.id,
      name: "Maple Legal Group — Enterprise",
      clientName: "Maple Legal Group",
      packageId: packages[2].id,
      status: "onboarding",
      health: "healthy",
      phase: "onboarding",
      monthlyRevenue: 7500,
      organicTraffic: 0,
      keywordsTop10: 0,
      organicLeads: 0,
      goal: "National brand SEO for practice areas + AI visibility.",
      assignees: { connect: [{ id: seo2.id }] },
    },
  });

  await prisma.vynRankTask.createMany({
    data: [
      {
        projectId: p1.id,
        title: "Refresh service page schema",
        status: "in_progress",
        priority: "high",
        assigneeId: seo1.id,
      },
      {
        projectId: p1.id,
        title: "GBP photo + Q&A pass",
        status: "qa",
        priority: "medium",
        assigneeId: seo1.id,
      },
      {
        projectId: p2.id,
        title: "Crawl migration diff report",
        status: "submitted",
        priority: "high",
        assigneeId: seo2.id,
      },
      {
        projectId: p2.id,
        title: "Topic cluster outline — logistics",
        status: "todo",
        priority: "medium",
        assigneeId: seo1.id,
      },
      {
        projectId: p3.id,
        title: "Kickoff + access checklist",
        status: "in_progress",
        priority: "high",
        assigneeId: seo2.id,
      },
      {
        projectId: p3.id,
        title: "Baseline keyword + AI visibility audit",
        status: "todo",
        priority: "high",
        assigneeId: seo2.id,
      },
    ],
  });

  console.log("VynRank seed complete.");
  console.log("Org:", org.name, org.id);
  console.log("Users:");
  console.log("  CEO       ceo@vynrank.local /", PASSWORD, `(${ceo.id})`);
  console.log("  SEO Team  seo@vynrank.local /", PASSWORD, `(${seo1.id})`);
  console.log("  SEO Team  seo2@vynrank.local /", PASSWORD, `(${seo2.id})`);
  console.log("  Client    client@vynrank.local /", PASSWORD, `(${client.id})`);
  console.log("Projects:", p1.name, "|", p2.name, "|", p3.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
