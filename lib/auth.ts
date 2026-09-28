import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { database, databaseConfigured } from "./database";
import { Actor, DomainError } from "./models";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-eschatia-session" : "eschatia-session";
export const STATE_COOKIE = process.env.NODE_ENV === "production" ? "__Host-eschatia-oauth" : "eschatia-oauth";
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
export function digest(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function randomToken() { return randomBytes(32).toString("hex"); }
export function authConfigured() { return databaseConfigured() && Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET && process.env.APP_URL && /^\d{17,20}$/.test(process.env.OWNER_DISCORD_ID || "")); }
export function appOrigin() {
  const url = new URL(process.env.APP_URL || "http://localhost:3000");
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error("Production APP_URL must use HTTPS");
  return url.origin;
}
export async function currentUser(): Promise<(Actor & { avatar: string; settings: Record<string, unknown> }) | null> {
  if (!databaseConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const [row] = await database().query<{ id: string; name: string; role: "player" | "admin"; avatar: string; settings: Record<string, unknown>; created_at: string }>(
    `SELECT u.id,u.name,u.role,u.avatar,u.settings,s.created_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()`, [digest(token)]);
  return row ? { ...row, role: row.id === process.env.OWNER_DISCORD_ID ? "owner" : row.role, authenticatedAt: new Date(row.created_at) } : null;
}
export async function requireUser() { const user = await currentUser(); if (!user) throw new DomainError("Войдите через Discord.", 401); return user; }
export function checkMutation(request: Request) {
  if (request.headers.get("origin") !== appOrigin()) throw new DomainError("Недопустимый источник запроса.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new DomainError("Ожидается JSON.", 415);
}

