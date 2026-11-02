"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Gauge, Save, Search } from "lucide-react";
import Plate from "@/components/Plate";
import PlateInput from "@/components/PlateInput";
import { btn, card, input, label } from "@/components/ui";
import { findCar, logService } from "@/app/actions";
import { CAR_MODELS, INTERVAL_MONTHS, ITEMS, OIL_BRANDS, OIL_GRADES, intervalKm, servicePrice } from "@/lib/catalog";
import { faDigits, faNumber, jDate, latinDigits, toman } from "@/lib/format";

const chip =
  "cursor-pointer rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium transition has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-oil";
const LITERS = [3.5, 4, 4.5, 5];

// Two steps: find the car by plate, then log what was done. Price and next due date fill in as you go.
export default function ServiceForm({ initialCar }) {
  const [found, find, finding] = useActionState(findCar, initialCar ? { car: initialCar } : null);
  const car = found?.car;
  const newPlate = found?.newPlate;

  if (!car && !newPlate) {
    return (
      <form action={find} className={`${card} p-5`}>
        <p className={label}>پلاک خودرو</p>
        <PlateInput autoFocus />
        {found?.error && <p className="mt-3 text-sm text-due">{found.error}</p>}
        <button disabled={finding} className={`${btn.primary} mt-5 w-full sm:w-auto`}>
          <Search className="size-4" />
          {finding ? "در حال جستجو…" : "پیدا کردن خودرو"}
        </button>
        <p className="mt-4 text-sm text-steel">اگر خودرو قبلاً در هیچ تعویض‌روغنی سامانه ثبت نشده باشد، همین‌جا ثبتش می‌کنید.</p>
      </form>
    );
  }

  return <Details car={car} plate={car?.plate ?? newPlate} />;
}

function Details({ car, plate }) {
  const [saved, save, saving] = useActionState(logService, null);
  const last = car?.services?.[0];
  const [odometer, setOdometer] = useState("");
  const [oilBrand, setOilBrand] = useState(last?.oilBrand ?? OIL_BRANDS[0]);
  const [oilGrade, setOilGrade] = useState(last?.oilGrade ?? "10W-40");
  const [oilLiters, setOilLiters] = useState(last?.oilLiters ?? 4);
  const [items, setItems] = useState(["oilFilter"]);
  const [price, setPrice] = useState(null); // null: follow the suggested price

  const suggested = servicePrice({ oilBrand, oilLiters, items });
  const km = Number(odometer) || 0;
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + INTERVAL_MONTHS);
  const toggleItem = (key) => setItems((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));

  return (
    <form action={save} className="space-y-5">
      <section className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <div>
          {car ? (
            <>
              <p className="font-bold">{car.model}</p>
              <p className="text-sm text-steel">
                {car.owner.name}
                {last && ` · سرویس قبلی در ${faNumber(last.odometer)} کیلومتر`}
              </p>
            </>
          ) : (
            <p className="font-bold text-oil-dark">خودروی جدید در سامانه</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Plate plate={plate} size="sm" />
          <a href="/shop/service/new" className="grid size-9 place-items-center rounded-lg border border-line text-steel" aria-label="پلاک دیگر">
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      {car ? (
        <input type="hidden" name="carId" value={car.id} />
      ) : (
        <section className={`${card} grid gap-4 p-4 sm:grid-cols-2`}>
          <input type="hidden" name="plate" value={plate} />
          <div>
            <label htmlFor="ownerName" className={label}>نام مالک</label>
            <input id="ownerName" name="ownerName" className={input} required />
          </div>
          <div>
            <label htmlFor="ownerPhone" className={label}>موبایل مالک (برای یادآوری)</label>
            <input id="ownerPhone" name="ownerPhone" inputMode="tel" dir="ltr" placeholder="0912 123 4567" className={`${input} text-left`} required />
          </div>
          <div>
            <label htmlFor="model" className={label}>مدل خودرو</label>
            <select id="model" name="model" className={input} required defaultValue="">
              <option value="" disabled>انتخاب کنید</option>
              {CAR_MODELS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="year" className={label}>سال ساخت</label>
            <input id="year" name="year" inputMode="numeric" placeholder="۱۴۰۰" maxLength={4} className={input} />
          </div>
        </section>
      )}

      <section className={`${card} space-y-5 p-4`}>
        <div>
          <label htmlFor="odometer" className={label}>کیلومتر فعلی</label>
          <div className="relative">
            <Gauge className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-steel" />
            <input
              id="odometer"
              name="odometer"
              inputMode="numeric"
              autoComplete="off"
              className={`${input} pr-11 text-lg font-bold tabular`}
              value={faDigits(odometer)}
              onChange={(e) => setOdometer(latinDigits(e.target.value).replace(/\D/g, "").slice(0, 7))}
              placeholder={last ? faDigits(last.odometer + 5000) : "۸۵۰۰۰"}
              required
            />
          </div>
        </div>

        <fieldset>
          <legend className={label}>روغن موتور</legend>
          <div className="flex flex-wrap gap-2">
            {OIL_BRANDS.map((b) => (
              <label key={b} className={chip}>
                <input type="radio" name="oilBrand" value={b} checked={oilBrand === b} onChange={() => setOilBrand(b)} className="sr-only" />
                {b}
              </label>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2" dir="ltr">
            {OIL_GRADES.map(({ grade }) => (
              <label key={grade} className={chip}>
                <input type="radio" name="oilGrade" value={grade} checked={oilGrade === grade} onChange={() => setOilGrade(grade)} className="sr-only" />
                {grade}
              </label>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {LITERS.map((l) => (
              <label key={l} className={chip}>
                <input type="radio" name="oilLiters" value={l} checked={oilLiters === l} onChange={() => setOilLiters(l)} className="sr-only" />
                {faNumber(l)} لیتر
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={label}>اقلام تعویض‌شده</legend>
          <div className="flex flex-wrap gap-2">
            {ITEMS.map(({ key, label: text }) => (
              <label key={key} className={chip}>
                <input type="checkbox" name="items" value={key} checked={items.includes(key)} onChange={() => toggleItem(key)} className="sr-only" />
                {text}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className={label}>مبلغ (تومان)</label>
            <input
              id="price"
              name="price"
              inputMode="numeric"
              className={`${input} font-bold tabular`}
              value={faDigits(price ?? suggested)}
              onChange={(e) => setPrice(Number(latinDigits(e.target.value).replace(/\D/g, "")) || 0)}
              required
            />
            <p className="mt-1.5 text-xs text-steel">
              {toman(price ?? suggested)}
              {price !== null && price !== suggested && (
                <button type="button" onClick={() => setPrice(null)} className="mr-2 text-oil-dark underline">
                  قیمت پیشنهادی ({faNumber(suggested)})
                </button>
              )}
            </p>
          </div>
          <div>
            <label htmlFor="notes" className={label}>یادداشت (اختیاری)</label>
            <input id="notes" name="notes" placeholder="مثلاً: نشتی جزئی از کارتر" className={input} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-ink p-4 text-white">
        <p className="text-sm text-white/70">تعویض بعدی روی برچسب و صفحه‌ی مشتری:</p>
        <p className="mt-1 text-lg font-bold">
          {km ? <span className="tabular text-oil">{faNumber(km + intervalKm(oilGrade))} کیلومتر</span> : "کیلومتر را وارد کنید"}
          <span className="text-white/60"> یا تا </span>
          {jDate(nextDate)}
        </p>
      </section>

      {saved?.error && <p className="rounded-xl bg-due-soft p-3 text-sm text-due">{saved.error}</p>}
      <button disabled={saving} className={`${btn.oil} w-full text-lg`}>
        <Save className="size-5" />
        {saving ? "در حال ثبت…" : "ثبت سرویس"}
      </button>
    </form>
  );
}
