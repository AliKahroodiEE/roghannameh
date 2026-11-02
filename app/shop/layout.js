import { CarFront, LayoutDashboard, PlusCircle } from "lucide-react";
import Shell from "@/components/Shell";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

const TABS = [
  { href: "/shop", label: "داشبورد", Icon: LayoutDashboard },
  { href: "/shop/service/new", label: "ثبت سرویس", Icon: PlusCircle },
  { href: "/shop/cars", label: "خودروها", Icon: CarFront },
];

export default async function ShopLayout({ children }) {
  const session = await requireRole("shop");
  const shop = await prisma.shop.findUnique({ where: { id: session.shopId } });

  return (
    <Shell home="/shop" title={shop?.name ?? "مغازه"} subtitle={session.name} tabs={TABS}>
      {shop?.active ? (
        children
      ) : (
        <p className="rounded-2xl bg-due-soft p-6 text-center text-due">حساب این مغازه را مدیر سامانه غیرفعال کرده است.</p>
      )}
    </Shell>
  );
}
