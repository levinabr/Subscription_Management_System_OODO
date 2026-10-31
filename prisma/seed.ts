import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminName = process.env.ADMIN_NAME || "Brightloop Admin";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@brightloop.io").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";

  console.log(`Checking bootstrap admin account: ${adminEmail}...`);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
      },
    });
    console.log(`✅ Admin account created successfully: ${admin.email} (ID: ${admin.id})`);
  } else {
    console.log(`ℹ️ Admin account already exists: ${existingAdmin.email} (ID: ${existingAdmin.id}) - Skipping creation.`);
  }

  // Seed standard GST Tax Rule (18% = 1800 basis points) if none exist
  const existingTax = await prisma.taxRule.findFirst({
    where: { name: "GST Standard 18%" },
  });

  if (!existingTax) {
    const tax = await prisma.taxRule.create({
      data: {
        name: "GST Standard 18%",
        rate: 1800, // 1800 basis points = 18.00%
        active: true,
      },
    });
    console.log(`✅ Default Tax Rule created: ${tax.name} (Rate: ${tax.rate} bps)`);
  } else {
    console.log(`ℹ️ Default Tax Rule already exists: ${existingTax.name}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
