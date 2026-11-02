import Link from "next/link";
import { BellRing, Check, Phone, PlusCircle } from "lucide-react";
import Plate from "@/components/Plate";
import StatusBadge from "@/components/StatusBadge";
import { SectionTitle, Stat, btn, card } from "@/components/ui";
import { remind } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dueStatus } from "@/lib/service";
import { daysAgo, faNumber, jDate, phoneText, relativeDays, toman } from "@/lib/format";

export const metadata = { title: "داشبورد مغازه" };

export default async function ShopDashboard() {
  const { shopId } = await requireRole("shop");
  const monthAgo = daysAgo(30);

  const [month, carCount, recent, cars] = await Promise.all([
    prisma.service.aggregate({ where: { shopId, date: { gte: monthAgo } }, _count: true, _sum: { price: true } }),
    prisma.car.count({ where: { services: { some: { shopId } } } }),
    prisma.service.findMany({ where: { shopId }, orderBy: { date: "desc" }, take: 6, include: { car: true } }),
    // Each car's latest visit here decides whether it needs a reminder.
    prisma.car.findMany({
      where: { services: { some: { shopId } } },
      include: { owner: true, services: { where: { shopId }, orderBy: { date: "desc" }, take: 1 } },
    }),
  ]);

  const toRemind = cars
    .map((car) => ({ car, service: car.services[0], status: dueStatus(car.services[0]) }))
    .filter(({ status }) => status.level !== "ok")
    .sort((a, b) => a.status.daysLeft - b.status.daysLeft);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="سرویس در ۳۰ روز اخیر" value={faNumber(month._count)} />
        <Stat label="درآمد ۳۰ روز اخیر" value={faNumber(Math.round((month._sum.price ?? 0) / 1e6))} hint="میلیون تومان" tone="oil" />
        <Stat label="خودروهای مشتری" value={faNumber(carCount)} />
        <Stat label="نیاز به یادآوری" value={faNumber(toRemind.length)} hint="موعد نزدیک یا گذشته" tone="warn" />
      </div>

      <Link href="/shop/service/new" className={`${btn.oil} w-full text-lg`}>
        <PlusCircle className="size-5" />
        ثبت سرویس جدید
      </Link>

      <section>
        <SectionTitle>یادآوری به مشتری‌ها</SectionTitle>
        {toRemind.length === 0 ? (
          <p className={`${card} p-5 text-center text-steel`}>فعلاً موعد هیچ خودرویی نزدیک نیست.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {toRemind.map(({ car, service, status }) => (
              <li key={car.id} className={`${card} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/shop/cars/${car.id}`} className="min-w-0">
                    <p className="truncate font-bold">{car.owner.name}</p>
                    <p className="text-sm text-steel">{car.model}</p>
                  </Link>
                  <Plate plate={car.plate} size="sm" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                  <span className="text-steel">
                    موعد: {jDate(service.nextDate)} <span className="text-xs">({relativeDays(service.nextDate)})</span>
                  </span>
                  <StatusBadge level={status.level} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href={`tel:${car.owner.phone}`} className={btn.ghost} aria-label={`تماس با ${phoneText(car.owner.phone)}`}>
                    <Phone className="size-4" />
                    تماس
                  </a>
                  {service.remindedAt ? (
                    <span className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-ok-soft text-sm font-medium text-ok">
                      <Check className="size-4" />
                      پیامک ارسال شد
                    </span>
                  ) : (
                    <form action={remind}>
                      <input type="hidden" name="serviceId" value={service.id} />
                      <button className={`${btn.ghost} w-full`}>
                        <BellRing className="size-4" />
                        پیامک یادآوری
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle action={<Link href="/shop/cars" className="text-sm font-medium text-oil-dark">همه‌ی خودروها</Link>}>
          آخرین سرویس‌ها
        </SectionTitle>
        <ul className={`${card} divide-y divide-line`}>
          {recent.map((s) => (
            <li key={s.id}>
              <Link href={`/shop/cars/${s.carId}`} className="flex items-center justify-between gap-3 p-4 hover:bg-mist/60">
                <div className="min-w-0">
                  <p className="font-bold">{s.car.model}</p>
                  <p className="truncate text-sm text-steel">
                    {jDate(s.date)} · {s.oilBrand} <span dir="ltr">{s.oilGrade}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Plate plate={s.car.plate} size="sm" />
                  <span className="text-sm tabular">{toman(s.price)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
