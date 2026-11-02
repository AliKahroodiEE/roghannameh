"use client";

import { PLATE_LETTERS } from "@/lib/catalog";
import { faDigits, latinDigits, parsePlate } from "@/lib/format";
import { useState } from "react";

const field =
  "h-full bg-transparent text-center font-bold outline-none placeholder:text-steel/40 focus:bg-oil-soft";

// Plate entry laid out like the real plate. Submits plate_two, plate_letter, plate_three, plate_region.
export default function PlateInput({ defaultValue = "", autoFocus = false }) {
  const initial = parsePlate(defaultValue);
  const [value, setValue] = useState({ two: initial.two, three: initial.three, region: initial.region });
  const set = (key, max) => (e) =>
    setValue((v) => ({ ...v, [key]: latinDigits(e.target.value).replace(/\D/g, "").slice(0, max) }));

  return (
    <div dir="ltr" className="flex h-14 w-full max-w-xs items-stretch overflow-hidden rounded-lg border-2 border-ink bg-white text-2xl tabular">
      <span className="flex w-6 flex-col justify-between bg-plate py-1.5" aria-hidden="true">
        <span className="mx-auto h-[3px] w-2/3 bg-[#239f40]" />
        <span className="mx-auto h-[3px] w-2/3 bg-white" />
        <span className="mx-auto h-[3px] w-2/3 bg-[#da0000]" />
      </span>
      <input
        name="plate_two"
        inputMode="numeric"
        autoComplete="off"
        aria-label="دو رقم اول پلاک"
        placeholder="۱۲"
        className={`${field} w-14`}
        value={faDigits(value.two)}
        onChange={set("two", 2)}
        autoFocus={autoFocus}
        required
      />
      <select
        name="plate_letter"
        aria-label="حرف پلاک"
        defaultValue={initial.letter || "ب"}
        className={`${field} w-16 appearance-none font-black`}
        dir="rtl"
      >
        {PLATE_LETTERS.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      <input
        name="plate_three"
        inputMode="numeric"
        autoComplete="off"
        aria-label="سه رقم پلاک"
        placeholder="۳۴۵"
        className={`${field} min-w-0 flex-1`}
        value={faDigits(value.three)}
        onChange={set("three", 3)}
        required
      />
      <span className="flex w-14 flex-col items-center justify-center border-l-2 border-ink">
        <span className="text-[9px] font-medium leading-none">ایران</span>
        <input
          name="plate_region"
          inputMode="numeric"
          autoComplete="off"
          aria-label="کد شهر پلاک"
          placeholder="۶۷"
          className={`${field} h-auto w-full text-xl`}
          value={faDigits(value.region)}
          onChange={set("region", 2)}
          required
        />
      </span>
    </div>
  );
}
