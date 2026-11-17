import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = String(process.env.ADMIN_EMAIL || "info@vyntechsolutions.ca")
  .trim()
  .toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "").trim();

const existing = await prisma.adminUser.findUnique({ where: { email } });
if (existing) {
  console.log("owner exists:", email);
} else if (!password) {
  console.log("skip: ADMIN_PASSWORD empty");
} else {
  await prisma.adminUser.create({
    data: {
      name: "Admin",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "owner",
      isActive: true,
    },
  });
  console.log("owner seeded:", email);
}
await prisma.$disconnect();
