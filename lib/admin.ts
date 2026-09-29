import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "cg_admin";

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is missing.");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function createAdminSession(email: string) {
  const value = `${email}.${Date.now()}`;
  const token = `${value}.${sign(value)}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7
  });
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const expected = sign(`${parts[0]}.${parts[1]}`);
  try {
    return timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected));
  } catch { return false; }
}

export async function destroyAdminSession() {
  (await cookies()).delete(COOKIE);
}