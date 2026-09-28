import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { validateDiscordCallback } from "../lib/discord-oauth";

const server = { issuer: "https://discord.com" };
const client = { client_id: "test-client" };
test("Discord callback accepts NextRequest and preserves state validation", () => {
  const request = new NextRequest("https://example.com/auth/discord/callback?code=test-code&state=expected-state");
  assert.equal(request.nextUrl instanceof URL, false);
  assert.equal(validateDiscordCallback(server, client, request, "expected-state").get("code"), "test-code");
  assert.throws(() => validateDiscordCallback(server, client, request, "wrong-state"));
  assert.throws(() => validateDiscordCallback(server, client, new NextRequest("https://example.com/auth/discord/callback?code=test-code"), "expected-state"));
});
