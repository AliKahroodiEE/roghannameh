import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ServiceForm from "./ServiceForm";

export const metadata = { title: "ثبت سرویس" };

// /shop/service/new?car=12 skips the plate search (used from a car's page and the QR card).
export default async function NewServicePage({ searchParams }) {
  await requireRole("shop");
  const carId = Number((await searchParams).car) || null;
  const car =
    carId &&
    (await prisma.car.findUnique({
      where: { id: carId },
      include: { owner: { select: { name: true, phone: true } }, services: { orderBy: { date: "desc" }, take: 1 } },
    }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-black">ثبت سرویس</h1>
      <ServiceForm initialCar={car || null} />
    </div>
  );
}
