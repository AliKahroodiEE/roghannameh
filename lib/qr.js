import QRCode from "qrcode";
import { headers } from "next/headers";

// Address the sticker points at, built from the request so it works on any domain.
export async function stickerUrl(code) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/c/${code}`;
}

export const qrSvg = (text) =>
  QRCode.toString(text, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#16181d", light: "#ffffff" } });
