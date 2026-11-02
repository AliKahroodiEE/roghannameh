import { prisma } from "@/lib/db";
import { seedDemo } from "@/lib/demo-data";

// Vercel Cron calls this nightly (vercel.json) to put the public demo back to its starting data.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return Response.json(await seedDemo(prisma));
}
