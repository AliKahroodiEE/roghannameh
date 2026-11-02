import Link from "next/link";

// The mark: an oil drop with the lines of a booklet page.
export function Mark({ className = "size-8" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 2.5c5.6 7.3 10 12.6 10 18a10 10 0 0 1-20 0c0-5.4 4.4-10.7 10-18Z" fill="var(--color-oil)" />
      <path d="M11.5 18.5h9M11.5 22h9M11.5 25.5h5.5" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Brand({ href = "/", small = false }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-black tracking-tight">
      <Mark className={small ? "size-6" : "size-8"} />
      <span className={small ? "text-base" : "text-xl"}>روغن‌نامه</span>
    </Link>
  );
}
