import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "rn_session";
const WEEK = 7 * 24 * 60 * 60;
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET);

export const HOME = { admin: "/admin", shop: "/shop", customer: "/me" };

// Call from a Server Action or Route Handler (the only places cookies can be set).
export async function startSession(user) {
  const token = await new SignJWT({ role: user.role, shopId: user.shopId ?? null, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setExpirationTime(`${WEEK}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: WEEK,
    path: "/",
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { userId: Number(payload.sub), role: payload.role, shopId: payload.shopId, name: payload.name };
  } catch {
    return null;
  }
}

// Each dashboard shows only its own role's data; anyone else goes to the login page.
export async function requireRole(role) {
  const session = await getSession();
  if (session?.role !== role) redirect(`/login?next=${HOME[role]}`);
  return session;
}
