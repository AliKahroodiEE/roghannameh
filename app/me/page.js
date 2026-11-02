import Link from "next/link";
import { BellRing, QrCode } from "lucide-react";
import Shell from "@/components/Shell";
import Plate from "@/components/Plate";
import DueCard from "@/components/DueCard";
import ServiceRecord from "@/components/ServiceRecord";
import { card } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { faDigits, maskedPhone, toman } from "@/lib/format";

export const metadata = { title: "خودروهای من" };

// The car owner's dashboard: every car, every service from any shop on the platform.
export default async function MyCars() {
  const { userId } = await requireRole("customer");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { cars: { include: { services: { orderBy: { date: "desc" }, include: { shop: true } } } } },
  });

  return (
    <Shell home="/me" title={user.name} subtitle={maskedPhone(user.phone)}>
      <div className="mx-auto max-w-2xl space-y-10">
        <div>
          <h1 className="text-2xl font-black">خودروهای من</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-steel">
            <BellRing className="size-4 text-oil-dark" />
            یک هفته قبل از موعد، پیامک یادآوری برایتان ارسال می‌شود.
          </p>
        </div>

        {user.cars.length === 0 && (
          <p className={`${card} p-6 text-center leading-7 text-steel`}>
            هنوز خودرویی به این شماره ثبت نشده است. در تعویض‌روغنی‌های عضو، شماره‌ی موبایلتان را بدهید تا سوابق سرویس اینجا جمع شود.
          </p>
        )}

        {user.cars.map((car) => {
          const total = car.services.reduce((sum, s) => sum + s.price, 0);
          return (
            <section key={car.id} className="space-y-4">
              <div className={`${card} flex items-center justify-between gap-3 p-4`}>
                <div>
                  <h2 className="text-lg font-black">{car.model}</h2>
                  <p className="text-sm text-steel">
                    {faDigits(car.services.length)} سرویس · مجموع {toman(total)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Plate plate={car.plate} size="sm" />
                  <Link href={`/c/${car.code}`} className="inline-flex items-center gap-1 text-xs font-medium text-oil-dark">
                    <QrCode className="size-3.5" />
                    صفحه‌ی برچسب
                  </Link>
                </div>
              </div>
              {car.services[0] && <DueCard service={car.services[0]} />}
              <div className="space-y-3">
                {car.services.map((s) => (
                  <ServiceRecord key={s.id} service={s} showShop />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
