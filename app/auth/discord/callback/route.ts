import { NextRequest, NextResponse } from "next/server";
import * as oauth from "oauth4webapi";
import { z } from "zod";
import { appOrigin, authConfigured, cookieOptions, digest, randomToken, SESSION_COOKIE, STATE_COOKIE } from "@/lib/auth";
import { database } from "@/lib/database";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/account?error=discord", appOrigin()));
  response.cookies.set(STATE_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  if (!authConfigured()) return response;
  try {
    const state = request.cookies.get(STATE_COOKIE)?.value;
    if (!state || !/^[a-f0-9]{64}$/.test(state)) return response;
    const server: oauth.AuthorizationServer = { issuer: "https://discord.com", authorization_endpoint: "https://discord.com/oauth2/authorize", token_endpoint: "https://discord.com/api/oauth2/token" };
    const client: oauth.Client = { client_id: process.env.DISCORD_CLIENT_ID! };
    const params = oauth.validateAuthResponse(server, client, request.nextUrl, state);
    const consumed = await database().query("DELETE FROM oauth_attempts WHERE state_hash=$1 AND expires_at>now() RETURNING state_hash", [digest(state)]);
    if (!consumed.length) return response;
    const tokenResponse = await oauth.authorizationCodeGrantRequest(server, client, oauth.ClientSecretPost(process.env.DISCORD_CLIENT_SECRET!), params, `${appOrigin()}/auth/discord/callback`, oauth.nopkce, { signal: AbortSignal.timeout(15000) });
    const tokens = await oauth.processAuthorizationCodeResponse(server, client, tokenResponse);
    const profileResponse = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${tokens.access_token}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!profileResponse.ok) return response;
    const profile = z.object({ id: z.string().regex(/^\d{17,20}$/), username: z.string().max(100), global_name: z.string().nullable().optional(), avatar: z.string().regex(/^[a-zA-Z0-9_]+$/).nullable() }).parse(await profileResponse.json());
    const avatar = profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : "";
    const token = randomToken();
    await database().transaction(async db => {
      await db.query(`INSERT INTO users(id,name,discord_name,avatar) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET discord_name=EXCLUDED.discord_name,avatar=EXCLUDED.avatar`, [profile.id, (profile.global_name || profile.username).slice(0,100), profile.username, avatar]);
      await db.query("DELETE FROM sessions WHERE expires_at<now()");
      const old = request.cookies.get(SESSION_COOKIE)?.value;
      if (old) await db.query("DELETE FROM sessions WHERE token_hash=$1", [digest(old)]);
      await db.query("INSERT INTO sessions(token_hash,user_id,expires_at,device) VALUES($1,$2,now()+interval '14 days',$3)", [digest(token), profile.id, (request.headers.get("user-agent") || "Неизвестное устройство").slice(0,300)]);
    });
    // Discord tokens are used only for this login and are never stored.
    response.headers.set("Location", new URL("/account", appOrigin()).href);
    response.cookies.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: 60*60*24*14 });
  } catch { /* No codes, tokens or provider responses in application logs. */ }
  return response;
}
