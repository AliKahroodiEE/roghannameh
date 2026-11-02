import Brand from "@/components/Brand";
import DemoLogins from "@/components/DemoLogins";
import LoginForm from "./LoginForm";

export const metadata = { title: "ورود" };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-10">
      <Brand />
      <h1 className="mt-8 text-2xl font-black">ورود با شماره‌ی موبایل</h1>
      <p className="mt-2 text-sm leading-6 text-steel">مشتری، صاحب مغازه یا مدیر سامانه؛ همه با کد پیامکی وارد می‌شوند و هر کس فقط داشبورد خودش را می‌بیند.</p>
      <LoginForm next={next} />
      <div className="mt-10">
        <p className="mb-3 text-sm font-medium text-steel">یا بدون شماره، با حساب‌های نمایشی:</p>
        <DemoLogins compact />
      </div>
    </div>
  );
}
