"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { HOME, endSession, requireRole, startSession } from "@/lib/auth";
import { DEMO } from "@/lib/demo-data";
import { CAR_MODELS, ITEMS, OIL_BRANDS, OIL_GRADES } from "@/lib/catalog";
import { faNumber, latinDigits, makePlate, normalizePhone } from "@/lib/format";
import { nextDue } from "@/lib/service";

const CODE_TTL = 2 * 60 * 1000;
const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// Only follow redirects inside this site.
const safeNext = (next) => (typeof next === "string" && /^\/(?!\/)/.test(next) ? next : null);

// ---------- login ----------

// Step 1: a 4-digit code by text message. This demo has no SMS panel, so the code is
// returned and shown on screen; with Kavenegar or similar it would be sent instead.
export async function requestCode(prev, formData) {
  const phone = normalizePhone(formData.get("phone"));
  if (!phone) return { error: "شماره‌ی موبایل را درست وارد کنید؛ مثل ۰۹۱۲۱۲۳۴۵۶۷." };

  const code = String(crypto.randomInt(1000, 10000));
  await prisma.loginCode.deleteMany({ where: { phone } });
  await prisma.loginCode.create({ data: { phone, code, expiresAt: new Date(Date.now() + CODE_TTL) } });
  return { phone, demoCode: code };
}

// Step 2: check the code. A new number signs up as a customer.
export async function verifyCode(prev, formData) {
  const phone = normalizePhone(formData.get("phone"));
  const code = latinDigits(formData.get("code")).trim();
  const found =
    phone && (await prisma.loginCode.findFirst({ where: { phone, code, expiresAt: { gt: new Date() } } }));
  if (!found) return { ...prev, error: "کد درست نیست یا منقضی شده است." };

  await prisma.loginCode.deleteMany({ where: { phone } });
  const user =
    (await prisma.user.findUnique({ where: { phone } })) ??
    (await prisma.user.create({ data: { role: "customer", name: "مشتری روغن‌نامه", phone } }));
  await startSession(user);
  const next = safeNext(formData.get("next"));
  redirect(next?.startsWith(HOME[user.role]) ? next : HOME[user.role]);
}

// One-click entry for each role, so visitors can try the demo without a phone number.
export async function demoLogin(formData) {
  const role = formData.get("role");
  if (!DEMO[role]) return;
  const user = await prisma.user.findUnique({ where: { phone: DEMO[role] } });
  if (!user) redirect("/?reset=1");
  await startSession(user);
  redirect(HOME[role]);
}

export async function logout() {
  await endSession();
  redirect("/");
}

// ---------- shop ----------

// Find a car by its plate or sticker code before logging a service.
export async function findCar(prev, formData) {
  await requireRole("shop");
  const plate = makePlate({
    two: formData.get("plate_two"),
    letter: formData.get("plate_letter"),
    three: formData.get("plate_three"),
    region: formData.get("plate_region"),
  });
  if (!plate) return { error: "پلاک کامل نیست: دو رقم، حرف، سه رقم و کد شهر." };

  const car = await prisma.car.findFirst({
    where: { plate },
    include: { owner: { select: { name: true, phone: true } }, services: { orderBy: { date: "desc" }, take: 1 } },
  });
  return car ? { car } : { newPlate: plate };
}

export async function logService(prev, formData) {
  const session = await requireRole("shop");
  const get = (key) => String(formData.get(key) ?? "").trim();

  const odometer = Number(latinDigits(get("odometer")).replace(/\D/g, ""));
  const oilBrand = get("oilBrand");
  const oilGrade = get("oilGrade");
  const oilLiters = Number(get("oilLiters"));
  const price = Number(latinDigits(get("price")).replace(/\D/g, ""));
  const items = formData.getAll("items").filter((k) => ITEMS.some((i) => i.key === k));

  if (!odometer || odometer > 2_000_000) return { error: "کیلومتر فعلی خودرو را وارد کنید." };
  if (!OIL_BRANDS.includes(oilBrand) || !OIL_GRADES.some((g) => g.grade === oilGrade)) return { error: "برند و گرید روغن را انتخاب کنید." };
  if (!(oilLiters > 0 && oilLiters <= 10)) return { error: "حجم روغن معتبر نیست." };
  if (!price) return { error: "مبلغ را وارد کنید." };

  let carId = Number(get("carId")) || null;
  if (carId) {
    const last = await prisma.service.findFirst({ where: { carId }, orderBy: { date: "desc" } });
    if (last && odometer < last.odometer) return { error: `کیلومتر کمتر از سرویس قبلی (${faNumber(last.odometer)}) است.` };
  } else {
    // A car the platform hasn't seen: register it and its owner, and give it a sticker code.
    const plate = get("plate");
    const phone = normalizePhone(get("ownerPhone"));
    const model = get("model");
    if (!/^\d{2}-[^-\d]+-\d{3}-\d{2}$/.test(plate)) return { error: "پلاک معتبر نیست." };
    if (!get("ownerName") || !phone) return { error: "نام و موبایل مالک را وارد کنید." };
    if (!CAR_MODELS.includes(model)) return { error: "مدل خودرو را انتخاب کنید." };

    const owner =
      (await prisma.user.findUnique({ where: { phone } })) ??
      (await prisma.user.create({ data: { role: "customer", name: get("ownerName"), phone } }));
    if (owner.role !== "customer") return { error: "این شماره متعلق به حساب مشتری نیست." };

    let code;
    do code = Array.from({ length: 8 }, () => CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]).join("");
    while (await prisma.car.findUnique({ where: { code } }));

    const year = Number(latinDigits(get("year"))) || null;
    const car = await prisma.car.create({ data: { code, plate, model, year, ownerId: owner.id, shopId: session.shopId } });
    carId = car.id;
  }

  await prisma.service.create({
    data: {
      carId,
      shopId: session.shopId,
      odometer,
      oilBrand,
      oilGrade,
      oilLiters,
      items: items.join(","),
      price,
      notes: get("notes") || null,
      ...nextDue(odometer, oilGrade),
    },
  });
  redirect(`/shop/cars/${carId}?saved=1`);
}

// Demo: marks the reminder as sent. With an SMS panel this would send the text message.
export async function remind(formData) {
  const session = await requireRole("shop");
  await prisma.service.updateMany({
    where: { id: Number(formData.get("serviceId")), shopId: session.shopId },
    data: { remindedAt: new Date() },
  });
  revalidatePath("/shop");
}

// ---------- platform admin ----------

export async function addShop(prev, formData) {
  await requireRole("admin");
  const get = (key) => String(formData.get(key) ?? "").trim();
  const phone = normalizePhone(get("phone"));
  if (!get("name") || !get("ownerName") || !get("city") || !get("address")) return { error: "همه‌ی بخش‌ها را پر کنید." };
  if (!phone) return { error: "شماره‌ی موبایل صاحب مغازه درست نیست." };
  if (await prisma.user.findUnique({ where: { phone } })) return { error: "این شماره قبلاً در سامانه ثبت شده است." };

  const shop = await prisma.shop.create({
    data: { name: get("name"), ownerName: get("ownerName"), phone, city: get("city"), address: get("address") },
  });
  await prisma.user.create({ data: { role: "shop", name: get("ownerName"), phone, shopId: shop.id } });
  revalidatePath("/admin");
  return { ok: `«${shop.name}» اضافه شد. صاحب مغازه با همین شماره وارد پنل می‌شود.` };
}

export async function toggleShop(formData) {
  await requireRole("admin");
  const id = Number(formData.get("shopId"));
  const shop = await prisma.shop.findUnique({ where: { id } });
  if (shop) await prisma.shop.update({ where: { id }, data: { active: !shop.active } });
  revalidatePath("/admin");
}
