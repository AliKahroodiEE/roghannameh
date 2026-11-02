import { INTERVAL_MONTHS, intervalKm } from "./catalog.js";
import { daysUntil } from "./format.js";

// When the next change is due: by kilometres for the oil's grade, or by date, whichever comes first.
export function nextDue(odometer, grade, from = new Date()) {
  const nextDate = new Date(from);
  nextDate.setMonth(nextDate.getMonth() + INTERVAL_MONTHS);
  return { nextKm: odometer + intervalKm(grade), nextDate };
}

// "due" once the date has passed, "soon" within two weeks, otherwise "ok".
// progress is the share of the time window already used (0 to 1).
export function dueStatus(service) {
  const daysLeft = daysUntil(service.nextDate);
  const total = new Date(service.nextDate) - new Date(service.date);
  const progress = Math.min(1, Math.max(0, (Date.now() - new Date(service.date)) / total));
  const level = daysLeft < 0 ? "due" : daysLeft <= 14 ? "soon" : "ok";
  return { level, daysLeft, progress };
}

export const STATUS_TEXT = { ok: "به‌موقع", soon: "نزدیک موعد", due: "موعد گذشته" };
