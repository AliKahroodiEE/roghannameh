import { Check } from "lucide-react";
import { itemLabel, parseItems } from "@/lib/catalog";
import { faNumber, jDate, toman } from "@/lib/format";

// One visit in a car's history.
export default function ServiceRecord({ service, showShop = false, showPrice = true }) {
  const items = parseItems(service.items);
  return (
    <article className="rounded-2xl border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{jDate(service.date)}</p>
          {showShop && <p className="text-sm text-steel">{service.shop.name}</p>}
        </div>
        <p className="text-sm text-steel tabular">{faNumber(service.odometer)} کیلومتر</p>
      </div>
      <p className="mt-3 text-sm">
        روغن <b>{service.oilBrand}</b> <span dir="ltr">{service.oilGrade}</span> ·{" "}
        <span className="tabular">{faNumber(service.oilLiters)}</span> لیتر
      </p>
      {items.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="اقلام تعویض‌شده">
          {items.map((key) => (
            <li key={key} className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-xs">
              <Check className="size-3 text-ok" strokeWidth={3} />
              {itemLabel(key)}
            </li>
          ))}
        </ul>
      )}
      {showPrice && <p className="mt-3 border-t border-line pt-3 text-sm text-steel">هزینه: <b className="text-ink tabular">{toman(service.price)}</b></p>}
    </article>
  );
}
