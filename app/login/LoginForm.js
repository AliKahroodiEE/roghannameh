"use client";

import { useActionState } from "react";
import { MessageSquareText } from "lucide-react";
import { requestCode, verifyCode } from "@/app/actions";
import { btn, input, label } from "@/components/ui";
import { faDigits, phoneText } from "@/lib/format";

export default function LoginForm({ next }) {
  const [sent, send, sending] = useActionState(requestCode, null);
  const [checked, check, checking] = useActionState(verifyCode, null);

  if (!sent?.phone) {
    return (
      <form key="send" action={send} className="mt-6">
        <label htmlFor="phone" className={label}>
          شماره‌ی موبایل
        </label>
        <input id="phone" name="phone" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="0912 123 4567" className={`${input} text-left`} required />
        {sent?.error && <p className="mt-2 text-sm text-due">{sent.error}</p>}
        <button disabled={sending} className={`${btn.primary} mt-4 w-full`}>
          {sending ? "در حال ارسال…" : "دریافت کد ورود"}
        </button>
      </form>
    );
  }

  return (
    <form key="check" action={check} className="mt-6">
      <input type="hidden" name="phone" value={sent.phone} />
      <input type="hidden" name="next" value={next ?? ""} />
      {/* Demo only: with an SMS panel connected, this box disappears and the code arrives by text. */}
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-oil-soft p-3 text-sm">
        <MessageSquareText className="mt-0.5 size-5 shrink-0 text-oil-dark" />
        <p>
          پیامک نمایشی به {phoneText(sent.phone)}: کد ورود شما <b className="text-lg tabular">{faDigits(sent.demoCode)}</b>
        </p>
      </div>
      <label htmlFor="code" className={label}>
        کد ۴ رقمی
      </label>
      <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" dir="ltr" maxLength={4} className={`${input} text-center text-2xl tracking-[0.5em]`} autoFocus required />
      {checked?.error && <p className="mt-2 text-sm text-due">{checked.error}</p>}
      <button disabled={checking} className={`${btn.primary} mt-4 w-full`}>
        {checking ? "در حال بررسی…" : "ورود"}
      </button>
    </form>
  );
}
