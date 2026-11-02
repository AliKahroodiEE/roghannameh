import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink, Phone, Printer, Wrench } from "lucide-react";
import Plate from "@/components/Plate";
import DueCard from "@/components/DueCard";
import ServiceRecord from "@/components/ServiceRecord";
import { SectionTitle, btn, card } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { qrSvg, stickerUrl } from "@/lib/qr";
import { faDigits, phoneText } from "@/lib/format";

export const metadata = { title: "پرونده‌ی خودرو" };

export default async function CarPage({ params, searchParams }) {
  const { shopId } = await requireRole("shop");
  const id = Number((await params).id);
  const { saved } = await searchParams;
  const car = await prisma.car.findFirst({
    where: { id, services: { some: { shopId } } },
    include: { owner: true, services: { orderBy: { date: "desc" }, include: { shop: true } } },
  });
  if (!car) notFound();
  const qr = await qrSvg(await stickerUrl(car.code));

  return (
    <div className="space-y-6">
      {saved && (
        <p className="flex items-center gap-2 rounded-2xl bg-ok-soft p-4 font-medium text-ok">
          <CheckCircle2 className="size-5" />
          سرویس ثبت شد؛ مشتری با اسکن برچسب همین حالا آن را می‌بیند.
        </p>
      )}

      <section className={`${card} grid gap-5 p-5 md:grid-cols-[1fr_auto]`}>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black">{car.model}</h1>
            {car.year && <span className="text-steel">مدل {faDigits(car.year)}</span>}
          </div>
          <div className="mt-3">
            <Plate plate={car.plate} />
          </div>
          <p className="mt-4 font-bold">{car.owner.name}</p>
          <a href={`tel:${car.owner.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-steel hover:text-ink" dir="ltr">
            <Phone className="size-4" />
            {phoneText(car.owner.phone)}
          </a>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/shop/service/new?car=${car.id}`} className={btn.oil}>
              <Wrench className="size-4" />
              ثبت سرویس
            </Link>
            <Link href={`/shop/cars/${car.id}/sticker`} className={btn.ghost}>
              <Printer className="size-4" />
              چاپ برچسب
            </Link>
            <Link href={`/c/${car.code}`} className={btn.ghost}>
              <ExternalLink className="size-4" />
              صفحه‌ی مشتری
            </Link>
          </div>
        </div>
        <div className="mx-auto w-36 text-center md:mx-0">
          <div className="rounded-xl border border-line bg-white p-2.5 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="mt-1.5 font-mono text-xs tracking-widest text-steel">{car.code}</p>
        </div>
      </section>

      <DueCard service={car.services[0]} />

      <section>
        <SectionTitle>سوابق سرویس ({faDigits(car.services.length)})</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {car.services.map((s) => (
            <ServiceRecord key={s.id} service={s} showShop={s.shopId !== shopId} />
          ))}
        </div>
      </section>
    </div>
  );
}
