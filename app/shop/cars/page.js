import Link from "next/link";
import { Search } from "lucide-react";
import Plate from "@/components/Plate";
import StatusBadge from "@/components/StatusBadge";
import { card, input } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dueStatus } from "@/lib/service";
import { jDate, latinDigits } from "@/lib/format";

export const metadata = { title: "خودروها" };

// Every car this shop has serviced; search by owner name, phone or plate digits.
export default async function CarsPage({ searchParams }) {
  const { shopId } = await requireRole("shop");
  const q = String((await searchParams).q ?? "").trim();
  const digits = latinDigits(q).replace(/\D/g, "");

  const cars = await prisma.car.findMany({
    where: {
      services: { some: { shopId } },
      ...(q && {
        OR: [
          { owner: { name: { contains: q } } },
          ...(digits ? [{ owner: { phone: { contains: digits } } }, { plate: { contains: digits } }] : []),
          { model: { contains: q } },
        ],
      }),
    },
    include: { owner: true, services: { orderBy: { date: "desc" }, take: 1 } },
  });
  cars.sort((a, b) => b.services[0].date - a.services[0].date);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">خودروها</h1>
      <form className="relative mb-5">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-steel" />
        <input name="q" defaultValue={q} placeholder="نام، موبایل، مدل یا عدد پلاک" className={`${input} pr-11`} />
      </form>
      {cars.length === 0 ? (
        <p className={`${card} p-6 text-center text-steel`}>خودرویی پیدا نشد.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {cars.map((car) => {
            const last = car.services[0];
            return (
              <li key={car.id}>
                <Link href={`/shop/cars/${car.id}`} className={`${card} flex items-center justify-between gap-3 p-4 transition hover:border-ink/30`}>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{car.owner.name}</p>
                    <p className="truncate text-sm text-steel">
                      {car.model} · آخرین سرویس {jDate(last.date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Plate plate={car.plate} size="sm" />
                    <StatusBadge level={dueStatus(last).level} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
