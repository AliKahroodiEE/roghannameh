// Sample platform: three shops, ~30 cars with a year of service history, and demo logins.
// Used by `prisma/seed.js` and the nightly reset (app/api/cron/reset). Names, phone numbers
// and addresses are made up. A fixed random seed keeps the data the same on every reset.
import { CAR_MODELS, ITEMS, OIL_BRANDS, OIL_GRADES, PLATE_LETTERS, servicePrice } from "./catalog.js";
import { nextDue } from "./service.js";

export const DEMO = {
  admin: "09120000000",
  shop: "09121110001",
  customer: "09121234567",
  sampleCode: "K7Q2M9XD",
};

const SHOPS = [
  {
    name: "تعویض روغنی ستاره",
    ownerName: "رضا احمدی",
    phone: DEMO.shop,
    city: "تهران",
    address: "تهران، ستارخان، نرسیده به فلکه‌ی دوم، پلاک ۴۲",
    hours: "شنبه تا پنجشنبه ۸ تا ۲۰",
    lat: 35.7106,
    lng: 51.358,
    cars: 15,
  },
  {
    name: "روغن‌سرای پارس",
    ownerName: "مهدی کریمی",
    phone: "09121110002",
    city: "کرج",
    address: "کرج، عظیمیه، میدان مهران، جنب بانک ملت",
    hours: "شنبه تا پنجشنبه ۹ تا ۲۱",
    lat: 35.8327,
    lng: 50.9915,
    cars: 9,
  },
  {
    name: "سرویس‌کار نوین",
    ownerName: "حسین رضایی",
    phone: "09121110003",
    city: "اصفهان",
    address: "اصفهان، خیابان چهارباغ بالا، کوچه‌ی ۱۸",
    hours: "شنبه تا پنجشنبه ۸ تا ۱۹",
    lat: 32.6546,
    lng: 51.668,
    cars: 6,
  },
];

const FIRST = ["علی", "محمد", "مریم", "زهرا", "امیر", "نرگس", "حمید", "فاطمه", "سعید", "لیلا", "بهزاد", "نسترن", "کاوه", "الهام", "پویا", "شیما"];
const LAST = ["احمدی", "حسینی", "رضایی", "کاظمی", "موسوی", "جعفری", "صادقی", "نوری", "کریمی", "طاهری", "اکبری", "رحیمی"];

const IMPORTED = new Set(["توتال", "کاسترول", "شل", "موبیل"]);

const DAY = 24 * 60 * 60 * 1000;
const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// Small seeded random generator (mulberry32), so every reset gives the same demo.
function random(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function seedDemo(prisma) {
  const rand = random(1405);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const between = (min, max) => Math.floor(min + rand() * (max - min + 1));
  const code = () => Array.from({ length: 8 }, () => pick([...CODE_CHARS])).join("");
  const plate = () => `${between(11, 99)}-${pick(PLATE_LETTERS.slice(0, 13))}-${between(111, 999)}-${between(10, 99)}`;
  let phoneCounter = 3000000;

  await prisma.service.deleteMany();
  await prisma.car.deleteMany();
  await prisma.loginCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();

  await prisma.user.create({ data: { role: "admin", name: "مدیر سامانه", phone: DEMO.admin } });
  const sara = await prisma.user.create({ data: { role: "customer", name: "سارا محمدی", phone: DEMO.customer } });

  // A car's history: services every few months, ending `lastDaysAgo` days ago.
  function history(carId, shopId, { visits, lastDaysAgo, startKm, imported }) {
    const services = [];
    let date = new Date(Date.now() - (lastDaysAgo + (visits - 1) * between(85, 115)) * DAY);
    let odometer = startKm;
    for (let v = 0; v < visits; v++) {
      if (v === visits - 1) date = new Date(Date.now() - lastDaysAgo * DAY);
      const oilBrand = imported ? pick([...IMPORTED]) : pick(OIL_BRANDS.slice(0, 4));
      const oilGrade = imported ? pick(OIL_GRADES.slice(2)).grade : pick(OIL_GRADES.slice(0, 2)).grade;
      const oilLiters = pick([3.5, 4, 4, 4.5]);
      const items = ITEMS.map((i) => i.key).filter((key) => key === "oilFilter" || rand() < 0.22);
      date.setHours(between(9, 19), pick([0, 15, 30, 45]));
      services.push({
        carId,
        shopId,
        date: new Date(date),
        odometer,
        oilBrand,
        oilGrade,
        oilLiters,
        items: items.join(","),
        price: servicePrice({ oilBrand, oilLiters, items }),
        ...nextDue(odometer, oilGrade, date),
      });
      date = new Date(date.getTime() + between(80, 120) * DAY);
      odometer += between(4200, 8800);
    }
    return services;
  }

  const services = [];
  for (const [s, { cars, ...shopData }] of SHOPS.entries()) {
    const shop = await prisma.shop.create({ data: shopData });
    await prisma.user.create({ data: { role: "shop", name: shopData.ownerName, phone: shopData.phone, shopId: shop.id } });

    for (let c = 0; c < cars; c++) {
      const owner = await prisma.user.create({
        data: { role: "customer", name: `${pick(FIRST)} ${pick(LAST)}`, phone: `0912${phoneCounter++}` },
      });
      const imported = rand() < 0.3;
      const car = await prisma.car.create({
        data: {
          code: code(),
          plate: plate(),
          model: imported ? pick(CAR_MODELS.slice(13)) : pick(CAR_MODELS.slice(0, 13)),
          year: between(1390, 1404),
          ownerId: owner.id,
          shopId: shop.id,
        },
      });
      // Spread the last visits so the shop has cars due soon, overdue, and recent work this month.
      const lastDaysAgo = c < 4 ? between(1, 25) : c < 7 ? between(170, 200) : between(30, 165);
      services.push(...history(car.id, shop.id, { visits: between(2, 6), lastDaysAgo, startKm: between(15000, 140000), imported }));
    }

    // Sara's two cars, at two different shops: one recent, one due within the week.
    if (s < 2) {
      const car = await prisma.car.create({
        data: s === 0
          ? { code: DEMO.sampleCode, plate: "45-ج-712-77", model: "پژو ۲۰۶", year: 1398, ownerId: sara.id, shopId: shop.id }
          : { code: "P4H8W3ZN", plate: "18-س-296-68", model: "کیا سراتو", year: 1396, ownerId: sara.id, shopId: shop.id },
      });
      services.push(
        ...history(car.id, shop.id, s === 0
          ? { visits: 5, lastDaysAgo: 38, startKm: 61000, imported: false }
          : { visits: 3, lastDaysAgo: 176, startKm: 118000, imported: true }),
      );
    }
  }

  await prisma.service.createMany({ data: services });
  return { shops: SHOPS.length, services: services.length };
}
