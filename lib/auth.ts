import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "ducklog_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      (payload.role === "USER" || payload.role === "ADMIN")
    ) {
      return { userId: payload.userId, email: payload.email, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/**
 * There is no public sign-up flow — the single admin account is provisioned
 * from ADMIN_EMAIL / ADMIN_PASSWORD env vars and kept in sync on every login
 * attempt, so credentials never have to pass through chat or committed code.
 */
export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return;

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN", nickname: "admin" },
  });
}
