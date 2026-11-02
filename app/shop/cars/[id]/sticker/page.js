import { notFound } from "next/navigation";
import { Mark } from "@/components/Brand";
import Plate from "@/components/Plate";
import PrintButton from "./PrintButton";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { qrSvg, stickerUrl } from "@/lib/qr";
import { faNumber, jDateShort, phoneText } from "@/lib/format";

export const metadata = { title: "چاپ برچسب" };

// Windscreen sticker, about 9×6 cm when printed. The QR stays valid for the car's life;
// the next-change line is also written on it, like the old paper stickers.
export default async function StickerPage({ params }) {
  const { shopId } = await requireRole("shop");
  const car = await prisma.car.findFirst({
    where: { id: Number((await params).id), services: { some: { shopId } } },
    include: { services: { orderBy: { date: "desc" }, take: 1 } },
  });
  if (!car) notFound();
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  const qr = await qrSvg(await stickerUrl(car.code));
  const last = car.services[0];

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="no-print text-center">
        <h1 className="text-2xl font-black">برچسب QR</h1>
        <p className="mt-1 text-sm text-steel">روی شیشه یا زیر کاپوت؛ با هر گوشی و بدون نصب برنامه اسکن می‌شود.</p>
      </div>

      <div className="flex w-[9cm] gap-3 rounded-[10px] border-2 border-ink bg-white p-3 text-ink print:shadow-none">
        <div className="w-[3.4cm] shrink-0 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <Mark className="size-5" />
            <span className="text-sm font-black">روغن‌نامه</span>
          </div>
          <p className="text-[10px] leading-4">برای سوابق سرویس اسکن کنید</p>
          <div className="rounded-md bg-mist px-2 py-1.5 text-[11px] leading-5">
            تعویض بعدی: <b className="tabular">{faNumber(last.nextKm)}</b> کیلومتر
            <br />
            یا تا <b className="tabular">{jDateShort(last.nextDate)}</b>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-[10px] font-bold">{shop.name}</span>
            <span className="text-[10px] tabular" dir="ltr">{phoneText(shop.phone)}</span>
          </div>
        </div>
      </div>
      <div className="no-print flex flex-col items-center gap-4">
        <Plate plate={car.plate} size="sm" />
        <PrintButton />
      </div>
    </div>
  );
}
