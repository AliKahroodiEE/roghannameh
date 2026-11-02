import { Droplet } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { dueStatus } from "@/lib/service";
import { faNumber, jDate, relativeDays } from "@/lib/format";

const BAR = { ok: "bg-ok", soon: "bg-oil", due: "bg-due" };

// The next oil change: by kilometres or by date, whichever comes first.
export default function DueCard({ service }) {
  const { level, progress } = dueStatus(service);
  return (
    <section className="rounded-2xl bg-ink p-5 text-white">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm text-white/70">
          <Droplet className="size-4 text-oil" />
          تعویض روغن بعدی
        </p>
        <StatusBadge level={level} />
      </div>
      <p className="mt-3 text-sm text-white/70">در کیلومتر</p>
      <p className="text-4xl font-black tabular text-oil">{faNumber(service.nextKm)}</p>
      <p className="mt-3 text-sm text-white/80">
        یا تا <b className="text-white">{jDate(service.nextDate)}</b>
        <span className="text-white/60"> ({relativeDays(service.nextDate)})</span>
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="زمان سپری‌شده تا تعویض بعدی">
        <div className={`h-full rounded-full ${BAR[level]}`} style={{ width: `${Math.max(4, progress * 100)}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/50">هر کدام زودتر برسد؛ روغن حتی وقتی ماشین کم کار می‌کند هم کهنه می‌شود.</p>
    </section>
  );
}
