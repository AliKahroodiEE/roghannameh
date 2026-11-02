import { Building2, Car, Store } from "lucide-react";
import { demoLogin } from "@/app/actions";

const ROLES = [
  { role: "shop", Icon: Store, title: "صاحب تعویض‌روغنی", text: "ثبت سرویس در کمتر از یک دقیقه، چاپ برچسب QR و یادآوری به مشتری‌ها" },
  { role: "customer", Icon: Car, title: "مشتری", text: "همه‌ی سرویس‌های خودروهایش، از هر تعویض‌روغنی، و موعد تعویض بعدی" },
  { role: "admin", Icon: Building2, title: "سفارش‌دهنده (مدیر سامانه)", text: "همه‌ی مغازه‌ها، خودروها و سرویس‌ها؛ افزودن و غیرفعال‌کردن مغازه" },
];

// One-click entry to each dashboard with the demo accounts.
export default function DemoLogins({ compact = false }) {
  return (
    <div className={`grid gap-3 ${compact ? "" : "sm:grid-cols-3"}`}>
      {ROLES.map(({ role, Icon, title, text }) => (
        <form key={role} action={demoLogin}>
          <input type="hidden" name="role" value={role} />
          <button className="group flex h-full w-full items-start gap-3 rounded-2xl border border-line bg-paper p-4 text-right transition hover:border-ink">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-oil-soft text-oil-dark transition group-hover:bg-oil group-hover:text-ink">
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block font-bold">ورود به‌عنوان {title}</span>
              {!compact && <span className="mt-1 block text-sm leading-6 text-steel">{text}</span>}
            </span>
          </button>
        </form>
      ))}
    </div>
  );
}
