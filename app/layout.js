import localFont from "next/font/local";
import "./globals.css";

// Self-hosted so the site works on Iranian hosting without Google Fonts.
const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
});

export const metadata = {
  title: {
    default: "روغن‌نامه | دفترچه‌ی سرویس دیجیتال خودرو",
    template: "%s | روغن‌نامه",
  },
  description: "دفترچه‌ی سرویس خودرو با QR برای تعویض‌روغنی‌ها: آخرین تعویض روغن، اقلام مصرفی، موعد بعدی و راه تماس، با یک اسکن.",
};

export const viewport = {
  themeColor: "#f3f4f6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
