// Fills the database with the demo platform (see lib/demo-data.js).
// With --if-empty it leaves an existing database alone (used by the Vercel build).
import { PrismaClient } from "@prisma/client";
import { seedDemo } from "../lib/demo-data.js";

const prisma = new PrismaClient();

try {
  if (process.argv.includes("--if-empty") && (await prisma.shop.count()) > 0) {
    console.log("The database already has data; left it unchanged.");
  } else {
    const { shops, services } = await seedDemo(prisma);
    console.log(`Seeded ${shops} shops and ${services} services.`);
  }
} finally {
  await prisma.$disconnect();
}
