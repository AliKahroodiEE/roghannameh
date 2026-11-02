"use client";

import { Printer } from "lucide-react";
import { btn } from "@/components/ui";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className={btn.primary}>
      <Printer className="size-4" />
      چاپ
    </button>
  );
}
