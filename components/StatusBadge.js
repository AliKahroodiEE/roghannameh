import { STATUS_TEXT } from "@/lib/service";

const TONE = {
  ok: "bg-ok-soft text-ok",
  soon: "bg-warn-soft text-warn",
  due: "bg-due-soft text-due",
};

export default function StatusBadge({ level }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${TONE[level]}`}>{STATUS_TEXT[level]}</span>;
}
