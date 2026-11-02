import Plate from "@/components/Plate";
import Shell from "@/components/Shell";
import { SectionTitle, Stat, card } from "@/components/ui";
import { toggleShop } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { daysAgo, faNumber, jDate, phoneText } from "@/lib/format";
import AddShopForm from "./AddShopForm";

export const metadata = { title: "مدیر سامانه" };

// The platform operator: every shop, its activity, and the switch to turn a shop off.
export default async function AdminDashboard() {
  const session = await requireRole("admin");
  const monthAgo = daysAgo(30);

  const [shops, carCount, month, byShop, lastByShop, recent] = await Promise.all([
    prisma.shop.findMany({ orderBy: { id: "asc" }, include: { _count: { select: { cars: true } } } }),
    prisma.car.count(),
    prisma.service.aggregate({ where: { date: { gte: monthAgo } }, _count: true, _sum: { price: true } }),
    prisma.service.groupBy({ by: ["shopId"], where: { date: { gte: monthAgo } }, _count: true, _sum: { price: true } }),
    prisma.service.groupBy({ by: ["shopId"], _max: { date: true } }),
    prisma.service.findMany({ orderBy: { date: "desc" }, take: 8, include: { car: true, shop: true } }),
  ]);
  const monthOf = Object.fromEntries(byShop.map((r) => [r.shopId, r]));
  const lastOf = Object.fromEntries(lastByShop.map((r) => [r.shopId, r._max.date]));

  return (
    <Shell home="/admin" title="مدیر سامانه" subtitle={session.name}>
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="مغازه‌های فعال" value={faNumber(shops.filter((s) => s.active).length)} hint={`از ${faNumber(shops.length)} مغازه`} />
          <Stat label="خودروهای ثبت‌شده" value={faNumber(carCount)} />
          <Stat label="سرویس در ۳۰ روز اخیر" value={faNumber(month._count)} tone="ok" />
          <Stat label="گردش مالی ۳۰ روز" value={faNumber(Math.round((month._sum.price ?? 0) / 1e6))} hint="میلیون تومان، همه‌ی مغازه‌ها" tone="oil" />
        </div>

        <section>
          <SectionTitle>مغازه‌ها</SectionTitle>
          <div className={`${card} overflow-x-auto`}>
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line text-right text-steel">
                <tr>
                  <th className="p-3 font-medium">مغازه</th>
                  <th className="p-3 font-medium">صاحب مغازه</th>
                  <th className="p-3 font-medium">خودرو</th>
                  <th className="p-3 font-medium">سرویس ۳۰ روز</th>
                  <th className="p-3 font-medium">آخرین فعالیت</th>
                  <th className="p-3 font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shops.map((shop) => (
                  <tr key={shop.id} className={shop.active ? "" : "text-steel"}>
                    <td className="p-3">
                      <p className="font-bold">{shop.name}</p>
                      <p className="text-xs text-steel">{shop.city}</p>
                    </td>
                    <td className="p-3">
                      <p>{shop.ownerName}</p>
                      <p className="text-xs text-steel" dir="ltr">{phoneText(shop.phone)}</p>
                    </td>
                    <td className="p-3 tabular">{faNumber(shop._count.cars)}</td>
                    <td className="p-3 tabular">{faNumber(monthOf[shop.id]?._count ?? 0)}</td>
                    <td className="p-3">{lastOf[shop.id] ? jDate(lastOf[shop.id]) : "—"}</td>
                    <td className="p-3">
                      <form action={toggleShop}>
                        <input type="hidden" name="shopId" value={shop.id} />
                        <button
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${shop.active ? "bg-ok-soft text-ok" : "bg-due-soft text-due"}`}
                          aria-label={`${shop.active ? "غیرفعال کردن" : "فعال کردن"} ${shop.name}`}
                        >
                          {shop.active ? "فعال" : "غیرفعال"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <SectionTitle>آخرین سرویس‌ها در سامانه</SectionTitle>
            <ul className={`${card} divide-y divide-line`}>
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{s.shop.name}</p>
                    <p className="truncate text-sm text-steel">
                      {s.car.model} · {jDate(s.date)}
                    </p>
                  </div>
                  <Plate plate={s.car.plate} size="sm" />
                </li>
              ))}
            </ul>
          </section>
          <section>
            <SectionTitle>افزودن مغازه</SectionTitle>
            <AddShopForm />
          </section>
        </div>
      </div>
    </Shell>
  );
}
