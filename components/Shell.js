import Link from "next/link";
import { LogOut } from "lucide-react";
import Brand from "./Brand";
import { logout } from "@/app/actions";

// Frame for the three dashboards: header with who is signed in, tabs, and the page.
// On phones the tabs sit at the bottom, within thumb reach.
export default function Shell({ home, title, subtitle, tabs = [], children }) {
  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="no-print border-b border-line bg-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Brand href={home} small />
            <nav className="hidden gap-1 md:flex">
              {tabs.map(({ href, label }) => (
                <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-steel hover:bg-mist hover:text-ink">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left leading-tight">
              <p className="text-sm font-bold">{title}</p>
              {subtitle && <p className="text-xs text-steel" dir="auto">{subtitle}</p>}
            </div>
            <form action={logout}>
              <button className="grid size-10 place-items-center rounded-xl border border-line text-steel hover:text-ink" aria-label="خروج">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      {tabs.length > 0 && (
        <nav className="no-print fixed inset-x-0 bottom-0 z-20 grid border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-steel">
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
