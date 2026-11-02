import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, History, MapPinned, Phone, Wrench } from "lucide-react";
import Brand from "@/components/Brand";
import Plate from "@/components/Plate";
import DueCard from "@/components/DueCard";
import ServiceRecord from "@/components/ServiceRecord";
import MapLinks from "@/components/MapLinks";
import { btn, card } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { faDigits } from "@/lib/format";

async function loadCar(code) {
  return prisma.car.findUnique({
    where: { code: code.toUpperCase() },
    include: { shop: true, services: { orderBy: { date: "desc" }, take: 1, include: { shop: true } } },
  });
}

export async function generateMetadata({ params }) {
  const car = await loadCar((await params).code);
  return { title: car ? `دفترچه‌ی سرویس ${car.model}` : "برچسب پیدا نشد", robots: { index: false } };
}

// What anyone sees after scanning the sticker: the last service, the next one, and the shop.
// The owner's name and phone and the full history stay private (shown after login in /me).
export default async function CarCard({ params }) {
  const car = await loadCar((await params).code);
  if (!car) notFound();

  const session = await getSession();
  const isOwner = session?.role === "customer" && session.userId === car.ownerId;
  const isShop = session?.role === "shop";
  const last = car.services[0];
  const shop = last?.shop ?? car.shop;

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-10">
      <header className="flex items-center justify-between py-4">
        <Brand small />
        <span className="text-xs text-steel">دفترچه‌ی سرویس دیجیتال</span>
      </header>

      <section className={`${card} flex items-center justify-between gap-4 p-4`}>
        <div>
          <h1 className="text-xl font-black">{car.model}</h1>
          {car.year && <p className="text-sm text-steel">مدل {faDigits(car.year)}</p>}
        </div>
        <Plate plate={car.plate} />
      </section>

      {last ? (
        <div className="mt-4 space-y-4">
          <DueCard service={last} />
          <div>
            <h2 className="mb-2 flex items-center gap-1.5 font-bold">
              <Wrench className="size-4 text-steel" />
              آخرین سرویس
            </h2>
            <ServiceRecord service={last} showShop />
          </div>
        </div>
      ) : (
        <p className={`${card} mt-4 p-5 text-center text-steel`}>هنوز سرویسی برای این خودرو ثبت نشده است.</p>
      )}

      <section className={`${card} mt-4 p-4`}>
        <h2 className="font-bold">{shop.name}</h2>
        <p className="mt-2 flex gap-2 text-sm text-steel">
          <MapPinned className="mt-0.5 size-4 shrink-0" />
          {shop.address}
        </p>
        {shop.hours && (
          <p className="mt-1.5 flex gap-2 text-sm text-steel">
            <Clock className="mt-0.5 size-4 shrink-0" />
            {shop.hours}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={`tel:${shop.phone}`} className={btn.oil}>
            <Phone className="size-4" />
            تماس
          </a>
          <MapLinks lat={shop.lat} lng={shop.lng} />
        </div>
      </section>

      <div className="mt-4 grid gap-2">
        {isShop && (
          <Link href={`/shop/service/new?car=${car.id}`} className={btn.primary}>
            <Wrench className="size-4" />
            ثبت سرویس جدید برای این خودرو
          </Link>
        )}
        <Link href={isOwner ? "/me" : "/login?next=/me"} className={btn.ghost}>
          <History className="size-4" />
          {isOwner ? "همه‌ی سوابق خودروهای من" : "سوابق کامل (ورود مالک خودرو)"}
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-steel">این صفحه با اسکن برچسب QR خودرو باز شده است.</p>
    </div>
  );
}
