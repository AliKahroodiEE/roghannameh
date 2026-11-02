import { faDigits, parsePlate } from "@/lib/format";

const SIZES = {
  sm: { box: "h-8 text-sm", strip: "w-3.5", gap: "gap-1 px-1.5", region: "px-1 text-xs", iran: "text-[7px]" },
  md: { box: "h-11 text-lg", strip: "w-5", gap: "gap-1.5 px-2.5", region: "px-1.5 text-base", iran: "text-[8px]" },
  lg: { box: "h-14 text-2xl", strip: "w-6", gap: "gap-2 px-3", region: "px-2 text-xl", iran: "text-[10px]" },
};

// An Iranian licence plate: blue strip, «۱۲ ب ۳۴۵», then the region code under «ایران».
export default function Plate({ plate, size = "md" }) {
  const p = parsePlate(plate);
  const s = SIZES[size];
  return (
    <span
      dir="ltr"
      className={`inline-flex shrink-0 items-stretch overflow-hidden rounded-md border-2 border-ink bg-white font-bold leading-none text-ink tabular ${s.box}`}
      aria-label={`پلاک ${faDigits(`${p.two} ${p.letter} ${p.three} ایران ${p.region}`)}`}
    >
      <span className={`flex flex-col justify-between bg-plate py-1 ${s.strip}`} aria-hidden="true">
        <span className="mx-auto h-[3px] w-2/3 bg-[#239f40]" />
        <span className="mx-auto h-[3px] w-2/3 bg-white" />
        <span className="mx-auto h-[3px] w-2/3 bg-[#da0000]" />
      </span>
      <span className={`flex items-center ${s.gap}`} aria-hidden="true">
        <span>{faDigits(p.two)}</span>
        <span className="font-black">{p.letter}</span>
        <span>{faDigits(p.three)}</span>
      </span>
      <span className={`flex flex-col items-center justify-center border-l-2 border-ink ${s.region}`} aria-hidden="true">
        <span className={`${s.iran} font-medium`}>ایران</span>
        <span>{faDigits(p.region)}</span>
      </span>
    </span>
  );
}
