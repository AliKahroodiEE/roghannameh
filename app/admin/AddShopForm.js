"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addShop } from "@/app/actions";
import { btn, card, input, label } from "@/components/ui";

const FIELDS = [
  { name: "name", text: "نام مغازه", placeholder: "تعویض روغنی …" },
  { name: "ownerName", text: "نام صاحب مغازه" },
  { name: "phone", text: "موبایل (برای ورود به پنل)", placeholder: "0912 123 4567", ltr: true },
  { name: "city", text: "شهر" },
  { name: "address", text: "نشانی", wide: true },
];

export default function AddShopForm() {
  const [state, action, pending] = useActionState(addShop, null);
  return (
    <form action={action} key={state?.ok} className={`${card} grid gap-4 p-4 sm:grid-cols-2`}>
      {FIELDS.map(({ name, text, placeholder, ltr, wide }) => (
        <div key={name} className={wide ? "sm:col-span-2" : ""}>
          <label htmlFor={name} className={label}>{text}</label>
          <input id={name} name={name} placeholder={placeholder} dir={ltr ? "ltr" : undefined} className={`${input} ${ltr ? "text-left" : ""}`} required />
        </div>
      ))}
      {state?.error && <p className="text-sm text-due sm:col-span-2">{state.error}</p>}
      {state?.ok && <p className="text-sm text-ok sm:col-span-2">{state.ok}</p>}
      <button disabled={pending} className={`${btn.primary} sm:col-span-2`}>
        <Plus className="size-4" />
        {pending ? "در حال افزودن…" : "افزودن مغازه"}
      </button>
    </form>
  );
}
