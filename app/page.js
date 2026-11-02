import Link from "next/link";
import { BellRing, ClipboardCheck, ScanLine, ShieldCheck } from "lucide-react";
import Brand from "@/components/Brand";
import Plate from "@/components/Plate";
import DemoLogins from "@/components/DemoLogins";
import { btn } from "@/components/ui";
import { DEMO } from "@/lib/demo-data";
import { qrSvg, stickerUrl } from "@/lib/qr";

const STEPS = [
  { Icon: ClipboardCheck, title: "ثبت سرویس در یک دقیقه", text: "پلاک را می‌زنید، روغن و فیلترها را انتخاب می‌کنید؛ مبلغ و موعد بعدی خودکار حساب می‌شود." },
  { Icon: ScanLine, title: "برچسب QR روی خودرو", text: "به‌جای برچسب کاغذی که پاک می‌شود، یک QR ماندگار؛ با هر گوشی و بدون نصب برنامه باز می‌شود." },
  { Icon: BellRing, title: "یادآوری و برگشت مشتری", text: "مشتری‌هایی که موعدشان نزدیک است جدا می‌شوند تا با یک پیامک دوباره به مغازه‌ی خودتان برگردند." },
  { Icon: ShieldCheck, title: "هر نقش، فقط اطلاعات خودش", text: "اسکن عمومی فقط آخرین سرویس را نشان می‌دهد؛ شماره‌ی مالک و سوابق کامل پشت ورود پیامکی است." },
];

export default async function Home() {
  const sampleUrl = await stickerUrl(DEMO.sampleCode);
  const qr = await qrSvg(sampleUrl);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Brand />
        <Link href="/login" className="text-sm font-medium text-steel hover:text-ink">
          ورود با موبایل
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16">
        <section className="grid items-center gap-10 py-8 md:grid-cols-[1.15fr_1fr] md:py-14">
          <div>
            <p className="inline-block rounded-full bg-oil-soft px-3 py-1 text-sm font-medium text-oil-dark">برای تعویض‌روغنی‌ها</p>
            <h1 className="mt-4 text-[1.9rem] font-black leading-tight sm:text-4xl md:text-5xl">
              دفترچه‌ی سرویس خودرو،
              <br />
              روی گوشی مشتری
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-steel">
              هر خودرو یک برچسب QR می‌گیرد. با یک اسکن، آخرین تعویض روغن، اقلام مصرفی، هزینه، موعد بعدی و راه تماس با مغازه روی گوشی باز می‌شود.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/c/${DEMO.sampleCode}`} className={btn.oil}>
                <ScanLine className="size-5" />
                دیدن نمونه‌ی اسکن
              </Link>
              <a href="#demo" className={btn.ghost}>
                امتحان داشبوردها
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm md:h-[600px]">
            {/* What the scan opens: the real card page, live, in a phone frame (desktop only). */}
            <div className="absolute left-0 top-0 hidden h-[600px] w-[282px] overflow-hidden rounded-[42px] border-[9px] border-ink bg-mist shadow-2xl md:block">
              <iframe
                src={`/c/${DEMO.sampleCode}`}
                title="نمونه‌ی صفحه‌ای که با اسکن برچسب باز می‌شود"
                className="absolute left-0 top-0 h-[844px] w-[390px] origin-top-left scale-[0.677]"
              />
            </div>
            {/* The sticker as it would sit on the windscreen. */}
            <Link
              href={`/c/${DEMO.sampleCode}`}
              className="relative mx-auto block w-full max-w-[280px] rotate-2 rounded-3xl bg-ink p-5 text-white shadow-2xl transition hover:rotate-0 md:absolute md:bottom-6 md:right-0 md:w-[220px] md:-rotate-3 md:p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-black">روغن‌نامه</span>
                <span className="text-xs text-white/60">تعویض روغنی ستاره</span>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 md:mt-3 md:p-3 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
              <div className="mt-4 flex items-center justify-between gap-3 md:mt-3 md:flex-col md:items-start md:gap-2">
                <span className="text-sm leading-6 text-white/80 md:text-xs md:leading-5">برای دیدن سوابق سرویس، اسکن کنید</span>
                <Plate plate="45-ج-712-77" size="sm" />
              </div>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 py-6 sm:grid-cols-2">
          {STEPS.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line bg-paper p-5">
              <Icon className="size-6 text-oil-dark" />
              <h2 className="mt-3 font-bold">{title}</h2>
              <p className="mt-1.5 text-sm leading-7 text-steel">{text}</p>
            </div>
          ))}
        </section>

        <section id="demo" className="scroll-mt-6 py-8">
          <h2 className="text-2xl font-black">سه داشبورد، سه سطح دسترسی</h2>
          <p className="mt-2 text-steel">بدون رمز وارد هر نقش شوید و ببینید هر کدام چه چیزی می‌بیند.</p>
          <div className="mt-5">
            <DemoLogins />
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-sm text-steel">
        <p>نمونه‌کار نمایشی؛ نام‌ها، شماره‌ها و نشانی‌ها ساختگی‌اند و داده‌ها هر شب به حالت اول برمی‌گردند.</p>
        <p className="mt-1">طراحی و توسعه: علی کهرودی</p>
      </footer>
    </div>
  );
}
