// What a shop can log in one visit. Keys are stored in Service.items; labels are shown.
export const ITEMS = [
  { key: "oilFilter", label: "فیلتر روغن" },
  { key: "airFilter", label: "فیلتر هوا" },
  { key: "cabinFilter", label: "فیلتر کابین" },
  { key: "fuelFilter", label: "فیلتر بنزین" },
  { key: "gearboxOil", label: "روغن گیربکس" },
  { key: "brakeFluid", label: "روغن ترمز" },
  { key: "coolant", label: "ضدیخ" },
  { key: "sparkPlugs", label: "شمع" },
];

const LABELS = Object.fromEntries(ITEMS.map((i) => [i.key, i.label]));
export const itemLabel = (key) => LABELS[key] ?? key;
export const parseItems = (items) => (items ? items.split(",").filter((k) => LABELS[k]) : []);

export const OIL_BRANDS = ["بهران", "ایرانول", "اسپیدی", "سپاهان", "توتال", "کاسترول", "شل", "موبیل"];

// Grade → kilometres until the next change (mineral oils sooner, synthetics later).
export const OIL_GRADES = [
  { grade: "20W-50", km: 5000 },
  { grade: "10W-40", km: 7000 },
  { grade: "5W-30", km: 10000 },
  { grade: "5W-40", km: 10000 },
  { grade: "0W-20", km: 10000 },
];
export const intervalKm = (grade) => OIL_GRADES.find((g) => g.grade === grade)?.km ?? 5000;

// The date limit also applies when the car is barely driven: oil ages even when parked.
export const INTERVAL_MONTHS = 6;

export const CAR_MODELS = [
  "پژو ۲۰۶",
  "پژو ۴۰۵",
  "پژو پارس",
  "سمند",
  "دنا پلاس",
  "پراید ۱۳۱",
  "تیبا",
  "ساینا",
  "کوییک",
  "شاهین",
  "تارا",
  "رانا",
  "ال‌نود",
  "هایما S7",
  "کیا سراتو",
  "هیوندای النترا",
  "تویوتا کرولا",
  "جک S5",
];

// Letters used on ordinary Iranian plates.
export const PLATE_LETTERS = ["ب", "ج", "د", "س", "ص", "ط", "ق", "ل", "م", "ن", "و", "هـ", "ی", "الف", "پ", "ت", "ث", "ز", "ش", "ع", "ک", "گ"];

// Rough 1405 prices in toman, used to suggest a total on the service form (the shop can change it).
const PER_LITER = { بهران: 290000, ایرانول: 300000, اسپیدی: 330000, سپاهان: 270000, توتال: 720000, کاسترول: 780000, شل: 760000, موبیل: 850000 };
const ITEM_PRICE = { oilFilter: 260000, airFilter: 310000, cabinFilter: 280000, fuelFilter: 230000, gearboxOil: 1200000, brakeFluid: 350000, coolant: 450000, sparkPlugs: 900000 };
const LABOR = 150000;

export function servicePrice({ oilBrand, oilLiters, items }) {
  const oil = (PER_LITER[oilBrand] ?? 0) * oilLiters;
  const parts = items.reduce((sum, key) => sum + (ITEM_PRICE[key] ?? 0), 0);
  return Math.round((oil + parts + LABOR) / 10000) * 10000;
}
