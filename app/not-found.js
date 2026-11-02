import Link from "next/link";
import Brand from "@/components/Brand";
import { btn } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <Brand />
      <h1 className="text-2xl font-black">این صفحه پیدا نشد</h1>
      <p className="text-steel">اگر برچسب QR را اسکن کرده‌اید، ممکن است هنوز فعال نشده باشد؛ از تعویض‌روغنی بخواهید آن را ثبت کند.</p>
      <Link href="/" className={btn.primary}>
        صفحه‌ی اصلی
      </Link>
    </div>
  );
}
