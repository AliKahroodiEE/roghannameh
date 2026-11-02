// Shared class names, so every screen has the same buttons, cards and fields.
export const btn = {
  primary:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 font-bold text-white transition hover:bg-ink/85 disabled:opacity-50",
  oil: "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-oil px-5 font-bold text-ink transition hover:bg-oil-dark hover:text-white disabled:opacity-50",
  ghost:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 font-medium transition hover:border-ink/30",
};

export const card = "rounded-2xl border border-line bg-paper";
export const input =
  "h-12 w-full rounded-xl border border-line bg-paper px-3.5 outline-none transition focus:border-ink focus:ring-2 focus:ring-oil/40";
export const label = "mb-1.5 block text-sm font-medium text-steel";

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "ink" }) {
  const tones = { ink: "text-ink", oil: "text-oil-dark", warn: "text-warn", ok: "text-ok" };
  return (
    <div className={`${card} p-4`}>
      <p className="text-sm text-steel">{label}</p>
      <p className={`mt-1 text-2xl font-black tabular ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-steel">{hint}</p>}
    </div>
  );
}
