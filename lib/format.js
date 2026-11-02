// Persian display helpers. Everything is stored with Latin digits and shown with Persian ones.

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export const faDigits = (value) => String(value ?? "").replace(/\d/g, (d) => FA_DIGITS[d]);

// Accepts Persian, Arabic and Latin digits; returns Latin digits only.
export const latinDigits = (value) =>
  String(value ?? "")
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

export const faNumber = (n) => Number(n).toLocaleString("fa-IR");
export const toman = (n) => `${faNumber(n)} تومان`;

const jalali = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "long", day: "numeric" });
const jalaliShort = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "2-digit", day: "2-digit" });
export const jDate = (d) => jalali.format(new Date(d));
export const jDateShort = (d) => jalaliShort.format(new Date(d));

const DAY = 24 * 60 * 60 * 1000;
export const daysAgo = (n) => new Date(Date.now() - n * DAY);
export const daysUntil = (d) => Math.ceil((new Date(d).getTime() - Date.now()) / DAY);

export function relativeDays(d) {
  const days = daysUntil(d);
  if (days === 0) return "امروز";
  if (days === 1) return "فردا";
  if (days === -1) return "دیروز";
  return days > 0 ? `${faNumber(days)} روز دیگر` : `${faNumber(-days)} روز پیش`;
}

// Plates are stored as "12-ب-345-67".
export function parsePlate(plate) {
  const [two = "", letter = "", three = "", region = ""] = String(plate ?? "").split("-");
  return { two, letter, three, region };
}

export function makePlate({ two, letter, three, region }) {
  const [a, b, c] = [two, three, region].map((v) => latinDigits(v).replace(/\D/g, ""));
  if (a.length !== 2 || b.length !== 3 || c.length !== 2 || !letter) return null;
  return `${a}-${letter}-${b}-${c}`;
}

export const plateText = (plate) => {
  const p = parsePlate(plate);
  return faDigits(`${p.two} ${p.letter} ${p.three} ایران ${p.region}`);
};

// 0912 345 6789 → stored as 09123456789.
export function normalizePhone(value) {
  let p = latinDigits(value).replace(/\D/g, "");
  if (p.startsWith("98")) p = `0${p.slice(2)}`;
  if (p.length === 10 && p.startsWith("9")) p = `0${p}`;
  return /^09\d{9}$/.test(p) ? p : null;
}

export const phoneText = (p) => faDigits(p ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : "");
export const maskedPhone = (p) => faDigits(p ? `${p.slice(0, 4)} ••• ${p.slice(7)}` : "");
