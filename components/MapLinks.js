import { MapPin } from "lucide-react";

// Route to the shop in whichever app the customer uses; works without JavaScript.
export default function MapLinks({ lat, lng, className = "" }) {
  if (lat == null || lng == null) return null;
  const apps = [
    ["نشان", `https://neshan.org/maps/@${lat},${lng},17z,0p`],
    ["بلد", `https://balad.ir/location?latitude=${lat}&longitude=${lng}&zoom=17`],
    ["گوگل‌مپ", `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`],
    ["ویز", `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`],
  ];
  return (
    <details className={`group relative ${className}`}>
      <summary className="inline-flex min-h-11 w-full cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 font-medium [&::-webkit-details-marker]:hidden">
        <MapPin className="size-4" />
        مسیریابی
      </summary>
      <div className="absolute inset-x-0 bottom-full z-10 mb-2 grid grid-cols-2 gap-1 rounded-xl border border-line bg-paper p-1.5 shadow-lg">
        {apps.map(([name, href]) => (
          <a key={name} href={href} target="_blank" rel="noopener" className="rounded-lg px-3 py-2.5 text-center text-sm hover:bg-mist">
            {name}
          </a>
        ))}
      </div>
    </details>
  );
}
