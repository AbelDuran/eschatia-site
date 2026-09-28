import { NextResponse } from "next/server";
import { appOrigin, authConfigured, cookieOptions, digest, randomToken, STATE_COOKIE } from "@/lib/auth";
import { database } from "@/lib/database";

export async function GET() {
  if (!authConfigured()) return NextResponse.redirect(new URL("/account?error=setup", appOrigin()));
  const state = randomToken();
  await database().query("DELETE FROM oauth_attempts WHERE expires_at<now()");
  await database().query("INSERT INTO oauth_attempts(state_hash,expires_at) VALUES($1,now()+interval '10 minutes')", [digest(state)]);
  const url = new URL("https://discord.com/oauth2/authorize");
  url.search = new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID!, redirect_uri: `${appOrigin()}/auth/discord/callback`, response_type: "code", scope: "identify", state, prompt: "consent" }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, { ...cookieOptions, maxAge: 600 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

